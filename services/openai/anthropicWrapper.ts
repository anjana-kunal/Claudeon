/**
 * Anthropic SDK Compatible Wrapper for OpenAI
 * 
 * This creates a client that mimics the Anthropic SDK interface but
 * internally uses OpenAI's API. This allows Claude Code to work with
 * OpenAI models without changing the entire codebase.
 * 
 * For Codex models (gpt-5.x-codex, codexplan, codexspark), it uses
 * the Codex Responses API at chatgpt.com/backend-api/codex/responses
 */

import OpenAI from 'openai'
import type Anthropic from '@anthropic-ai/sdk'
import { 
  getOpenAIClient, 
  convertAnthropicToOpenAI, 
  convertOpenAIToAnthropic,
  convertAnthropicToolsToOpenAI,
  isCodexModel,
} from './client.js'
import { OPENAI_OAUTH_CONFIG } from './config.js'
import { clearOpenAIExchangedApiKey, loadOpenAIAuth, isOpenAIAuthValid } from './tokenStorage.js'
import { 
  resolveCodexApiCredentials, 
  resolveProviderRequest 
} from './providerConfig.js'
import {
  performCodexRequest,
  collectCodexResponse,
  readCodexSseEvents,
} from './codexShim.js'

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

/**
 * Create a mock Anthropic client that uses OpenAI under the hood
 * 
 * Note: This is a partial implementation that covers the main use cases.
 * Some advanced Anthropic features may not be fully supported.
 */
