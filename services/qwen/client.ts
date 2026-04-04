import type Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import {
  convertAnthropicToOpenAI,
  convertAnthropicToolsToOpenAI,
} from '../openai/client.js'
import { refreshQwenToken } from './deviceCode.js'
import { QWEN_OAUTH_CONFIG } from './config.js'
import {
  getQwenRefreshToken,
  loadQwenAuth,
  updateQwenTokens,
} from './tokenStorage.js'
import type { QwenTokens } from './types.js'
import { isEnvTruthy } from '../../utils/envUtils.js'

const QWEN_DEFAULT_MODEL = 'coder-model'
const QWEN_API_VERSION_SUFFIX = '/v1'
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000
const QWEN_DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.'
const QWEN_REAUTH_MESSAGE =
  'Qwen session expired or revoked. Please run /login and choose "Qwen / qwen.ai" again.'
const UNSUPPORTED_QWEN_SCHEMA_KEYS = new Set([
  'propertyNames',
  'patternProperties',
  'unevaluatedProperties',
  'dependentSchemas',
  'dependentRequired',
  'if',
  'then',
  'else',
])

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

function getErrorSearchText(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return ''
  }

  const parts: string[] = []
  const record = error as {
    message?: unknown
    error?: unknown
    response?: { data?: unknown }
  }

  if (typeof record.message === 'string') {
    parts.push(record.message)
  }

  if (typeof record.error === 'string') {
    parts.push(record.error)
  } else if (record.error && typeof record.error === 'object') {
    const nested = record.error as { message?: unknown; code?: unknown; type?: unknown }
    if (typeof nested.message === 'string') {
      parts.push(nested.message)
    }
    if (typeof nested.code === 'string') {
      parts.push(nested.code)
    }
    if (typeof nested.type === 'string') {
      parts.push(nested.type)
    }
  }

  const responseData = record.response?.data
  if (typeof responseData === 'string') {
    parts.push(responseData)
  } else if (responseData && typeof responseData === 'object') {
    try {
      parts.push(JSON.stringify(responseData))
    } catch {
      // ignore unstringifiable payloads
    }
  }

  return parts.join(' ').toLowerCase()
}

function isQwenAuthError(error: unknown): boolean {
  const status = getErrorStatusCode(error)
  if (status === 401 || status === 403) {
    return true
  }

  const text = getErrorSearchText(error)
  if (!text) {
    return false
  }

  return (
    text.includes('invalid_api_key') ||
    text.includes('invalid access token') ||
    text.includes('token expired') ||
    text.includes('token is no longer valid') ||
    text.includes('session has expired')
  )
}

function sanitizeQwenSchemaNode(schema: unknown): unknown {
  if (!schema || typeof schema !== 'object') {
    return schema
  }
  if (Array.isArray(schema)) {
    return schema.map(item => sanitizeQwenSchemaNode(item))
  }

  const record = { ...(schema as Record<string, unknown>) }
  for (const key of UNSUPPORTED_QWEN_SCHEMA_KEYS) {
    if (key in record) {
      delete record[key]
    }
  }

  const hasObjectProperties =
    record.properties &&
    typeof record.properties === 'object' &&
    !Array.isArray(record.properties)

  if (hasObjectProperties) {
    const props = record.properties as Record<string, unknown>
    const sanitizedProps: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
      sanitizedProps[key] = sanitizeQwenSchemaNode(value)
    }
    record.properties = sanitizedProps

    if (Array.isArray(record.required)) {
      const propertyKeys = new Set(Object.keys(sanitizedProps))
      record.required = record.required.filter(
        value => typeof value === 'string' && propertyKeys.has(value),
      )
    }
  } else if ('required' in record) {
    delete record.required
  }

  if ('items' in record) {
    record.items = sanitizeQwenSchemaNode(record.items)
  }

  for (const key of ['anyOf', 'oneOf', 'allOf'] as const) {
    if (Array.isArray(record[key])) {
      record[key] = (record[key] as unknown[]).map(item =>
        sanitizeQwenSchemaNode(item),
      )
    }
  }

  return record
}

