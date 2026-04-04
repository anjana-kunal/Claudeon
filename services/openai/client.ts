/**
 * OpenAI API Client with ChatGPT OAuth support
 * 
 * This creates an OpenAI client that:
 * 1. Uses ChatGPT OAuth tokens or API keys for authentication
 * 2. Converts Anthropic message format to OpenAI format
 * 3. Makes requests directly to OpenAI's API
 * 4. Supports Codex CLI authentication via ~/.codex/auth.json
 */

import OpenAI from 'openai'
import { OPENAI_OAUTH_CONFIG } from './config.js'
import { 
  getOpenAIAccessToken, 
  getOpenAIRefreshToken, 
  getOpenAIExchangedApiKey,
  loadOpenAIAuth,
  updateOpenAIExchangedApiKey,
  updateOpenAITokens,
  isOpenAIAuthValid 
} from './tokenStorage.js'
import { exchangeIdTokenForApiKey, refreshOpenAIToken } from './deviceCode.js'
import {
  resolveCodexApiCredentials,
  resolveProviderRequest,
  DEFAULT_CODEX_BASE_URL,
  parseChatgptAccountId,
} from './providerConfig.js'

type OpenAIClientError = Error & {
  status?: number
  code?: string
}

function getErrorStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const withStatus = error as { status?: unknown }
  if (typeof withStatus.status === 'number') {
    return withStatus.status
  }

  const withResponse = error as { response?: { status?: unknown } }
  if (typeof withResponse.response?.status === 'number') {
    return withResponse.response.status
  }

  return undefined
}


function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const withCode = error as { code?: unknown }
  if (typeof withCode.code === 'string') {
    return withCode.code
  }

  const withResponse = error as { response?: { data?: { error?: { code?: unknown } } } }
  if (typeof withResponse.response?.data?.error?.code === 'string') {
    return withResponse.response.data.error.code
  }

  return undefined
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function extractChatGPTAccountIdFromIdToken(idToken: string): string | null {
  try {
    const parts = idToken.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as {
      [key: string]: unknown
    }

    const authClaim = json['https://api.openai.com/auth'] as
      | {
          chatgpt_account_id?: unknown
          organizations?: Array<{ id?: unknown }>
        }
      | undefined

    if (typeof authClaim?.chatgpt_account_id === 'string' && authClaim.chatgpt_account_id) {
      return authClaim.chatgpt_account_id
    }

    const firstOrgId = authClaim?.organizations?.[0]?.id
    if (typeof firstOrgId === 'string' && firstOrgId) {
      return firstOrgId
    }
  } catch {
    // Fall through to null when token payload cannot be decoded.
  }

  return null
}

async function exchangeApiKeyWithRefreshFallback(idToken: string): Promise<string> {
  try {
    return await exchangeIdTokenForApiKey(idToken)
  } catch (error) {
    // id_token exchange can fail with 401 if OAuth state is stale.
    // Refresh once and retry exchange before requiring interactive login.
    if (getErrorStatusCode(error) !== 401) {
      throw error
    }

    const refreshToken = getOpenAIRefreshToken()
    if (!refreshToken) {
      throw new Error(
        'OpenAI session expired. Please run /login and choose "Sign in with ChatGPT" again.',
      )
    }

    const refreshed = await refreshOpenAIToken(refreshToken)
    updateOpenAITokens(refreshed)

    if (!refreshed.idToken) {
      throw new Error(
        'OpenAI OAuth refresh did not return id_token. Please run /login and choose "Sign in with ChatGPT" again.',
      )
    }

    return await exchangeIdTokenForApiKey(refreshed.idToken)
  }
}

/**
 * Get or create an OpenAI client with proper authentication
 * Supports multiple auth sources:
 * 1. OPENAI_API_KEY environment variable
 * 2. CODEX_API_KEY environment variable
 * 3. ~/.codex/auth.json (Codex CLI compatible)
 * 4. ~/.claudecode/openai-auth.json (native auth)
 */
