import React, { useEffect, useRef, useState } from 'react'
import { Box, Text } from '../ink.js'
import { updateSettingsForSource } from '../utils/settings/settings.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import TextInput from './TextInput.js'
import { Spinner } from './Spinner.js'

type MistralAuthStatus =
  | { state: 'initial' }
  | { state: 'validating' }
  | { state: 'saving' }
  | { state: 'success' }
  | { state: 'error'; message: string }

type Props = {
  onSuccess: () => void
  onBack: () => void
}

const MISTRAL_PROVIDER_ENV_KEY = 'CLAUDE_CODE_USE_MISTRAL'
const MISTRAL_API_KEY_ENV_KEY = 'MISTRAL_API_KEY'
const MISTRAL_BASE_URL_ENV_KEY = 'MISTRAL_BASE_URL'
const MISTRAL_MODEL_ENV_KEY = 'MISTRAL_MODEL'
const DEFAULT_MISTRAL_BASE_URL = 'https://api.mistral.ai/v1'
const DEFAULT_MISTRAL_MODEL = 'codestral-latest'
const MISTRAL_VALIDATION_MODEL = 'mistral-large-2411'
const MISTRAL_CONVERSATIONS_PATH = '/conversations'
const API_KEY_PROMPT = 'Mistral API key > '
const MISTRAL_VALIDATION_TIMEOUT_MS = 12000

const PROVIDER_ENV_KEYS_TO_CLEAR = [
  'CLAUDE_CODE_USE_GEMINI',
  'CLAUDE_CODE_USE_MISTRAL',
  'CLAUDE_CODE_USE_QWEN',
  'CLAUDE_CODE_USE_NVIDIA',
  'CLAUDE_CODE_USE_OPENAI',
  'CLAUDE_CODE_USE_OPENROUTER',
  'CLAUDE_CODE_USE_BEDROCK',
  'CLAUDE_CODE_USE_FOUNDRY',
  'CLAUDE_CODE_USE_VERTEX',
] as const