function sanitizeQwenToolSchema(
  toolName: string,
  schema: unknown,
): Record<string, unknown> {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return { type: 'object', properties: {} }
  }

  // Runtime-populated AskUserQuestion fields (answers/metadata) are not model inputs.
  // Keep only "questions" to avoid provider-side schema rejections.
  if (toolName === 'AskUserQuestion') {
    const record = { ...(schema as Record<string, unknown>) }
    const properties = record.properties
    if (
      properties &&
      typeof properties === 'object' &&
      !Array.isArray(properties)
    ) {
      const propRecord = properties as Record<string, unknown>
      const questions = propRecord.questions
      if (questions !== undefined) {
        return sanitizeQwenSchemaNode({
          ...record,
          properties: { questions },
          required: ['questions'],
        }) as Record<string, unknown>
      }
    }
  }

  const sanitized = sanitizeQwenSchemaNode(schema)
  if (!sanitized || typeof sanitized !== 'object' || Array.isArray(sanitized)) {
    return { type: 'object', properties: {} }
  }
  return sanitized as Record<string, unknown>
}

function resolveQwenModel(requestedModel?: string): string {
  const raw =
    requestedModel ||
    process.env.QWEN_MODEL ||
    process.env.ANTHROPIC_MODEL ||
    QWEN_DEFAULT_MODEL

  const normalized = raw
    .replace(/^openai\//, '')
    .replace(/^qwen\//, '')
    .trim()
    .toLowerCase()

  // Qwen OAuth supports the fixed oauth model id `coder-model`.
  // Keep legacy aliases for backward compatibility with older saved settings.
  if (
    normalized === 'qwen3.6-plus' ||
    normalized === 'qwen3.5-plus' ||
    normalized === 'qwen3-coder-plus' ||
    normalized === 'qwen3-coder-next' ||
    normalized.startsWith('gpt-')
  ) {
    return 'coder-model'
  }

  return normalized || QWEN_DEFAULT_MODEL
}

function normalizeQwenBaseUrl(url: string): string {
  const trimmed = url.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith(QWEN_API_VERSION_SUFFIX)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}${QWEN_API_VERSION_SUFFIX}`
}

function getQwenBaseUrl(tokens: QwenTokens): string {
  // OAuth tokens from chat.qwen.ai work with portal.qwen.ai endpoint
  // (based on resource_url returned in OAuth response).
  // DashScope is for API key auth only.
  const resourceUrl = tokens.resourceUrl
  if (resourceUrl && resourceUrl.includes('portal.qwen.ai')) {
    return normalizeQwenBaseUrl(
      process.env.QWEN_BASE_URL || QWEN_OAUTH_CONFIG.PORTAL_API_BASE_URL,
    )
  }
  // Fallback to DashScope for API key auth
  return normalizeQwenBaseUrl(
    process.env.QWEN_BASE_URL || QWEN_OAUTH_CONFIG.API_BASE_URL,
  )
}

function getQwenUserAgent(): string {
  return `QwenCode/${MACRO.VERSION} (${process.platform}; ${process.arch})`
}

function getQwenDefaultHeaders(_usePortal: boolean): Record<string, string> {
  const userAgent = getQwenUserAgent()
  return {
    'User-Agent': userAgent,
    // portal.qwen.ai currently requires DashScope compatibility headers,
    // even for OAuth tokens issued by qwen.ai.
    'X-DashScope-CacheControl': 'enable',
    'X-DashScope-UserAgent': userAgent,
    'X-DashScope-AuthType': 'qwen-oauth',
  }
}

function hasUsableQwenAuth(): boolean {
  const auth = loadQwenAuth()
  if (!auth) {
    return false
  }
  return !!(auth.tokens.accessToken || auth.tokens.refreshToken)
}

export async function getQwenClient(): Promise<OpenAI> {
  const auth = loadQwenAuth()
  if (!auth) {
    throw new Error(
      'Not authenticated with Qwen. Run /login and choose "Qwen / qwen.ai".',
    )
  }

  let tokens = auth.tokens
  const isNearExpiry = tokens.expiresAt <= Date.now() + TOKEN_REFRESH_BUFFER_MS

  if (isNearExpiry) {
    const refreshToken = tokens.refreshToken
    if (!refreshToken) {
      throw new Error(QWEN_REAUTH_MESSAGE)
    }
    let refreshed: QwenTokens
    try {
      refreshed = await refreshQwenToken(refreshToken)
    } catch {
      throw new Error(QWEN_REAUTH_MESSAGE)
    }
    updateQwenTokens(refreshed)
    tokens = refreshed
  }

  if (!tokens.accessToken) {
    throw new Error(QWEN_REAUTH_MESSAGE)
  }

  const usePortal =
    !!tokens.resourceUrl && tokens.resourceUrl.includes('portal.qwen.ai')

  return new OpenAI({
    apiKey: tokens.accessToken,
    baseURL: getQwenBaseUrl(tokens),
    defaultHeaders: getQwenDefaultHeaders(usePortal),
  })
}

type WrappedResponse = {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<
    | { type: 'text'; text: string }
    | { type: 'tool_use'; id: string; name: string; input: unknown }
  >
  model: string
  stop_reason: string | null
  usage: { input_tokens: number; output_tokens: number }
}

function parseToolArguments(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return { raw }
  }
}

function convertQwenToAnthropic(
  response: OpenAI.Chat.ChatCompletion,
): WrappedResponse {
  const choice = response.choices[0]
  const content: WrappedResponse['content'] = []

  if (choice?.message?.content) {
    content.push({
      type: 'text',
      text: choice.message.content,
    })
  }

  if (choice?.message?.tool_calls) {
    for (const toolCall of choice.message.tool_calls) {
      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.function.name,
        input: parseToolArguments(toolCall.function.arguments || '{}'),
      })
    }
  }

  if (content.length === 0) {
    content.push({ type: 'text', text: '' })
  }

  return {
    id: response.id,
    type: 'message',
    role: 'assistant',
    content,
    model: response.model,
    stop_reason:
      choice?.finish_reason === 'stop'
        ? 'end_turn'
        : choice?.finish_reason === 'tool_calls'
          ? 'tool_use'
          : choice?.finish_reason || 'end_turn',
    usage: {
      input_tokens: response.usage?.prompt_tokens || 0,
      output_tokens: response.usage?.completion_tokens || 0,
    },
  }
}

function extractOpenAIContentText(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  const parts: string[] = []
  for (const item of content) {
    if (typeof item === 'string') {
      parts.push(item)
      continue
    }
    if (!item || typeof item !== 'object') {
      continue
    }
    const record = item as Record<string, unknown>
    if (typeof record.text === 'string') {
      parts.push(record.text)
      continue
    }
    if (typeof record.refusal === 'string') {
      parts.push(record.refusal)
    }
  }

  return parts.join('\n').trim()
}

function convertToolCallHistoryToAssistantText(
  message: OpenAI.Chat.ChatCompletionAssistantMessageParam,
): string {
  const contentText = extractOpenAIContentText(message.content)
  const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : []

  if (toolCalls.length === 0) {
    return contentText
  }

  const toolCallSummary = toolCalls
    .map(toolCall => {
      const name = toolCall.function?.name
      return name ? `[Tool call omitted: ${name}]` : '[Tool call omitted]'
    })
    .join('\n')

  return [contentText, toolCallSummary].filter(Boolean).join('\n').trim()
}

function sanitizeMessagesForQwenNoTools(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const sanitized: OpenAI.Chat.ChatCompletionMessageParam[] = []

  for (const message of messages) {
    switch (message.role) {
      case 'assistant': {
        const text = convertToolCallHistoryToAssistantText(
          message as OpenAI.Chat.ChatCompletionAssistantMessageParam,
        )
        if (!text) {
          continue
        }
        sanitized.push({ role: 'assistant', content: text })
        break
      }
      case 'tool': {
        const toolMessage = message as OpenAI.Chat.ChatCompletionToolMessageParam
        const toolText = extractOpenAIContentText(toolMessage.content)
        if (!toolText) {
          continue
        }
        sanitized.push({
          role: 'user',
          content: `[Tool result]: ${toolText}`,
        })
        break
      }
      case 'system': {
        const systemMessage = message as OpenAI.Chat.ChatCompletionSystemMessageParam
        const systemText = extractOpenAIContentText(systemMessage.content)
        if (!systemText) {
          continue
        }
        sanitized.push({ role: 'system', content: systemText })
        break
      }
      case 'user': {
        const userMessage = message as OpenAI.Chat.ChatCompletionUserMessageParam
        const userText = extractOpenAIContentText(userMessage.content)
        if (!userText) {
          continue
        }
        sanitized.push({ role: 'user', content: userText })
        break
      }
      default: {
        const fallbackText = extractOpenAIContentText(
          (message as { content?: unknown }).content,
        )
        if (!fallbackText) {
          continue
        }
        sanitized.push({ role: 'user', content: fallbackText })
      }
    }
  }

  return sanitized
}

function resolveQwenSystemPrompt(
  system?: string | Array<{ type: string; text: string }>,
): string {
  if (typeof system === 'string') {
    return system
  }
  if (Array.isArray(system)) {
    return system.map(block => block.text).join('\n')
  }
  return QWEN_DEFAULT_SYSTEM_PROMPT
}

function prependSystemPrompt(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  systemPrompt: string,
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const trimmed = systemPrompt.trim()
  if (!trimmed) {
    return messages
  }
  return [{ role: 'system', content: trimmed }, ...messages]
}

function createStreamingResponse(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  model: string,
): AsyncIterable<unknown> {
  return (async function* () {
    let currentText = ''
    let finishReason: OpenAI.Chat.Completions.ChatCompletionChunk.Choice['finish_reason'] | null =
      null
    const toolCalls = new Map<
      number,
      { id: string; name: string; arguments: string }
    >()

    yield {
      type: 'message_start',
      message: {
        id: `msg_${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: [],
        model,
        stop_reason: null,
        usage: { input_tokens: 0, output_tokens: 0 },
      },
    }

    yield {
      type: 'content_block_start',
      index: 0,
      content_block: { type: 'text', text: '' },
    }

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      const delta = choice?.delta

      if (choice?.finish_reason) {
        finishReason = choice.finish_reason
      }

      if (delta?.content) {
        currentText += delta.content
        yield {
          type: 'content_block_delta',
          index: 0,
          delta: { type: 'text_delta', text: delta.content },
        }
      }

      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          const index = toolCall.index || 0
          const existing = toolCalls.get(index) || {
            id: '',
            name: '',
            arguments: '',
          }
          if (toolCall.id) {
            existing.id = toolCall.id
          }
          if (toolCall.function?.name) {
            existing.name = toolCall.function.name
          }
          if (typeof toolCall.function?.arguments === 'string') {
            existing.arguments += toolCall.function.arguments
          }
          toolCalls.set(index, existing)
        }
      }
    }

    yield {
      type: 'content_block_stop',
      index: 0,
    }

    const sortedToolCallIndexes = [...toolCalls.keys()].sort((a, b) => a - b)
    for (const toolCallIndex of sortedToolCallIndexes) {
      const toolCall = toolCalls.get(toolCallIndex)
      if (!toolCall) {
        continue
      }

      const anthropicIndex = toolCallIndex + 1
      yield {
        type: 'content_block_start',
        index: anthropicIndex,
        content_block: {
          type: 'tool_use',
          id: toolCall.id || `call_${Date.now()}_${toolCallIndex}`,
          name: toolCall.name || 'tool',
          input: {},
        },
      }

      if (toolCall.arguments.trim().length > 0) {
        yield {
          type: 'content_block_delta',
          index: anthropicIndex,
          delta: {
            type: 'input_json_delta',
            partial_json: toolCall.arguments,
          },
        }
      }

      yield {
        type: 'content_block_stop',
        index: anthropicIndex,
      }
    }

    const stopReason =
      finishReason === 'tool_calls' || sortedToolCallIndexes.length > 0
        ? 'tool_use'
        : finishReason === 'stop'
          ? 'end_turn'
          : finishReason || 'end_turn'

    yield {
      type: 'message_delta',
      delta: { stop_reason: stopReason },
      usage: { output_tokens: Math.ceil(currentText.length / 4) },
    }

    yield {
      type: 'message_stop',
    }
  })()
}

