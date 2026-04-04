/**
 * Codex API Shim
 * 
 * Handles communication with the Codex backend (chatgpt.com/backend-api/codex)
 * which uses a different API format than standard OpenAI chat completions.
 * 
 * The Codex backend:
 * - Uses /responses endpoint instead of /chat/completions
 * - Has a different request format (input items, instructions, etc.)
 * - Uses SSE for streaming with different event types
 * - Requires chatgpt-account-id header
 */

import type { ResolvedCodexCredentials, ResolvedProviderRequest } from './providerConfig.js'

export interface CodexUsage {
  input_tokens: number
  output_tokens: number
}

export interface CodexStreamEvent {
  event: string
  data: Record<string, unknown>
}

export interface CodexRequestParams {
  model: string
  messages: Array<{ role: string; content: string | unknown[] }>
  system?: string
  tools?: Array<{ name: string; description?: string; input_schema?: unknown }>
  max_tokens?: number
  stream?: boolean
  temperature?: number
}

type ResponsesInputPart =
  | { type: 'input_text'; text: string }
  | { type: 'output_text'; text: string }
  | { type: 'input_image'; image_url: string }

type ResponsesInputItem =
  | {
      type: 'message'
      role: 'user' | 'assistant'
      content: ResponsesInputPart[]
    }
  | {
      type: 'function_call'
      id: string
      call_id: string
      name: string
      arguments: string
    }
  | {
      type: 'function_call_output'
      call_id: string
      output: string
    }

type ResponsesTool = {
  type: 'function'
  name: string
  description: string
  parameters: Record<string, unknown>
  strict?: boolean
}

const UNSUPPORTED_CODEX_SCHEMA_KEYS = new Set([
  'propertyNames',
  'patternProperties',
  'unevaluatedProperties',
  'dependentSchemas',
  'dependentRequired',
  'if',
  'then',
  'else',
])

/**
 * Convert standard chat messages to Codex Responses API input format
 */
function convertMessagesToResponsesInput(
  messages: Array<{ role: string; content: string | unknown[] }>,
): ResponsesInputItem[] {
  const items: ResponsesInputItem[] = []

  for (const message of messages) {
    const role = message.role
    const content = message.content

    if (role === 'user') {
      if (typeof content === 'string') {
        items.push({
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: content }],
        })
      } else if (Array.isArray(content)) {
        // Handle array content with potential tool results
        const toolResults = content.filter(
          (block: any) => block.type === 'tool_result',
        )
        const otherContent = content.filter(
          (block: any) => block.type !== 'tool_result',
        )

        // Add tool results as function_call_output
        for (const toolResult of toolResults) {
          items.push({
            type: 'function_call_output',
            call_id: (toolResult as any).tool_use_id || 'unknown',
            output: typeof (toolResult as any).content === 'string'
              ? (toolResult as any).content
              : JSON.stringify((toolResult as any).content),
          })
        }

        // Add other content as message
        const parts: ResponsesInputPart[] = []
        for (const block of otherContent) {
          if ((block as any).type === 'text') {
            parts.push({ type: 'input_text', text: (block as any).text || '' })
          } else if ((block as any).type === 'image') {
            const source = (block as any).source
            if (source?.type === 'base64') {
              parts.push({
                type: 'input_image',
                image_url: `data:${source.media_type};base64,${source.data}`,
              })
            } else if (source?.type === 'url') {
              parts.push({ type: 'input_image', image_url: source.url })
            }
          }
        }
        if (parts.length > 0) {
          items.push({ type: 'message', role: 'user', content: parts })
        }
      }
    } else if (role === 'assistant') {
      if (typeof content === 'string') {
        items.push({
          type: 'message',
          role: 'assistant',
          content: [{ type: 'output_text', text: content }],
        })
      } else if (Array.isArray(content)) {
        // Handle tool use blocks
        const toolUseBlocks = content.filter(
          (block: any) => block.type === 'tool_use',
        )
        const textBlocks = content.filter(
          (block: any) => block.type === 'text',
        )

        // Add text content as message
        const parts: ResponsesInputPart[] = textBlocks.map((block: any) => ({
          type: 'output_text' as const,
          text: block.text || '',
        }))
        if (parts.length > 0) {
          items.push({ type: 'message', role: 'assistant', content: parts })
        }

        // Add tool uses as function_call
        for (const toolUse of toolUseBlocks) {
          const id = (toolUse as any).id || `fc_${Date.now()}`
          items.push({
            type: 'function_call',
            id: id.startsWith('call_') ? `fc_${id.slice(5)}` : id,
            call_id: id.startsWith('fc_') ? `call_${id.slice(3)}` : id,
            name: (toolUse as any).name || 'tool',
            arguments: typeof (toolUse as any).input === 'string'
              ? (toolUse as any).input
              : JSON.stringify((toolUse as any).input || {}),
          })
        }
      }
    } else if (role === 'system') {
      // System messages are handled separately as instructions
      continue
    }
  }

  return items.filter(item =>
    item.type !== 'message' || item.content.length > 0,
  )
}

