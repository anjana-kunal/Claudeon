import type Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import {
  convertAnthropicToOpenAI,
  convertAnthropicToolsToOpenAI,
} from '../openai/client.js'
import { GEMINI_OAUTH_CONFIG } from './config.js'
import { refreshGeminiToken } from './webAuth.js'
import {
  getGeminiRefreshToken,
  loadGeminiAuth,
  updateGeminiTokens,
} from './tokenStorage.js'
import type { GeminiTokens } from './types.js'
import { isEnvTruthy } from '../../utils/envUtils.js'

const GEMINI_DEFAULT_MODEL = 'gemini-2.5-pro'
const GEMINI_DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.'
const GEMINI_REAUTH_MESSAGE =
  'Gemini session expired or revoked. Please run /login and choose "Gemini / Google account" again.'
const GEMINI_SCOPE_REAUTH_MESSAGE =
  'Gemini web auth succeeded, but this token lacks required permissions for the active Gemini endpoint. Please run /login again. If this persists, your Google account may not have Gemini Code Assist access.'
const GEMINI_API_KEY_AUTH_MESSAGE =
  'Gemini API key authentication failed. Check GEMINI_API_KEY (or GOOGLE_API_KEY) and retry.'
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000
const GEMINI_API_VERSION_SUFFIX = '/v1beta/openai'
const GEMINI_CODE_ASSIST_ENDPOINT = 'https://cloudcode-pa.googleapis.com'
const GEMINI_CODE_ASSIST_API_VERSION = 'v1internal'
const UNSUPPORTED_GEMINI_SCHEMA_KEYS = new Set([
  'propertyNames',
  'patternProperties',
  'unevaluatedProperties',
  'dependentSchemas',
  'dependentRequired',
  'if',
  'then',
  'else',
])

let cachedGeminiCodeAssistProjectId: string | null | undefined

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

function isGeminiAuthError(error: unknown): boolean {
  const status = getErrorStatusCode(error)
  if (status === 401 || status === 403) {
    return true
  }

  const text = getErrorSearchText(error)
  if (!text) {
    return false
  }

  return (
    text.includes('invalid authentication credentials') ||
    text.includes('unauthenticated') ||
    text.includes('invalid_token') ||
    text.includes('token expired') ||
    text.includes('invalid_grant') ||
    text.includes('login required') ||
    text.includes('insufficient authentication scopes')
  )
}

function isGeminiScopeError(error: unknown): boolean {
  const text = getErrorSearchText(error)
  if (!text) {
    return false
  }

  return (
    text.includes('insufficient_scope') ||
    text.includes('insufficient authentication scopes') ||
    text.includes('access_token_scope_insufficient') ||
    text.includes('required api scopes') ||
    (text.includes('missing required authentication credential') &&
      text.includes('unauthenticated'))
  )
}

function sanitizeGeminiSchemaNode(schema: unknown): unknown {
  if (!schema || typeof schema !== 'object') {
    return schema
  }
  if (Array.isArray(schema)) {
    return schema.map(item => sanitizeGeminiSchemaNode(item))
  }

  const record = { ...(schema as Record<string, unknown>) }
  for (const key of UNSUPPORTED_GEMINI_SCHEMA_KEYS) {
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
      sanitizedProps[key] = sanitizeGeminiSchemaNode(value)
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
    record.items = sanitizeGeminiSchemaNode(record.items)
  }

  for (const key of ['anyOf', 'oneOf', 'allOf'] as const) {
    if (Array.isArray(record[key])) {
      record[key] = (record[key] as unknown[]).map(item =>
        sanitizeGeminiSchemaNode(item),
      )
    }
  }

  return record
}

function sanitizeGeminiToolSchema(
  toolName: string,
  schema: unknown,
): Record<string, unknown> {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return { type: 'object', properties: {} }
  }

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
        return sanitizeGeminiSchemaNode({
          ...record,
          properties: { questions },
          required: ['questions'],
        }) as Record<string, unknown>
      }
    }
  }

  const sanitized = sanitizeGeminiSchemaNode(schema)
  if (!sanitized || typeof sanitized !== 'object' || Array.isArray(sanitized)) {
    return { type: 'object', properties: {} }
  }
  return sanitized as Record<string, unknown>
}