export function createQwenAnthropicWrapper(): Anthropic {
  let client: OpenAI | null = null

  const getClient = async (): Promise<OpenAI> => {
    if (!client) {
      client = await getQwenClient()
    }
    return client
  }

  const runWithQwenAuthRecovery = async <T>(
    operation: (openaiClient: OpenAI) => Promise<T>,
  ): Promise<T> => {
    try {
      return await operation(await getClient())
    } catch (error) {
      const status = getErrorStatusCode(error)
      const errorText = getErrorSearchText(error)
      const isAuth = isQwenAuthError(error)

      // Append diagnostic info to error message for visibility
      const diagnosticPrefix = `[Qwen diagnostic: status=${status || 'none'}, isAuth=${isAuth}, text="${errorText.substring(0, 100)}"] `

      if (!isAuth) {
        // Re-throw with diagnostic prefix
        if (error instanceof Error) {
          const enhanced = new Error(diagnosticPrefix + error.message)
          enhanced.stack = error.stack
          Object.assign(enhanced, error)
          throw enhanced
        }
        throw new Error(diagnosticPrefix + String(error))
      }

      const refreshToken = getQwenRefreshToken()
      if (!refreshToken) {
        throw new Error(QWEN_REAUTH_MESSAGE)
      }

      let refreshed: QwenTokens
      try {
        refreshed = await refreshQwenToken(refreshToken)
      } catch (refreshErr) {
        throw new Error(
          `${QWEN_REAUTH_MESSAGE} (refresh failed: ${refreshErr instanceof Error ? refreshErr.message : String(refreshErr)})`,
        )
      }
      updateQwenTokens(refreshed)
      client = null

      return await operation(await getClient())
    }
  }

  const messagesApi = {
    create: (
      params: {
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
      },
      requestOptions?: { signal?: AbortSignal; headers?: Record<string, string> },
    ) => {
      const execute = async () => {
        const model = resolveQwenModel(params.model)

        const baseOpenAIMessages = convertAnthropicToOpenAI(
          params.messages as Array<{
            role: string
            content:
              | string
              | Array<{ type: string; text?: string; [key: string]: unknown }>
          }>,
        )
        const systemPrompt = resolveQwenSystemPrompt(params.system)
        const openaiMessages = prependSystemPrompt(baseOpenAIMessages, systemPrompt)
        const openaiMessagesWithoutTools = prependSystemPrompt(
          sanitizeMessagesForQwenNoTools(baseOpenAIMessages),
          systemPrompt,
        )

        const tools = params.tools
          ? convertAnthropicToolsToOpenAI(
              params.tools.map(tool => ({
                ...tool,
                input_schema: sanitizeQwenToolSchema(
                  tool.name,
                  tool.input_schema,
                ),
              })),
            )
          : undefined

        if (params.stream) {
          const streamRequest: OpenAI.Chat.ChatCompletionCreateParamsStreaming = {
            model,
            messages:
              tools && tools.length > 0
                ? openaiMessages
                : openaiMessagesWithoutTools,
            max_tokens: params.max_tokens,
            stream: true,
          }

          // Only add optional params if present and non-undefined
          if (tools && tools.length > 0) {
            streamRequest.tools = tools
          }
          if (params.temperature !== undefined) {
            streamRequest.temperature = params.temperature
          }

          let stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
          try {
            stream = await runWithQwenAuthRecovery(qwenClient =>
              qwenClient.chat.completions.create(streamRequest, {
                signal: requestOptions?.signal,
                headers: requestOptions?.headers,
              }),
            )
          } catch (error) {
            if (getErrorStatusCode(error) !== 400 || !streamRequest.tools?.length) {
              throw error
            }
            stream = await runWithQwenAuthRecovery(qwenClient =>
              qwenClient.chat.completions.create(
                {
                  model,
                  messages: openaiMessagesWithoutTools,
                  max_tokens: params.max_tokens,
                  stream: true,
                  ...(params.temperature !== undefined && { temperature: params.temperature }),
                },
                {
                  signal: requestOptions?.signal,
                  headers: requestOptions?.headers,
                },
              ),
            )
          }

          return {
            data: createStreamingResponse(stream, model),
            request_id: (stream as { _request_id?: string })._request_id,
            response: new Response(null, { status: 200 }),
          }
        }

        const completionRequest: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
          model,
          messages:
            tools && tools.length > 0
              ? openaiMessages
              : openaiMessagesWithoutTools,
          max_tokens: params.max_tokens,
        }

        // Only add optional params if present and non-undefined
        if (tools && tools.length > 0) {
          completionRequest.tools = tools
        }
        if (params.temperature !== undefined) {
          completionRequest.temperature = params.temperature
        }

        let response: OpenAI.Chat.ChatCompletion
        try {
          response = await runWithQwenAuthRecovery(qwenClient =>
            qwenClient.chat.completions.create(completionRequest, {
              signal: requestOptions?.signal,
              headers: requestOptions?.headers,
            }),
          )
        } catch (error) {
          if (getErrorStatusCode(error) !== 400 || !completionRequest.tools?.length) {
            throw error
          }
          response = await runWithQwenAuthRecovery(qwenClient =>
            qwenClient.chat.completions.create(
              {
                model,
                messages: openaiMessagesWithoutTools,
                max_tokens: params.max_tokens,
                ...(params.temperature !== undefined && { temperature: params.temperature }),
              },
              {
                signal: requestOptions?.signal,
                headers: requestOptions?.headers,
              },
            ),
          )
        }

        return convertQwenToAnthropic(response)
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

  return {
    beta: {
      messages: messagesApi,
    },
    messages: messagesApi,
    apiKey: 'qwen-oauth-token',
    baseURL: normalizeQwenBaseUrl(
      process.env.QWEN_BASE_URL || QWEN_OAUTH_CONFIG.API_BASE_URL,
    ),
  } as unknown as Anthropic
}

export function shouldUseQwenWrapper(): boolean {
  const useQwen = isEnvTruthy(process.env.CLAUDE_CODE_USE_QWEN)
  const hasAuth = hasUsableQwenAuth()

  if (!useQwen && hasAuth) {
    process.env.CLAUDE_CODE_USE_QWEN = 'true'
    return true
  }

  return useQwen && hasAuth
}