function normalizeMistralBaseUrl(url: string): string {
  const trimmed = url.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith('/v1')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/v1`
}

function isLegacyCodestralBaseUrl(url: string | undefined): boolean {
  if (!url) {
    return false
  }
  return url.trim().toLowerCase().includes('codestral.mistral.ai')
}

function resolveMistralBaseUrlForValidation(): string {
  const configured = process.env[MISTRAL_BASE_URL_ENV_KEY]?.trim()
  if (!configured || isLegacyCodestralBaseUrl(configured)) {
    return normalizeMistralBaseUrl(DEFAULT_MISTRAL_BASE_URL)
  }
  return normalizeMistralBaseUrl(configured)
}

function normalizeMistralApiKeyInput(rawValue: string): string {
  let normalized = rawValue.trim().replace(/^Bearer\s+/i, '').trim()
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim()
  }
  return normalized
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

function isLikelyTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  return (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('etimedout') ||
    message.includes('request aborted')
  )
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
      }),
    ])
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
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

function createMistralValidationHttpError(
  status: number,
  data: unknown,
): Error & {
  status: number
  response: { status: number; data: unknown }
} {
  const detail = stringifyUnknown(data)
  const error = new Error(
    detail
      ? `Mistral validation failed (${status}): ${detail}`
      : `Mistral validation failed (${status})`,
  ) as Error & {
    status: number
    response: { status: number; data: unknown }
  }
  error.status = status
  error.response = { status, data }
  return error
}

async function validateMistralApiKey(apiKey: string): Promise<void> {
  const baseUrl = resolveMistralBaseUrlForValidation()
  const validationUrl = `${baseUrl}${MISTRAL_CONVERSATIONS_PATH}`

  const probeModel =
    (process.env[MISTRAL_MODEL_ENV_KEY] || MISTRAL_VALIDATION_MODEL)
      .replace(/^mistral\//, '')
      .replace(/^openai\//, '')
      .trim() || MISTRAL_VALIDATION_MODEL

  try {
    await withTimeout(
      (async () => {
        const response = await fetch(validationUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: probeModel,
            inputs: [{ role: 'user', content: 'ping' }],
            tools: [],
            completion_args: {
              max_tokens: 1,
              temperature: 0,
            },
          }),
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
          throw createMistralValidationHttpError(response.status, parsedBody)
        }
      })(),
      MISTRAL_VALIDATION_TIMEOUT_MS,
      'Mistral validation timed out.',
    )
  } catch (error: unknown) {
    if (isMistralAuthError(error)) {
      throw new Error(
        'Mistral rejected this API key. Check MISTRAL_API_KEY and ensure it is active.',
      )
    }

    if (isLikelyTimeoutError(error)) {
      return
    }

    // Non-auth errors are non-blocking here (model availability/rate limits/etc.)
  }
}

function persistMistralProviderSelection(apiKey: string): void {
  const envPatch: Record<string, string | undefined> = {}
  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    envPatch[key] = undefined
  }
  envPatch[MISTRAL_PROVIDER_ENV_KEY] = '1'
  envPatch[MISTRAL_API_KEY_ENV_KEY] = apiKey
  if (
    !process.env[MISTRAL_BASE_URL_ENV_KEY]?.trim() ||
    isLegacyCodestralBaseUrl(process.env[MISTRAL_BASE_URL_ENV_KEY])
  ) {
    envPatch[MISTRAL_BASE_URL_ENV_KEY] = DEFAULT_MISTRAL_BASE_URL
  }
  if (!process.env[MISTRAL_MODEL_ENV_KEY]?.trim()) {
    envPatch[MISTRAL_MODEL_ENV_KEY] = DEFAULT_MISTRAL_MODEL
  }

  const updateResult = updateSettingsForSource('userSettings', {
    env: envPatch as Record<string, string>,
  })
  if (updateResult.error) {
    throw new Error(
      `Mistral API key was accepted, but failed to persist provider settings: ${updateResult.error.message}`,
    )
  }

  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    delete process.env[key]
  }
  process.env[MISTRAL_PROVIDER_ENV_KEY] = '1'
  process.env[MISTRAL_API_KEY_ENV_KEY] = apiKey
  if (
    !process.env[MISTRAL_BASE_URL_ENV_KEY]?.trim() ||
    isLegacyCodestralBaseUrl(process.env[MISTRAL_BASE_URL_ENV_KEY])
  ) {
    process.env[MISTRAL_BASE_URL_ENV_KEY] = DEFAULT_MISTRAL_BASE_URL
  }
  if (!process.env[MISTRAL_MODEL_ENV_KEY]?.trim()) {
    process.env[MISTRAL_MODEL_ENV_KEY] = DEFAULT_MISTRAL_MODEL
  }
}

export function MistralAuthFlow({ onSuccess, onBack }: Props): React.ReactNode {
  const [status, setStatus] = useState<MistralAuthStatus>({ state: 'initial' })
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [cursorOffset, setCursorOffset] = useState(0)
  const latestSubmitRef = useRef(0)
  const textInputColumns = Math.max(
    20,
    useTerminalSize().columns - API_KEY_PROMPT.length - 1,
  )
  const baseUrlForDisplay = resolveMistralBaseUrlForValidation()

  useKeybinding(
    'escape',
    () => {
      if (status.state === 'initial' || status.state === 'error') {
        onBack()
      }
    },
    { isActive: status.state === 'initial' || status.state === 'error' },
  )

  useEffect(() => {
    if (status.state !== 'success') {
      return
    }
    const timer = setTimeout(() => onSuccess(), 1200)
    return () => clearTimeout(timer)
  }, [status.state, onSuccess])

  async function submitApiKey(value: string) {
    const submitId = latestSubmitRef.current + 1
    latestSubmitRef.current = submitId

    const apiKey = normalizeMistralApiKeyInput(value)
    if (!apiKey) {
      setStatus({ state: 'error', message: 'API key cannot be empty.' })
      return
    }

    setStatus({ state: 'validating' })
    try {
      await validateMistralApiKey(apiKey)
      if (latestSubmitRef.current !== submitId) {
        return
      }
      setStatus({ state: 'saving' })
      persistMistralProviderSelection(apiKey)
      if (latestSubmitRef.current !== submitId) {
        return
      }
      setStatus({ state: 'success' })
    } catch (err: unknown) {
      if (latestSubmitRef.current !== submitId) {
        return
      }
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (status.state === 'validating') {
    return (
      <Box flexDirection="column" gap={1}>
        <Box>
          <Spinner />
          <Text> Validating Mistral API key...</Text>
        </Box>
      </Box>
    )
  }

  if (status.state === 'saving') {
    return (
      <Box flexDirection="column" gap={1}>
        <Box>
          <Spinner />
          <Text> Saving Mistral credentials...</Text>
        </Box>
      </Box>
    )
  }

  if (status.state === 'success') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="green">Mistral provider configured successfully.</Text>
        <Text dimColor>Using {process.env.MISTRAL_BASE_URL || DEFAULT_MISTRAL_BASE_URL}</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap={1} marginTop={1}>
      <Text bold>Connect Mistral API</Text>
      <Text>Enter your Mistral API key.</Text>
      <Text dimColor>
        Validation endpoint: {baseUrlForDisplay + MISTRAL_CONVERSATIONS_PATH}
      </Text>
      {status.state === 'error' && <Text color="red">{status.message}</Text>}
      <Box>
        <Text>{API_KEY_PROMPT}</Text>
        <TextInput
          value={apiKeyInput}
          onChange={value => {
            if (status.state === 'error') {
              setStatus({ state: 'initial' })
            }
            setApiKeyInput(value)
          }}
          onSubmit={submitApiKey}
          cursorOffset={cursorOffset}
          onChangeCursorOffset={setCursorOffset}
          columns={textInputColumns}
          mask="*"
        />
      </Box>
      <Text dimColor>
        Press <Text bold>Enter</Text> to save, or <Text bold>Escape</Text> to go
        back.
      </Text>
    </Box>
  )
}

export default MistralAuthFlow