export async function getOpenAIClient(): Promise<OpenAI> {
  // Check for API key first (simplest auth)
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey) {
    return new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || OPENAI_OAUTH_CONFIG.API_BASE_URL,
    })
  }

  // Check for Codex CLI credentials (env or auth.json)
  const codexCredentials = resolveCodexApiCredentials()
  if (codexCredentials.source !== 'none' && codexCredentials.apiKey) {
    const providerRequest = resolveProviderRequest()
    const clientOptions: ConstructorParameters<typeof OpenAI>[0] = {
      apiKey: codexCredentials.apiKey,
      baseURL: providerRequest.baseUrl,
    }
    
    // Add ChatGPT account ID header for Codex backend
    if (codexCredentials.accountId) {
      clientOptions.defaultHeaders = {
        'ChatGPT-Account-ID': codexCredentials.accountId,
      }
    }
    
    return new OpenAI(clientOptions)
  }

  // Check for stored auth
  let accessToken = getOpenAIAccessToken()
  
  if (!accessToken) {
    throw new Error(
      'Not authenticated with OpenAI. Run `claudecode` to log in with ChatGPT, ' +
      'or set OPENAI_API_KEY/CODEX_API_KEY environment variable.'
    )
  }

  // Check if token needs refresh
  if (!isOpenAIAuthValid()) {
    const refreshToken = getOpenAIRefreshToken()
    if (refreshToken) {
      try {
        const newTokens = await refreshOpenAIToken(refreshToken)
        updateOpenAITokens(newTokens)
        accessToken = newTokens.accessToken
      } catch (error) {
        throw new Error(
          'OpenAI session expired. Please run `claudecode` to log in again.'
        )
      }
    } else {
      throw new Error(
        'OpenAI session expired. Please run `claudecode` to log in again.'
      )
    }
  }

  let chatgptAccountId: string | null = null

  // For OAuth, prefer exchanged API key (Codex-compatible token-exchange from id_token).
  // If exchange fails with invalid_subject_token, fall back to OAuth access token.
  const auth = loadOpenAIAuth()
  if (auth?.authMethod === 'oauth') {
    chatgptAccountId = auth.tokens.idToken
      ? extractChatGPTAccountIdFromIdToken(auth.tokens.idToken)
      : null

    // IMPORTANT: For ChatGPT Plus users, use access_token directly instead of exchanging
    // The exchanged API key has quota limits, but the OAuth access token uses ChatGPT quota
    if (chatgptAccountId) {
      accessToken = auth.tokens.accessToken
    } else {
      // Only exchange if no ChatGPT account (using regular OpenAI account)
      let exchanged = getOpenAIExchangedApiKey()
      if (!exchanged) {
        const idToken = auth.tokens.idToken
        if (!idToken) {
          throw new Error(
            'OpenAI OAuth is missing id_token. Please run /login and choose "Sign in with ChatGPT" again.',
          )
        }

        try {
          exchanged = await exchangeApiKeyWithRefreshFallback(idToken)
          updateOpenAIExchangedApiKey(exchanged)
        } catch (error) {
          const code = getErrorCode(error)
          const message = getErrorMessage(error)
          const isInvalidSubjectToken =
            code === 'invalid_subject_token' ||
            message.includes('missing organization_id')

          if (!isInvalidSubjectToken) {
            throw error
          }

          const latestAuth = loadOpenAIAuth()
          if (latestAuth?.authMethod !== 'oauth') {
            throw error
          }

          accessToken = latestAuth.tokens.accessToken
        }
      }

      if (exchanged) {
        accessToken = exchanged
      }
    }
  }

  const clientOptions: ConstructorParameters<typeof OpenAI>[0] = {
    apiKey: accessToken,
    baseURL: process.env.OPENAI_BASE_URL || OPENAI_OAUTH_CONFIG.API_BASE_URL,
  }

  if (chatgptAccountId) {
    clientOptions.defaultHeaders = {
      'ChatGPT-Account-ID': chatgptAccountId,
    }
  }

  return new OpenAI(clientOptions)
}

/**
 * Convert Anthropic message format to OpenAI format
 */
export function convertAnthropicToOpenAI(
  messages: Array<{
    role: string
    content: string | Array<{ type: string; text?: string; [key: string]: unknown }>
  }>
): OpenAI.Chat.ChatCompletionMessageParam[] {
  return messages.map(msg => {
    // Handle content that's already a string
    if (typeof msg.content === 'string') {
      return {
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }
    }

    // Handle array content (Anthropic's content blocks)
    if (Array.isArray(msg.content)) {
      // For text-only content, join into a single string
      const textContent = msg.content
        .filter(block => block.type === 'text')
        .map(block => block.text || '')
        .join('\n')

      // Check for tool use blocks
      const toolUseBlocks = msg.content.filter(block => block.type === 'tool_use')
      const toolResultBlocks = msg.content.filter(block => block.type === 'tool_result')

      if (toolUseBlocks.length > 0) {
        // Convert tool use to OpenAI function call format
        return {
          role: 'assistant' as const,
          content: textContent || null,
          tool_calls: toolUseBlocks.map(block => ({
            id: block.id as string,
            type: 'function' as const,
            function: {
              name: block.name as string,
              arguments: JSON.stringify(block.input),
            },
          })),
        }
      }

      if (toolResultBlocks.length > 0) {
        // Tool results need to be sent as separate messages in OpenAI
        // For now, return as user message with tool output
        return {
          role: 'user' as const,
          content: toolResultBlocks.map(block => 
            `[Tool Result for ${block.tool_use_id}]: ${
              typeof block.content === 'string' 
                ? block.content 
                : JSON.stringify(block.content)
            }`
          ).join('\n'),
        }
      }

      return {
        role: msg.role as 'user' | 'assistant' | 'system',
        content: textContent,
      }
    }

    // Fallback
    return {
      role: msg.role as 'user' | 'assistant' | 'system',
      content: String(msg.content),
    }
  })
}