/**
 * Convert tools to Codex Responses API format
 */
function convertToolsToResponsesFormat(
  tools: Array<{ name: string; description?: string; input_schema?: unknown }>,
): ResponsesTool[] {
  return tools.map(tool => ({
    type: 'function',
    name: tool.name,
    description: tool.description || '',
    parameters: enforceStrictSchema(
      normalizeCodexToolSchema(
        tool.name,
        tool.input_schema || { type: 'object', properties: {} },
      ),
    ),
    strict: true,
  }))
}

function normalizeCodexToolSchema(
  toolName: string,
  schema: unknown,
): unknown {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return schema
  }

  // AskUserQuestion accepts runtime-populated fields (answers/annotations/metadata)
  // that the model should not set. Codex strict schema validation is sensitive to
  // these record-shaped fields, so only expose the model-authored "questions".
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
        record.properties = { questions }
        record.required = ['questions']
      }
    }
    return record
  }

  return schema
}

/**
 * Enforce strict schema for Codex (all object properties required, additionalProperties: false)
 */
function enforceStrictSchema(schema: unknown): Record<string, unknown> {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return { type: 'object', properties: {}, additionalProperties: false, required: [] }
  }

  const record = { ...(schema as Record<string, unknown>) }
  for (const key of UNSUPPORTED_CODEX_SCHEMA_KEYS) {
    if (key in record) {
      delete record[key]
    }
  }

  const hasObjectProperties =
    'properties' in record &&
    !!record.properties &&
    typeof record.properties === 'object' &&
    !Array.isArray(record.properties)

  if (record.type === 'object' || hasObjectProperties) {
    record.type = 'object'
    record.additionalProperties = false

    const props = hasObjectProperties
      ? (record.properties as Record<string, unknown>)
      : {}
    const enforcedProps: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
      enforcedProps[key] = enforceStrictSchema(value)
    }
    record.properties = enforcedProps
    record.required = Object.keys(enforcedProps)
  } else if ('required' in record) {
    delete record.required
  }

  // Recurse into array items
  if ('items' in record) {
    record.items = enforceStrictSchema(record.items)
  }

  // Recurse into combinators
  for (const key of ['anyOf', 'oneOf', 'allOf'] as const) {
    if (key in record && Array.isArray(record[key])) {
      record[key] = (record[key] as unknown[]).map(item => enforceStrictSchema(item))
    }
  }

  return record
}

/**
 * Extract system message from messages array
 */
function extractSystemPrompt(
  messages: Array<{ role: string; content: string | unknown[] }>,
): string {
  const systemMessages = messages.filter(m => m.role === 'system')
  if (systemMessages.length === 0) return ''
  
  return systemMessages
    .map(m => {
      if (typeof m.content === 'string') return m.content
      if (Array.isArray(m.content)) {
        return m.content
          .filter((block: any) => block.type === 'text')
          .map((block: any) => block.text || '')
          .join('\n\n')
      }
      return ''
    })
    .join('\n\n')
}

/**
 * Perform a request to the Codex Responses API
 */
export async function performCodexRequest(options: {
  request: ResolvedProviderRequest
  credentials: ResolvedCodexCredentials
  params: CodexRequestParams
  signal?: AbortSignal
}): Promise<Response> {
  const nonSystemMessages = options.params.messages.filter(m => m.role !== 'system')
  const input = convertMessagesToResponsesInput(nonSystemMessages)
  
  const body: Record<string, unknown> = {
    model: options.request.resolvedModel,
    input: input.length > 0
      ? input
      : [{ type: 'message', role: 'user', content: [{ type: 'input_text', text: '' }] }],
    store: false,
    stream: true, // Codex API requires streaming
  }

  // Add system instructions (required by Codex API)
  const instructions = options.params.system || extractSystemPrompt(options.params.messages) || 
    'You are a helpful assistant.'
  body.instructions = instructions

  // Add tools if present
  if (options.params.tools && options.params.tools.length > 0) {
    const convertedTools = convertToolsToResponsesFormat(options.params.tools)
    if (convertedTools.length > 0) {
      body.tools = convertedTools
      body.parallel_tool_calls = true
      body.tool_choice = 'auto'
    }
  }

  // Add reasoning for supported models
  if (options.request.resolvedModel.includes('codex') || 
      options.request.resolvedModel.includes('gpt-5')) {
    body.reasoning = { effort: 'high' }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${options.credentials.apiKey}`,
    'originator': 'claudecode',
  }
  
  if (options.credentials.accountId) {
    headers['chatgpt-account-id'] = options.credentials.accountId
  }

  const response = await fetch(`${options.request.baseUrl}/responses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: options.signal,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown error')
    throw new Error(`Codex API error ${response.status}: ${errorBody}`)
  }

  return response
}