function resolveGeminiModel(requestedModel?: string): string {
  const raw =
    requestedModel ||
    process.env.GEMINI_MODEL ||
    process.env.ANTHROPIC_MODEL ||
    GEMINI_DEFAULT_MODEL

  const normalized = raw
    .replace(/^openai\//, '')
    .replace(/^gemini\//, '')
    .replace(/^google\//, '')
    .trim()
    .toLowerCase()

  if (normalized === 'gemini-pro') {
    return 'gemini-2.5-pro'
  }
  if (normalized === 'gemini-flash') {
    return 'gemini-2.5-flash'
  }
  if (normalized === 'gemini-flash-lite') {
    return 'gemini-2.5-flash-lite'
  }
  if (normalized === 'gemini-2.0-flash-exp') {
    return 'gemini-2.0-flash'
  }
  if (normalized === 'gemini-2.5') {
    return 'gemini-2.5-pro'
  }
  if (normalized === 'gemini-3.1-pro') {
    return 'gemini-3.1-pro-preview'
  }
  if (normalized === 'gemini-3-flash') {
    return 'gemini-3-flash-preview'
  }

  return normalized || GEMINI_DEFAULT_MODEL
}

function normalizeGeminiBaseUrl(url: string): string {
  const trimmed = url.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith(GEMINI_API_VERSION_SUFFIX)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}${GEMINI_API_VERSION_SUFFIX}`
}

function getGeminiApiKey(): string | null {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
  if (geminiApiKey) {
    return geminiApiKey
  }

  const googleApiKey = process.env.GOOGLE_API_KEY?.trim()
  return googleApiKey || null
}

function getGeminiCodeAssistBaseUrl(): string {
  const endpoint =
    process.env.CODE_ASSIST_ENDPOINT?.trim() || GEMINI_CODE_ASSIST_ENDPOINT
  const version =
    process.env.CODE_ASSIST_API_VERSION?.trim() || GEMINI_CODE_ASSIST_API_VERSION
  return `${endpoint.replace(/\/+$/, '')}/${version}`
}

function getGeminiBaseUrl(): string {
  return normalizeGeminiBaseUrl(
    process.env.GEMINI_BASE_URL || GEMINI_OAUTH_CONFIG.API_BASE_URL,
  )
}

function getGeminiCodeAssistProjectFromEnv(): string | undefined {
  const project =
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT_ID?.trim() ||
    process.env.ANTHROPIC_VERTEX_PROJECT_ID?.trim()
  return project || undefined
}

function getGeminiUserAgent(): string {
  return `GeminiCode/${MACRO.VERSION} (${process.platform}; ${process.arch})`
}

function getGeminiDefaultHeaders(): Record<string, string> {
  const userAgent = getGeminiUserAgent()
  return {
    'User-Agent': userAgent,
    'x-goog-api-client': `gl-node/${process.versions.node}`,
  }
}

function hasUsableGeminiAuth(): boolean {
  if (getGeminiApiKey()) {
    return true
  }

  const auth = loadGeminiAuth()
  if (!auth) {
    return false
  }
  return !!(auth.tokens.accessToken || auth.tokens.refreshToken)
}

async function getGeminiOAuthTokens(): Promise<GeminiTokens> {
  const auth = loadGeminiAuth()
  if (!auth) {
    throw new Error(
      'Not authenticated with Gemini. Run /login and choose "Gemini / Google account".',
    )
  }

  let tokens = auth.tokens
  const isNearExpiry = tokens.expiresAt <= Date.now() + TOKEN_REFRESH_BUFFER_MS

  if (isNearExpiry) {
    const refreshToken = tokens.refreshToken
    if (!refreshToken) {
      throw new Error(GEMINI_REAUTH_MESSAGE)
    }
    let refreshed: GeminiTokens
    try {
      refreshed = await refreshGeminiToken(refreshToken)
    } catch {
      throw new Error(GEMINI_REAUTH_MESSAGE)
    }
    updateGeminiTokens(refreshed)
    tokens = refreshed
  }

  if (!tokens.accessToken) {
    throw new Error(GEMINI_REAUTH_MESSAGE)
  }

  return tokens
}

export async function getGeminiClient(): Promise<OpenAI> {
  const apiKey = getGeminiApiKey()
  if (apiKey) {
    return new OpenAI({
      apiKey,
      baseURL: getGeminiBaseUrl(),
      defaultHeaders: getGeminiDefaultHeaders(),
    })
  }

  const tokens = await getGeminiOAuthTokens()

  return new OpenAI({
    apiKey: tokens.accessToken,
    baseURL: getGeminiBaseUrl(),
    defaultHeaders: getGeminiDefaultHeaders(),
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

type AnthropicLikeMessage = {
  role: string
  content: unknown
}

type AnthropicToolSpec = {
  name: string
  description?: string
  input_schema?: unknown
}

type GeminiCodeAssistPart = {
  text?: string
  functionCall?: {
    name?: string
    args?: unknown
    id?: string
  }
}

type GeminiCodeAssistContent = {
  role?: string
  parts?: GeminiCodeAssistPart[]
}

type GeminiCodeAssistGenerateRequest = {
  model: string
  project?: string
  user_prompt_id: string
  request: {
    contents: Array<{ role: 'user' | 'model'; parts: Array<Record<string, unknown>> }>
    systemInstruction?: { role: 'user'; parts: Array<{ text: string }> }
    tools?: Array<{
      functionDeclarations: Array<{
        name: string
        description?: string
        parameters?: Record<string, unknown>
      }>
    }>
    toolConfig?: {
      functionCallingConfig?: {
        mode: 'AUTO' | 'ANY' | 'NONE'
        allowedFunctionNames?: string[]
      }
    }
    generationConfig?: {
      maxOutputTokens: number
      temperature?: number
    }
  }
}

type GeminiCodeAssistGenerateResponse = {
  traceId?: string
  response?: {
    candidates?: Array<{
      content?: GeminiCodeAssistContent
      finishReason?: string
    }>
    usageMetadata?: {
      promptTokenCount?: number
      candidatesTokenCount?: number
    }
    modelVersion?: string
  }
}

type GeminiCodeAssistLoadResponse = {
  cloudaicompanionProject?: string
}

type GeminiRequestOptions = {
  signal?: AbortSignal
  headers?: Record<string, string>
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }
  if (value === undefined || value === null) {
    return ''
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function normalizeGeminiFunctionResponsePayload(
  content: unknown,
): Record<string, unknown> {
  if (typeof content === 'string') {
    return { output: content }
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map(item => {
        if (typeof item === 'string') {
          return item
        }
        if (!item || typeof item !== 'object') {
          return ''
        }
        const record = item as { type?: unknown; text?: unknown }
        if (record.type === 'text' && typeof record.text === 'string') {
          return record.text
        }
        return ''
      })
      .filter(part => part.length > 0)

    if (textParts.length > 0) {
      return { output: textParts.join('\n') }
    }

    return { output: stringifyUnknown(content) }
  }

  if (content && typeof content === 'object') {
    return content as Record<string, unknown>
  }

  return { output: String(content ?? '') }
}

function convertAnthropicMessagesToGeminiContents(
  messages: AnthropicLikeMessage[],
): Array<{ role: 'user' | 'model'; parts: Array<Record<string, unknown>> }> {
  const contents: Array<{
    role: 'user' | 'model'
    parts: Array<Record<string, unknown>>
  }> = []
  const toolNamesById = new Map<string, string>()

  for (const message of messages) {
    const role = message.role === 'assistant' ? 'model' : 'user'
    const parts: Array<Record<string, unknown>> = []

    if (typeof message.content === 'string') {
      parts.push({ text: message.content })
    } else if (Array.isArray(message.content)) {
      for (const blockRaw of message.content) {
        if (!blockRaw || typeof blockRaw !== 'object') {
          continue
        }

        const block = blockRaw as Record<string, unknown>
        const blockType =
          typeof block.type === 'string' ? block.type.toLowerCase() : ''

        if (blockType === 'text' && typeof block.text === 'string') {
          parts.push({ text: block.text })
          continue
        }

        if (blockType === 'tool_use' && role === 'model') {
          const name =
            typeof block.name === 'string' && block.name.length > 0
              ? block.name
              : 'tool'
          const id =
            typeof block.id === 'string' && block.id.length > 0
              ? block.id
              : undefined

          if (id) {
            toolNamesById.set(id, name)
          }

          const input =
            block.input && typeof block.input === 'object'
              ? block.input
              : { value: block.input ?? {} }

          parts.push({
            functionCall: {
              name,
              ...(id ? { id } : {}),
              args: input,
            },
          })
          continue
        }

        if (blockType === 'tool_result' && role === 'user') {
          const toolUseId =
            typeof block.tool_use_id === 'string' ? block.tool_use_id : undefined
          const toolName = toolUseId
            ? (toolNamesById.get(toolUseId) ?? 'tool')
            : 'tool'

          parts.push({
            functionResponse: {
              name: toolName,
              ...(toolUseId ? { id: toolUseId } : {}),
              response: normalizeGeminiFunctionResponsePayload(block.content),
            },
          })
        }
      }
    }

    if (parts.length > 0) {
      contents.push({ role, parts })
    }
  }

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: '' }] })
  }

  return contents
}

function convertAnthropicToolsToGemini(
  tools: AnthropicToolSpec[] | undefined,
):
  | Array<{
      functionDeclarations: Array<{
        name: string
        description?: string
        parameters?: Record<string, unknown>
      }>
    }>
  | undefined {
  if (!tools || tools.length === 0) {
    return undefined
  }

  const functionDeclarations = tools
    .filter(tool => typeof tool.name === 'string' && tool.name.length > 0)
    .map(tool => ({
      name: tool.name,
      ...(tool.description ? { description: tool.description } : {}),
      parameters: sanitizeGeminiToolSchema(tool.name, tool.input_schema),
    }))

  if (functionDeclarations.length === 0) {
    return undefined
  }

  return [{ functionDeclarations }]
}

function convertAnthropicToolChoiceToGemini(
  toolChoice: unknown,
):
  | {
      functionCallingConfig?: {
        mode: 'AUTO' | 'ANY' | 'NONE'
        allowedFunctionNames?: string[]
      }
    }
  | undefined {
  if (!toolChoice || typeof toolChoice !== 'object') {
    return undefined
  }

  const choice = toolChoice as { type?: unknown; name?: unknown }
  const type = typeof choice.type === 'string' ? choice.type.toLowerCase() : ''

  if (type === 'none') {
    return { functionCallingConfig: { mode: 'NONE' } }
  }

  if (type === 'any') {
    return { functionCallingConfig: { mode: 'ANY' } }
  }

  if (type === 'auto') {
    return { functionCallingConfig: { mode: 'AUTO' } }
  }

  if (type === 'tool' && typeof choice.name === 'string' && choice.name.length) {
    return {
      functionCallingConfig: {
        mode: 'ANY',
        allowedFunctionNames: [choice.name],
      },
    }
  }

  return undefined
}

function createGeminiHttpError(status: number, data: unknown): Error {
  const detail = stringifyUnknown(data)
  const error = new Error(
    detail
      ? `Gemini request failed (${status}): ${detail}`
      : `Gemini request failed (${status})`,
  ) as Error & {
    status: number
    response: { status: number; data: unknown }
  }

  error.status = status
  error.response = { status, data }
  return error
}

async function postGeminiCodeAssist<T>(
  accessToken: string,
  method: string,
  body: unknown,
  requestOptions?: GeminiRequestOptions,
): Promise<T> {
  const url = `${getGeminiCodeAssistBaseUrl()}:${method}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...getGeminiDefaultHeaders(),
      ...(requestOptions?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: requestOptions?.signal,
  })

  const rawBody = await response.text()
  let parsedBody: unknown = undefined

  if (rawBody.length > 0) {
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      parsedBody = rawBody
    }
  }

  if (!response.ok) {
    throw createGeminiHttpError(response.status, parsedBody)
  }

  return parsedBody as T
}

