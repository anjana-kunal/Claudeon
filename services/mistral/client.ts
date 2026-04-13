import type Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import {
  convertAnthropicToOpenAI,
  convertAnthropicToolsToOpenAI,
  convertOpenAIToAnthropic,
} from '../openai/client.js'
import { isEnvTruthy } from '../../utils/envUtils.js'

const MISTRAL_DEFAULT_MODEL = 'codestral-latest'
const MISTRAL_DEFAULT_BASE_URL = 'https://api.mistral.ai/v1'
const MISTRAL_REAUTH_MESSAGE =
  'Mistral authentication failed. Check MISTRAL_API_KEY and rerun /login with "Mistral API".'
const MISTRAL_API_VERSION_SUFFIX = '/v1'

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
    const nested = record.error as {
      message?: unknown
      code?: unknown
      type?: unknown
    }
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

function isMistralAuthError(error: unknown): boolean {
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
    text.includes('invalid api key') ||
    text.includes('invalid authentication') ||
    text.includes('unauthorized') ||
    text.includes('authentication failed') ||
    text.includes('forbidden')
  )
}

function resolveMistralModel(requestedModel?: string): string {
  const raw =
    requestedModel ||
    process.env.MISTRAL_MODEL ||
    process.env.ANTHROPIC_MODEL ||
    MISTRAL_DEFAULT_MODEL

  return raw
    .replace(/^openai\//, '')
    .replace(/^mistral\//, '')
    .trim()
}

function normalizeMistralBaseUrl(url: string): string {
  const trimmed = url.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith(MISTRAL_API_VERSION_SUFFIX)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}${MISTRAL_API_VERSION_SUFFIX}`
}

function normalizeMistralApiKey(rawValue: string): string {
  let normalized = rawValue.trim().replace(/^Bearer\s+/i, '').trim()
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim()
  }

  return normalized
}

function sanitizeProviderHeaders(
  headers?: Record<string, string>,
): Record<string, string> | undefined {
  if (!headers) {
    return undefined
  }

  const sanitized: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase()
    if (lower === 'authorization' || lower === 'x-api-key' || lower === 'api-key') {
      continue
    }
    sanitized[key] = value
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

function getMistralBaseUrl(): string {
  return normalizeMistralBaseUrl(
    process.env.MISTRAL_BASE_URL || MISTRAL_DEFAULT_BASE_URL,
  )
}

function getMistralApiKey(): string | null {
  const raw = process.env.MISTRAL_API_KEY
  const apiKey = raw ? normalizeMistralApiKey(raw) : ''
  return apiKey || null
}

function hasUsableMistralAuth(): boolean {
  return !!getMistralApiKey()
}

export async function getMistralClient(): Promise<OpenAI> {
  const apiKey = getMistralApiKey()
  if (!apiKey) {
    throw new Error(MISTRAL_REAUTH_MESSAGE)
  }

  return new OpenAI({
    apiKey,
    baseURL: getMistralBaseUrl(),
  })
}

function resolveMistralSystemPrompt(
  system?: string | Array<{ type: string; text: string }>,
): string {
  if (typeof system === 'string') {
    return system
  }
  if (Array.isArray(system)) {
    return system.map(block => block.text).join('\n')
  }
  return ''
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

function sanitizeMessagesForMistralNoTools(
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
        const systemMessage =
          message as OpenAI.Chat.ChatCompletionSystemMessageParam
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

export function createMistralAnthropicWrapper(): Anthropic {
  let client: OpenAI | null = null

  const getClient = async (): Promise<OpenAI> => {
    if (!client) {
      client = await getMistralClient()
    }
    return client
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
        const model = resolveMistralModel(params.model)
        const forwardedHeaders = sanitizeProviderHeaders(requestOptions?.headers)

        const baseOpenAIMessages = convertAnthropicToOpenAI(
          params.messages as Array<{
            role: string
            content:
              | string
              | Array<{ type: string; text?: string; [key: string]: unknown }>
          }>,
        )
        const systemPrompt = resolveMistralSystemPrompt(params.system)
        const openaiMessages = prependSystemPrompt(baseOpenAIMessages, systemPrompt)
        const openaiMessagesWithoutTools = prependSystemPrompt(
          sanitizeMessagesForMistralNoTools(baseOpenAIMessages),
          systemPrompt,
        )

        const tools = params.tools
          ? convertAnthropicToolsToOpenAI(params.tools)
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

          if (tools && tools.length > 0) {
            streamRequest.tools = tools
          }
          if (params.temperature !== undefined) {
            streamRequest.temperature = params.temperature
          }

          let stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
          try {
            stream = await (await getClient()).chat.completions.create(
              streamRequest,
              {
                signal: requestOptions?.signal,
                ...(forwardedHeaders && { headers: forwardedHeaders }),
              },
            )
          } catch (error) {
            if (isMistralAuthError(error)) {
              throw new Error(MISTRAL_REAUTH_MESSAGE)
            }
            if (getErrorStatusCode(error) !== 400 || !streamRequest.tools?.length) {
              throw error
            }
            try {
              stream = await (await getClient()).chat.completions.create(
                {
                  model,
                  messages: openaiMessagesWithoutTools,
                  max_tokens: params.max_tokens,
                  stream: true,
                  ...(params.temperature !== undefined && {
                    temperature: params.temperature,
                  }),
                },
                {
                  signal: requestOptions?.signal,
                  ...(forwardedHeaders && { headers: forwardedHeaders }),
                },
              )
            } catch (fallbackError) {
              if (isMistralAuthError(fallbackError)) {
                throw new Error(MISTRAL_REAUTH_MESSAGE)
              }
              throw fallbackError
            }
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

        if (tools && tools.length > 0) {
          completionRequest.tools = tools
        }
        if (params.temperature !== undefined) {
          completionRequest.temperature = params.temperature
        }

        let response: OpenAI.Chat.ChatCompletion
        try {
          response = await (await getClient()).chat.completions.create(
            completionRequest,
            {
              signal: requestOptions?.signal,
              ...(forwardedHeaders && { headers: forwardedHeaders }),
            },
          )
        } catch (error) {
          if (isMistralAuthError(error)) {
            throw new Error(MISTRAL_REAUTH_MESSAGE)
          }
          if (getErrorStatusCode(error) !== 400 || !completionRequest.tools?.length) {
            throw error
          }
          try {
            response = await (await getClient()).chat.completions.create(
              {
                model,
                messages: openaiMessagesWithoutTools,
                max_tokens: params.max_tokens,
                ...(params.temperature !== undefined && {
                  temperature: params.temperature,
                }),
              },
              {
                signal: requestOptions?.signal,
                ...(forwardedHeaders && { headers: forwardedHeaders }),
              },
            )
          } catch (fallbackError) {
            if (isMistralAuthError(fallbackError)) {
              throw new Error(MISTRAL_REAUTH_MESSAGE)
            }
            throw fallbackError
          }
        }

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

  return {
    beta: {
      messages: messagesApi,
    },
    messages: messagesApi,
    apiKey: 'mistral-api-key',
    baseURL: getMistralBaseUrl(),
  } as unknown as Anthropic
}

export function shouldUseMistralWrapper(): boolean {
  const useMistral = isEnvTruthy(process.env.CLAUDE_CODE_USE_MISTRAL)
  const hasAuth = hasUsableMistralAuth()

  if (!useMistral && hasAuth) {
    process.env.CLAUDE_CODE_USE_MISTRAL = 'true'
    return true
  }

  return useMistral && hasAuth
}