/**
 * Read SSE events from a Codex response stream
 */
export async function* readCodexSseEvents(response: Response): AsyncGenerator<CodexStreamEvent> {
  const reader = response.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''

    for (const chunk of chunks) {
      const lines = chunk.split('\n').map(line => line.trim()).filter(Boolean)
      if (lines.length === 0) continue

      const eventLine = lines.find(line => line.startsWith('event: '))
      const dataLines = lines.filter(line => line.startsWith('data: '))
      if (!eventLine || dataLines.length === 0) continue

      const event = eventLine.slice(7).trim()
      const rawData = dataLines.map(line => line.slice(6)).join('\n')
      if (rawData === '[DONE]') continue

      try {
        const data = JSON.parse(rawData)
        if (data && typeof data === 'object') {
          yield { event, data: data as Record<string, unknown> }
        }
      } catch {
        continue
      }
    }
  }
}

/**
 * Collect a complete Codex response from SSE stream
 */
export async function collectCodexResponse(response: Response): Promise<{
  content: string
  toolCalls: Array<{ id: string; name: string; arguments: string }>
  usage: CodexUsage
}> {
  let content = ''
  const toolCalls: Array<{ id: string; name: string; arguments: string }> = []
  let usage: CodexUsage = { input_tokens: 0, output_tokens: 0 }

  for await (const event of readCodexSseEvents(response)) {
    if (event.event === 'response.failed') {
      const msg = (event.data as any)?.response?.error?.message ??
        (event.data as any)?.error?.message ?? 'Codex response failed'
      throw new Error(msg)
    }

    if (event.event === 'response.output_text.delta') {
      content += (event.data as any)?.delta ?? ''
    }

    if (event.event === 'response.output_item.added') {
      const item = (event.data as any)?.item
      if (item?.type === 'function_call') {
        toolCalls.push({
          id: item.call_id ?? item.id ?? `call_${toolCalls.length}`,
          name: item.name ?? 'tool',
          arguments: item.arguments ?? '{}',
        })
      }
    }

    if (event.event === 'response.completed' || event.event === 'response.incomplete') {
      const responseData = (event.data as any)?.response
      if (responseData?.usage) {
        usage = {
          input_tokens: responseData.usage.input_tokens ?? 0,
          output_tokens: responseData.usage.output_tokens ?? 0,
        }
      }
      
      // Extract final content from output
      const output = responseData?.output
      if (Array.isArray(output)) {
        for (const item of output) {
          if (item.type === 'message' && item.role === 'assistant') {
            for (const part of item.content || []) {
              if (part.type === 'output_text') {
                content = part.text || content
              }
            }
          }
          if (item.type === 'function_call' && !toolCalls.find(t => t.id === item.call_id)) {
            toolCalls.push({
              id: item.call_id ?? item.id,
              name: item.name,
              arguments: item.arguments ?? '{}',
            })
          }
        }
      }
      break
    }
  }

  return { content, toolCalls, usage }
}

/**
 * Convert Codex response to OpenAI chat completion format
 */
export function convertCodexToOpenAIFormat(codexResponse: {
  content: string
  toolCalls: Array<{ id: string; name: string; arguments: string }>
  usage: CodexUsage
}): {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: 'assistant'
      content: string | null
      tool_calls?: Array<{
        id: string
        type: 'function'
        function: { name: string; arguments: string }
      }>
    }
    finish_reason: string
  }>
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
} {
  const message: {
    role: 'assistant'
    content: string | null
    tool_calls?: Array<{
      id: string
      type: 'function'
      function: { name: string; arguments: string }
    }>
  } = {
    role: 'assistant',
    content: codexResponse.content || null,
  }

  if (codexResponse.toolCalls.length > 0) {
    message.tool_calls = codexResponse.toolCalls.map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.name, arguments: tc.arguments },
    }))
  }

  return {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'codex',
    choices: [{
      index: 0,
      message,
      finish_reason: codexResponse.toolCalls.length > 0 ? 'tool_calls' : 'stop',
    }],
    usage: {
      prompt_tokens: codexResponse.usage.input_tokens,
      completion_tokens: codexResponse.usage.output_tokens,
      total_tokens: codexResponse.usage.input_tokens + codexResponse.usage.output_tokens,
    },
  }
}