async function resolveGeminiCodeAssistProjectId(
  accessToken: string,
  requestOptions?: GeminiRequestOptions,
): Promise<string | undefined> {
  if (cachedGeminiCodeAssistProjectId !== undefined) {
    return cachedGeminiCodeAssistProjectId || undefined
  }

  const envProject = getGeminiCodeAssistProjectFromEnv()

  try {
    const loadResponse = await postGeminiCodeAssist<GeminiCodeAssistLoadResponse>(
      accessToken,
      'loadCodeAssist',
      {
        ...(envProject ? { cloudaicompanionProject: envProject } : {}),
        metadata: {
          ideType: 'IDE_UNSPECIFIED',
          platform: 'PLATFORM_UNSPECIFIED',
          pluginType: 'GEMINI',
          ...(envProject ? { duetProject: envProject } : {}),
        },
        mode: 'HEALTH_CHECK',
      },
      requestOptions,
    )

    const responseProject =
      typeof loadResponse.cloudaicompanionProject === 'string' &&
      loadResponse.cloudaicompanionProject.length > 0
        ? loadResponse.cloudaicompanionProject
        : undefined

    const resolvedProject = responseProject || envProject
    cachedGeminiCodeAssistProjectId = resolvedProject || null
    return resolvedProject
  } catch {
    const fallbackProject = envProject || null
    cachedGeminiCodeAssistProjectId = fallbackProject
    return fallbackProject || undefined
  }
}