export function createOpenAIAnthropicWrapper(): Anthropic {
  let openaiClient: OpenAI | null = null
  
  // Lazy initialization of OpenAI client
  const getClient = async (): Promise<OpenAI> => {
    if (!openaiClient) {
      openaiClient = await getOpenAIClient()
    }
    return openaiClient
  }

  const runWithOAuth401Recovery = async <T>(
    operation: (client: OpenAI) => Promise<T>
  ): Promise<T> => {
    try {
      return await operation(await getClient())
    } catch (error) {
      // A cached exchanged key can become stale while OAuth tokens are still valid.
      // Clear it and retry once so getOpenAIClient can re-exchange/refresh.
      if (getErrorStatusCode(error) !== 401) {
        throw error
      }

      const auth = loadOpenAIAuth()
      if (auth?.authMethod !== 'oauth') {
        throw error
      }

      clearOpenAIExchangedApiKey()
      openaiClient = null

      return await operation(await getClient())
    }
  }

  // Get model to use
  const resolveModel = (requestedModel?: string): string => {
    const model =
      requestedModel ||
      process.env.OPENAI_MODEL ||
      process.env.ANTHROPIC_MODEL ||
      'gpt-5.3-codex'
    // Remove 'openai/' prefix if present
    return model.replace(/^openai\//, '')
  }

  /**
   * Execute a request using the Codex Responses API
   * This is used for models like gpt-5.x-codex, codexplan, codexspark
   */
  const executeCodexRequest = async (
    params: {
      model: string
      max_tokens: number
      messages: Array<{ role: string; content: unknown }>
      system?: string | Array<{ type: string; text: string }>
      tools?: Array<{ name: string; description?: string; input_schema?: unknown }>
      stream?: boolean
      temperature?: number
      [key: string]: unknown
    },
    model: string,
    requestOptions?: { signal?: AbortSignal; headers?: Record<string, string> }
  ) => {
    const credentials = resolveCodexApiCredentials()
    if (!credentials.apiKey) {
      throw new Error(
        'Codex authentication required. Run /login and sign in with ChatGPT, ' +
        'or set CODEX_API_KEY environment variable.'
      )
    }

    const providerRequest = resolveProviderRequest({ model })
    
    // Extract system message
    const systemContent = params.system
      ? (typeof params.system === 'string'
          ? params.system
          : params.system.map(s => s.text).join('\n'))
      : undefined

    // Convert messages to format expected by codexShim
    const messages = params.messages.map(m => ({
      role: m.role,
      content: m.content as string | unknown[],
    }))

    const response = await performCodexRequest({
      request: providerRequest,
      credentials,
      params: {
        model,
        messages,
        system: systemContent,
        tools: params.tools,
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        stream: params.stream !== false,
      },
      signal: requestOptions?.signal,
    })

    if (params.stream) {
      return {
        data: createCodexStreamingResponse(response, model),
        request_id: undefined,
        response: new Response(null, { status: 200 }),
      }
    }

    // Non-streaming: collect the full response
    const result = await collectCodexResponse(response)
    
    // Convert to Anthropic format
    const content: Array<{ type: string; text?: string; id?: string; name?: string; input?: unknown }> = []
    
    if (result.content) {
      content.push({ type: 'text', text: result.content })
    }
    
    for (const toolCall of result.toolCalls) {
      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.name,
        input: JSON.parse(toolCall.arguments || '{}'),
      })
    }

    // Ensure content is never empty - add an empty text block if needed
    if (content.length === 0) {
      content.push({ type: 'text', text: '' })
    }

    return {
      id: `msg_codex_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      content,
      model,
      stop_reason: result.toolCalls.length > 0 ? 'tool_use' : 'end_turn',
      usage: {
        input_tokens: result.usage.input_tokens,
        output_tokens: result.usage.output_tokens,
      },
    }
  }

  // Create the beta.messages interface
  const messagesApi = {
    create: (params: {
      model: string
      max_tokens: number
      messages: Array<{ role: string; content: unknown }>
      system?: string | Array<{ type: string; text: string }>
      tools?: Array<{ name: string; description?: string; input_schema?: unknown }>
      tool_choice?: unknown
      stream?: boolean
      temperature?: number
      metadata?: unknown
      [key: string]: unknown
    }, requestOptions?: { signal?: AbortSignal; headers?: Record<string, string> }) => {
      const execute = async () => {
        const model = resolveModel(params.model)
        
        // Check if this is a Codex model that needs the Codex backend
        if (isCodexModel(model)) {
          return executeCodexRequest(params, model, requestOptions)
        }

        // Convert messages
        const openaiMessages = convertAnthropicToOpenAI(
          params.messages as Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>
        )

        // Add system message if present
        if (params.system) {
          const systemContent = typeof params.system === 'string'
            ? params.system
            : params.system.map(s => s.text).join('\n')
          openaiMessages.unshift({
            role: 'system',
            content: systemContent,
          })
        }

        // Convert tools if present
        const tools = params.tools
          ? convertAnthropicToolsToOpenAI(params.tools)
          : undefined

        if (params.stream) {
          const stream = await runWithOAuth401Recovery(client =>
            client.chat.completions.create(
              {
                model,
                messages: openaiMessages,
                max_tokens: params.max_tokens,
                tools,
                temperature: params.temperature,
                stream: true,
              },
              {
                signal: requestOptions?.signal,
                headers: requestOptions?.headers,
              },
            )
          )

          return {
            data: createStreamingResponse(stream, model),
            request_id: (stream as { _request_id?: string })._request_id,
            response: new Response(null, { status: 200 }),
          }
        }

        const response = await runWithOAuth401Recovery(client =>
          client.chat.completions.create(
            {
              model,
              messages: openaiMessages,
              max_tokens: params.max_tokens,
              tools,
              temperature: params.temperature,
            },
            {
              signal: requestOptions?.signal,
              headers: requestOptions?.headers,
            },
          )
        )

        return convertOpenAIToAnthropic(response)
      }

      if (params.stream) {
        const withResponsePromise = execute() as Promise<{
          data: AsyncIterable<unknown>
          request_id?: string
          response: Response
        }>
        const apiPromise = withResponsePromise.then(result => result.data) as Promise<
          AsyncIterable<unknown>
        > & {
          withResponse: () => Promise<{
            data: AsyncIterable<unknown>
            request_id?: string
            response: Response
          }>
        }
        apiPromise.withResponse = () => withResponsePromise
        return apiPromise
      }

      return execute()
    },
  }

  // Create the wrapper object that mimics Anthropic SDK
  const wrapper = {
    beta: {
      messages: messagesApi,
    },
    messages: messagesApi,
    
    // Other properties that might be accessed
    apiKey: process.env.OPENAI_API_KEY || 'oauth-token',
    baseURL: OPENAI_OAUTH_CONFIG.API_BASE_URL,
  }

  return wrapper as unknown as Anthropic
}

/**
 * Create a streaming response that mimics Anthropic's streaming format
 */
function createStreamingResponse(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  model: string
): AsyncIterable<unknown> {
  // Convert OpenAI stream to Anthropic-like events
  return (async function* () {
    let currentText = ''
    let messageId = ''
    
    // Emit message_start
    yield {
      type: 'message_start',
        message: {
          id: 'msg_' + Date.now(),
          type: 'message',
          role: 'assistant',
          content: [],
          model,
        stop_reason: null,
        usage: { input_tokens: 0, output_tokens: 0 },
      },
    }

    // Emit content_block_start
    yield {
      type: 'content_block_start',
      index: 0,
      content_block: { type: 'text', text: '' },
    }

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      
      if (delta?.content) {
        currentText += delta.content
        yield {
          type: 'content_block_delta',
          index: 0,
          delta: { type: 'text_delta', text: delta.content },
        }
      }

      // Handle tool calls in streaming
      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          yield {
            type: 'content_block_start',
            index: (toolCall.index || 0) + 1,
            content_block: {
              type: 'tool_use',
              id: toolCall.id || '',
              name: toolCall.function?.name || '',
              input: {},
            },
          }
          if (toolCall.function?.arguments) {
            yield {
              type: 'content_block_delta',
              index: (toolCall.index || 0) + 1,
              delta: {
                type: 'input_json_delta',
                partial_json: toolCall.function.arguments,
              },
            }
          }
        }
      }

      if (chunk.choices[0]?.finish_reason) {
        messageId = chunk.id
      }
    }

    // Emit content_block_stop
    yield {
      type: 'content_block_stop',
      index: 0,
    }

    // Emit message_delta with stop reason
    yield {
      type: 'message_delta',
      delta: { stop_reason: 'end_turn' },
      usage: { output_tokens: Math.ceil(currentText.length / 4) },
    }

    // Emit message_stop
    yield {
      type: 'message_stop',
    }
  })()
}

/**
 * Create a streaming response from Codex Responses API
 * Converts Codex SSE events to Anthropic-like streaming events
 */
function createCodexStreamingResponse(
  response: Response,
  model: string
): AsyncIterable<unknown> {
  return (async function* () {
    let currentText = ''
    let messageId = `msg_codex_${Date.now()}`
    let contentBlockIndex = 0
    const toolCallBlocks = new Map<number, { id: string; name: string; argumentsText: string }>()

    // Emit message_start
    yield {
      type: 'message_start',
      message: {
        id: messageId,
        type: 'message',
        role: 'assistant',
        content: [],
        model,
        stop_reason: null,
        usage: { input_tokens: 0, output_tokens: 0 },
      },
    }

    // Emit initial content_block_start for text
    yield {
      type: 'content_block_start',
      index: 0,
      content_block: { type: 'text', text: '' },
    }
    contentBlockIndex = 1

    let stopReason = 'end_turn'
    let outputTokens = 0
    let inputTokens = 0

    try {
      for await (const sseEvent of readCodexSseEvents(response)) {
        const eventType = sseEvent.event
        const eventData = sseEvent.data as Record<string, unknown>
        
        // Handle text streaming
        if (eventType === 'response.output_text.delta') {
          const delta = (eventData.delta as string) || ''
          currentText += delta
          yield {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text_delta', text: delta },
          }
        }
        
        // Handle tool call additions
        if (eventType === 'response.output_item.added') {
          const item = eventData.item as Record<string, unknown> | undefined
          if (item?.type === 'function_call' || item?.type === 'tool_call') {
            const toolBlockIndex = contentBlockIndex++
            const callId = (item.call_id as string) || (item.id as string) || `call_${Date.now()}_${toolBlockIndex}`
            const name = (item.name as string) || ''
            
            toolCallBlocks.set(toolBlockIndex, { id: callId, name, argumentsText: '' })
            
            yield {
              type: 'content_block_start',
              index: toolBlockIndex,
              content_block: {
                type: 'tool_use',
                id: callId,
                name,
                input: {},
              },
            }
          }
        }

        // Handle function call arguments delta
        if (eventType === 'response.function_call_arguments.delta') {
          const delta = (eventData.delta as string) || ''
          // Find the most recent tool call block
          const lastToolIndex = contentBlockIndex - 1
          const toolBlock = toolCallBlocks.get(lastToolIndex)
          if (toolBlock) {
            toolBlock.argumentsText += delta
            yield {
              type: 'content_block_delta',
              index: lastToolIndex,
              delta: {
                type: 'input_json_delta',
                partial_json: delta,
              },
            }
          }
        }

        // Handle completion
        if (eventType === 'response.completed') {
          const responseData = eventData.response as Record<string, unknown> | undefined
          const output = responseData?.output as Array<Record<string, unknown>> | undefined
          const outputItem = output?.[0]
          if (outputItem?.type === 'function_call') {
            stopReason = 'tool_use'
          }
          
          // Extract usage from response
          const usage = responseData?.usage as Record<string, number> | undefined
          if (usage) {
            inputTokens = usage.input_tokens || 0
            outputTokens = usage.output_tokens || 0
          }
        }

        // Handle incomplete/failed
        if (eventType === 'response.incomplete' || eventType === 'response.failed') {
          stopReason = 'end_turn'
          if (eventType === 'response.failed') {
            const errorData = eventData.error as Record<string, unknown> | undefined
            const errorMsg = (errorData?.message as string) || 'Unknown Codex API error'
            yield {
              type: 'content_block_delta',
              index: 0,
              delta: { type: 'text_delta', text: `\n\nError: ${errorMsg}` },
            }
          }
        }
      }
    } catch (err) {
      // Stream error - emit what we have
      const errorMsg = err instanceof Error ? err.message : String(err)
      yield {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: `\n\nStream error: ${errorMsg}` },
      }
    }

    // Close text block
    yield {
      type: 'content_block_stop',
      index: 0,
    }

    // Close any tool blocks
    for (const [blockIndex] of toolCallBlocks) {
      yield {
        type: 'content_block_stop',
        index: blockIndex,
      }
    }

    // Emit message_delta with stop reason
    yield {
      type: 'message_delta',
      delta: { stop_reason: stopReason },
      usage: { output_tokens: outputTokens || Math.ceil(currentText.length / 4) },
    }

    // Emit message_stop
    yield {
      type: 'message_stop',
    }
  })()
}

/**
 * Check if we should use the OpenAI wrapper
 */
export function shouldUseOpenAIWrapper(): boolean {
  const useOpenAI = process.env.CLAUDE_CODE_USE_OPENAI === 'true' ||
                    process.env.CLAUDE_CODE_USE_OPENAI === '1'
  
  // Check for API key or OAuth tokens
  const hasApiKey = !!process.env.OPENAI_API_KEY
  const hasOAuthTokens = isOpenAIAuthValid()
  
  // Auto-enable if we have OpenAI auth but flag isn't set
  if (!useOpenAI && (hasApiKey || hasOAuthTokens)) {
    process.env.CLAUDE_CODE_USE_OPENAI = 'true'
    return true
  }
  
  // Only use wrapper if explicitly enabled or we have auth
  if (!useOpenAI) return false
  
  return hasApiKey || hasOAuthTokens
}