/**
 * Convert OpenAI response to Anthropic format
 */
export function convertOpenAIToAnthropic(
  response: OpenAI.Chat.ChatCompletion
): {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string } | { type: 'tool_use'; id: string; name: string; input: unknown }>
  model: string
  stop_reason: string | null
  usage: { input_tokens: number; output_tokens: number }
} {
  const choice = response.choices[0]
  const content: Array<{ type: 'text'; text: string } | { type: 'tool_use'; id: string; name: string; input: unknown }> = []

  // Add text content
  if (choice.message.content) {
    content.push({
      type: 'text',
      text: choice.message.content,
    })
  }

  // Add tool calls
  if (choice.message.tool_calls) {
    for (const toolCall of choice.message.tool_calls) {
      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.function.name,
        input: JSON.parse(toolCall.function.arguments || '{}'),
      })
    }
  }

  return {
    id: response.id,
    type: 'message',
    role: 'assistant',
    content,
    model: response.model,
    stop_reason: choice.finish_reason === 'stop' ? 'end_turn' 
      : choice.finish_reason === 'tool_calls' ? 'tool_use'
      : choice.finish_reason,
    usage: {
      input_tokens: response.usage?.prompt_tokens || 0,
      output_tokens: response.usage?.completion_tokens || 0,
    },
  }
}

/**
 * Convert Anthropic tools to OpenAI function format
 */
export function convertAnthropicToolsToOpenAI(
  tools: Array<{
    name: string
    description?: string
    input_schema?: unknown
  }>
): OpenAI.Chat.ChatCompletionTool[] {
  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters: tool.input_schema as Record<string, unknown> || { type: 'object', properties: {} },
    },
  }))
}

/**
 * Check if a model should use the Codex backend
 */
export function isCodexModel(model: string): boolean {
  const normalized = model.toLowerCase()
  return (
    normalized.includes('codex') ||
    normalized.includes('gpt-5') ||
    normalized === 'codexplan' ||
    normalized === 'codexspark'
  )
}

/**
 * Make a chat completion request using the Codex backend
 * This is used when the model requires the Codex API format
 */
export async function createCodexChatCompletion(options: {
  model: string
  messages: Array<{ role: string; content: string | unknown[] }>
  system?: string
  tools?: Array<{ name: string; description?: string; input_schema?: unknown }>
  max_tokens?: number
  temperature?: number
  signal?: AbortSignal
}): Promise<{
  id: string
  content: string
  toolCalls: Array<{ id: string; name: string; arguments: string }>
  usage: { input_tokens: number; output_tokens: number }
}> {
  // Import dynamically to avoid circular dependencies
  const { performCodexRequest, collectCodexResponse } = await import('./codexShim.js')
  const { resolveCodexApiCredentials, resolveProviderRequest } = await import('./providerConfig.js')
  
  const credentials = resolveCodexApiCredentials()
  if (!credentials.apiKey) {
    throw new Error(
      'Codex authentication required. Run /login and sign in with ChatGPT, ' +
      'or set CODEX_API_KEY environment variable.'
    )
  }
  
  const providerRequest = resolveProviderRequest({ model: options.model })
  
  const response = await performCodexRequest({
    request: providerRequest,
    credentials,
    params: {
      model: options.model,
      messages: options.messages,
      system: options.system,
      tools: options.tools,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      stream: true,
    },
    signal: options.signal,
  })
  
  const result = await collectCodexResponse(response)
  
  return {
    id: `codex-${Date.now()}`,
    content: result.content,
    toolCalls: result.toolCalls,
    usage: result.usage,
  }
}