function mapGeminiCodeAssistStopReason(
  finishReason: string | undefined,
  hasToolUse: boolean,
): string {
  if (hasToolUse) {
    return 'tool_use'
  }

  if (!finishReason) {
    return 'end_turn'
  }

  const normalized = finishReason.toUpperCase()
  if (normalized === 'MAX_TOKENS') {
    return 'max_tokens'
  }

  return 'end_turn'
}

function convertGeminiCodeAssistToAnthropic(
  response: GeminiCodeAssistGenerateResponse,
  fallbackModel: string,
): WrappedResponse {
  const candidate = response.response?.candidates?.[0]
  const parts = candidate?.content?.parts || []
  const content: WrappedResponse['content'] = []

  for (const [index, part] of parts.entries()) {
    if (typeof part.text === 'string' && part.text.length > 0) {
      content.push({ type: 'text', text: part.text })
    }

    const functionCall = part.functionCall
    if (functionCall && typeof functionCall === 'object') {
      const name =
        typeof functionCall.name === 'string' && functionCall.name.length > 0
          ? functionCall.name
          : 'tool'
      const id =
        typeof functionCall.id === 'string' && functionCall.id.length > 0
          ? functionCall.id
          : `call_${Date.now()}_${index}`

      content.push({
        type: 'tool_use',
        id,
        name,
        input:
          functionCall.args && typeof functionCall.args === 'object'
            ? functionCall.args
            : {},
      })
    }
  }

  if (content.length === 0) {
    content.push({ type: 'text', text: '' })
  }

  const usageMetadata = response.response?.usageMetadata
  const hasToolUse = content.some(block => block.type === 'tool_use')

  return {
    id: response.traceId || `msg_${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content,
    model:
      typeof response.response?.modelVersion === 'string'
        ? response.response.modelVersion
        : fallbackModel,
    stop_reason: mapGeminiCodeAssistStopReason(
      candidate?.finishReason,
      hasToolUse,
    ),
    usage: {
      input_tokens:
        typeof usageMetadata?.promptTokenCount === 'number'
          ? usageMetadata.promptTokenCount
          : 0,
      output_tokens:
        typeof usageMetadata?.candidatesTokenCount === 'number'
          ? usageMetadata.candidatesTokenCount
          : 0,
    },
  }
}

function createStreamingResponseFromWrappedResponse(
  wrapped: WrappedResponse,
): AsyncIterable<unknown> {
  return (async function* () {
    const textContent = wrapped.content
      .filter(
        (block): block is { type: 'text'; text: string } =>
          block.type === 'text',
      )
      .map(block => block.text)
      .join('')

    const toolBlocks = wrapped.content.filter(
      (block): block is { type: 'tool_use'; id: string; name: string; input: unknown } =>
        block.type === 'tool_use',
    )

    yield {
      type: 'message_start',
      message: {
        id: wrapped.id,
        type: 'message',
        role: 'assistant',
        content: [],
        model: wrapped.model,
        stop_reason: null,
        usage: { input_tokens: wrapped.usage.input_tokens, output_tokens: 0 },
      },
    }

    yield {
      type: 'content_block_start',
      index: 0,
      content_block: { type: 'text', text: '' },
    }

    if (textContent.length > 0) {
      yield {
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: textContent },
      }
    }

    yield {
      type: 'content_block_stop',
      index: 0,
    }

    for (const [index, toolBlock] of toolBlocks.entries()) {
      const contentIndex = index + 1
      yield {
        type: 'content_block_start',
        index: contentIndex,
        content_block: {
          type: 'tool_use',
          id: toolBlock.id,
          name: toolBlock.name,
          input: {},
        },
      }

      const partialJson = stringifyUnknown(toolBlock.input)
      if (partialJson.length > 0) {
        yield {
          type: 'content_block_delta',
          index: contentIndex,
          delta: {
            type: 'input_json_delta',
            partial_json: partialJson,
          },
        }
      }

      yield {
        type: 'content_block_stop',
        index: contentIndex,
      }
    }

    yield {
      type: 'message_delta',
      delta: {
        stop_reason:
          wrapped.stop_reason || (toolBlocks.length > 0 ? 'tool_use' : 'end_turn'),
      },
      usage: { output_tokens: wrapped.usage.output_tokens },
    }

    yield {
      type: 'message_stop',
    }
  })()
}

function parseToolArguments(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return { raw }
  }
}

function convertGeminiToAnthropic(
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

function sanitizeMessagesForGeminiNoTools(
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

function resolveGeminiSystemPrompt(
  system?: string | Array<{ type: string; text: string }>,
): string {
  if (typeof system === 'string') {
    return system
  }
  if (Array.isArray(system)) {
    return system.map(block => block.text).join('\n')
  }
  return GEMINI_DEFAULT_SYSTEM_PROMPT
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

export function createGeminiAnthropicWrapper(): Anthropic {
  let client: OpenAI | null = null

  const getClient = async (): Promise<OpenAI> => {
    if (!client) {
      client = await getGeminiClient()
    }
    return client
  }

  const runWithGeminiAuthRecovery = async <T>(
    operation: (openaiClient: OpenAI) => Promise<T>,
  ): Promise<T> => {
    const usingApiKeyAuth = !!getGeminiApiKey()

    try {
      return await operation(await getClient())
    } catch (error) {
      if (!isGeminiAuthError(error)) {
        throw error
      }

      if (isGeminiScopeError(error)) {
        if (usingApiKeyAuth) {
          throw new Error(GEMINI_API_KEY_AUTH_MESSAGE)
        }
        throw new Error(GEMINI_SCOPE_REAUTH_MESSAGE)
      }

      if (usingApiKeyAuth) {
        throw new Error(GEMINI_API_KEY_AUTH_MESSAGE)
      }

      const refreshToken = getGeminiRefreshToken()
      if (!refreshToken) {
        throw new Error(GEMINI_REAUTH_MESSAGE)
      }

      let refreshed: GeminiTokens
      try {
        refreshed = await refreshGeminiToken(refreshToken)
      } catch (refreshErr) {
        throw new Error(
          `${GEMINI_REAUTH_MESSAGE} (refresh failed: ${refreshErr instanceof Error ? refreshErr.message : String(refreshErr)})`,
        )
      }

      updateGeminiTokens(refreshed)
      client = null

      try {
        return await operation(await getClient())
      } catch (retryError) {
        if (isGeminiScopeError(retryError)) {
          if (usingApiKeyAuth) {
            throw new Error(GEMINI_API_KEY_AUTH_MESSAGE)
          }
          throw new Error(GEMINI_SCOPE_REAUTH_MESSAGE)
        }
        if (isGeminiAuthError(retryError)) {
          if (usingApiKeyAuth) {
            throw new Error(GEMINI_API_KEY_AUTH_MESSAGE)
          }
          throw new Error(GEMINI_REAUTH_MESSAGE)
        }
        throw retryError
      }
    }
  }

  const runWithGeminiOAuthRecovery = async <T>(
    operation: (accessToken: string) => Promise<T>,
  ): Promise<T> => {
    try {
      const tokens = await getGeminiOAuthTokens()
      return await operation(tokens.accessToken)
    } catch (error) {
      if (!isGeminiAuthError(error)) {
        throw error
      }

      if (isGeminiScopeError(error)) {
        throw new Error(GEMINI_SCOPE_REAUTH_MESSAGE)
      }

      const refreshToken = getGeminiRefreshToken()
      if (!refreshToken) {
        throw new Error(GEMINI_REAUTH_MESSAGE)
      }

      let refreshed: GeminiTokens
      try {
        refreshed = await refreshGeminiToken(refreshToken)
      } catch (refreshErr) {
        throw new Error(
          `${GEMINI_REAUTH_MESSAGE} (refresh failed: ${refreshErr instanceof Error ? refreshErr.message : String(refreshErr)})`,
        )
      }

      updateGeminiTokens(refreshed)

      try {
        return await operation(refreshed.accessToken)
      } catch (retryError) {
        if (isGeminiScopeError(retryError)) {
          throw new Error(GEMINI_SCOPE_REAUTH_MESSAGE)
        }
        if (isGeminiAuthError(retryError)) {
          throw new Error(GEMINI_REAUTH_MESSAGE)
        }
        throw retryError
      }
    }
  }

  const messagesApi = {
    create: (
      params: {
        model: string
        max_tokens: number
        messages: Array<{ role: string; content: unknown }>
        system?: string | Array<{ type: string; text: string }>
        tools?: Array<{
          name: string
          description?: string
          input_schema?: unknown
        }>
        tool_choice?: unknown
        stream?: boolean
        temperature?: number
        metadata?: unknown
        [key: string]: unknown
      },
      requestOptions?: { signal?: AbortSignal; headers?: Record<string, string> },
    ) => {
      const execute = async () => {
        const model = resolveGeminiModel(params.model)

        const usingApiKeyAuth = !!getGeminiApiKey()
        if (!usingApiKeyAuth) {
          const contents = convertAnthropicMessagesToGeminiContents(
            params.messages as AnthropicLikeMessage[],
          )
          const systemPrompt = resolveGeminiSystemPrompt(params.system)
          const tools = convertAnthropicToolsToGemini(
            params.tools as AnthropicToolSpec[] | undefined,
          )
          const toolConfig = convertAnthropicToolChoiceToGemini(
            params.tool_choice,
          )

          let response: GeminiCodeAssistGenerateResponse
          try {
            response = await runWithGeminiOAuthRecovery(async accessToken => {
              const project = await resolveGeminiCodeAssistProjectId(
                accessToken,
                requestOptions,
              )

              const requestBody: GeminiCodeAssistGenerateRequest = {
                model,
                ...(project ? { project } : {}),
                user_prompt_id: `cc-${Date.now()}`,
                request: {
                  contents,
                  ...(systemPrompt.trim().length > 0
                    ? {
                        systemInstruction: {
                          role: 'user',
                          parts: [{ text: systemPrompt }],
                        },
                      }
                    : {}),
                  ...(tools ? { tools } : {}),
                  ...(toolConfig ? { toolConfig } : {}),
                  generationConfig: {
                    maxOutputTokens: params.max_tokens,
                    ...(params.temperature !== undefined
                      ? { temperature: params.temperature }
                      : {}),
                  },
                },
              }

              return await postGeminiCodeAssist<GeminiCodeAssistGenerateResponse>(
                accessToken,
                'generateContent',
                requestBody,
                requestOptions,
              )
            })
          } catch (error) {
            if (getErrorStatusCode(error) !== 400 || !tools) {
              throw error
            }

            response = await runWithGeminiOAuthRecovery(async accessToken => {
              const project = await resolveGeminiCodeAssistProjectId(
                accessToken,
                requestOptions,
              )

              const requestBody: GeminiCodeAssistGenerateRequest = {
                model,
                ...(project ? { project } : {}),
                user_prompt_id: `cc-${Date.now()}`,
                request: {
                  contents,
                  ...(systemPrompt.trim().length > 0
                    ? {
                        systemInstruction: {
                          role: 'user',
                          parts: [{ text: systemPrompt }],
                        },
                      }
                    : {}),
                  generationConfig: {
                    maxOutputTokens: params.max_tokens,
                    ...(params.temperature !== undefined
                      ? { temperature: params.temperature }
                      : {}),
                  },
                },
              }

              return await postGeminiCodeAssist<GeminiCodeAssistGenerateResponse>(
                accessToken,
                'generateContent',
                requestBody,
                requestOptions,
              )
            })
          }

          const wrappedResponse = convertGeminiCodeAssistToAnthropic(
            response,
            model,
          )

          if (params.stream) {
            return {
              data: createStreamingResponseFromWrappedResponse(wrappedResponse),
              request_id: wrappedResponse.id,
              response: new Response(null, { status: 200 }),
            }
          }

          return wrappedResponse
        }

        const baseOpenAIMessages = convertAnthropicToOpenAI(
          params.messages as Array<{
            role: string
            content:
              | string
              | Array<{ type: string; text?: string; [key: string]: unknown }>
          }>,
        )
        const systemPrompt = resolveGeminiSystemPrompt(params.system)
        const openaiMessages = prependSystemPrompt(baseOpenAIMessages, systemPrompt)
        const openaiMessagesWithoutTools = prependSystemPrompt(
          sanitizeMessagesForGeminiNoTools(baseOpenAIMessages),
          systemPrompt,
        )

        const tools = params.tools
          ? convertAnthropicToolsToOpenAI(
              params.tools.map(tool => ({
                ...tool,
                input_schema: sanitizeGeminiToolSchema(
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

          if (tools && tools.length > 0) {
            streamRequest.tools = tools
          }
          if (params.temperature !== undefined) {
            streamRequest.temperature = params.temperature
          }

          let stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
          try {
            stream = await runWithGeminiAuthRecovery(geminiClient =>
              geminiClient.chat.completions.create(streamRequest, {
                signal: requestOptions?.signal,
                headers: requestOptions?.headers,
              }),
            )
          } catch (error) {
            if (getErrorStatusCode(error) !== 400 || !streamRequest.tools?.length) {
              throw error
            }
            stream = await runWithGeminiAuthRecovery(geminiClient =>
              geminiClient.chat.completions.create(
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

        if (tools && tools.length > 0) {
          completionRequest.tools = tools
        }
        if (params.temperature !== undefined) {
          completionRequest.temperature = params.temperature
        }

        let response: OpenAI.Chat.ChatCompletion
        try {
          response = await runWithGeminiAuthRecovery(geminiClient =>
            geminiClient.chat.completions.create(completionRequest, {
              signal: requestOptions?.signal,
              headers: requestOptions?.headers,
            }),
          )
        } catch (error) {
          if (getErrorStatusCode(error) !== 400 || !completionRequest.tools?.length) {
            throw error
          }
          response = await runWithGeminiAuthRecovery(geminiClient =>
            geminiClient.chat.completions.create(
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
                headers: requestOptions?.headers,
              },
            ),
          )
        }

        return convertGeminiToAnthropic(response)
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
    apiKey: 'gemini-oauth-token',
    baseURL: getGeminiBaseUrl(),
  } as unknown as Anthropic
}

export function shouldUseGeminiWrapper(): boolean {
  const useGemini = isEnvTruthy(process.env.CLAUDE_CODE_USE_GEMINI)
  const hasAuth = hasUsableGeminiAuth()

  if (!useGemini && hasAuth) {
    process.env.CLAUDE_CODE_USE_GEMINI = 'true'
    return true
  }

  return useGemini && hasAuth
}
