import React, { useEffect, useRef, useState } from 'react'
import OpenAI from 'openai'
import { GEMINI_OAUTH_CONFIG } from '../services/gemini/config.js'
import { Box, Text } from '../ink.js'
import { updateSettingsForSource } from '../utils/settings/settings.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import TextInput from './TextInput.js'
import { Spinner } from './Spinner.js'

type GoogleApiAuthStatus =
  | { state: 'initial' }
  | { state: 'validating' }
  | { state: 'saving' }
  | { state: 'success' }
  | { state: 'error'; message: string }

type Props = {
  onSuccess: () => void
  onBack: () => void
}

const GEMINI_PROVIDER_ENV_KEY = 'CLAUDE_CODE_USE_GEMINI'
const GEMINI_API_KEY_ENV_KEY = 'GEMINI_API_KEY'
const GOOGLE_API_KEY_ENV_KEY = 'GOOGLE_API_KEY'
const GEMINI_BASE_URL_ENV_KEY = 'GEMINI_BASE_URL'
const DEFAULT_GEMINI_BASE_URL = GEMINI_OAUTH_CONFIG.API_BASE_URL
const GEMINI_API_VERSION_SUFFIX = '/v1beta/openai'
const API_KEY_PROMPT = 'Google API key > '
const GOOGLE_API_PROBE_MODEL = 'gemini-3-flash-preview'
const GOOGLE_API_VALIDATION_TIMEOUT_MS = 12000

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

function normalizeGoogleApiBaseUrl(url: string): string {
  const trimmed = url.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith(GEMINI_API_VERSION_SUFFIX)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}${GEMINI_API_VERSION_SUFFIX}`
}

function normalizeGoogleApiKeyInput(rawValue: string): string {
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

function isGoogleApiAuthError(error: unknown): boolean {
  const status = getErrorStatusCode(error)
  if (status === 401 || status === 403) {
    return true
  }

  const text = getErrorSearchText(error)
  if (!text) {
    return false
  }

  return (
    text.includes('api key not valid') ||
    text.includes('invalid api key') ||
    text.includes('invalid_api_key') ||
    text.includes('permission_denied') ||
    text.includes('unauthenticated') ||
    text.includes('invalid authentication') ||
    text.includes('invalid authentication credentials')
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

async function validateGoogleApiKey(apiKey: string): Promise<void> {
  const client = new OpenAI({
    apiKey,
    baseURL: normalizeGoogleApiBaseUrl(
      process.env[GEMINI_BASE_URL_ENV_KEY] || DEFAULT_GEMINI_BASE_URL,
    ),
    timeout: GOOGLE_API_VALIDATION_TIMEOUT_MS,
    maxRetries: 0,
  })

  const probeModel =
    (process.env.GEMINI_MODEL || GOOGLE_API_PROBE_MODEL)
      .replace(/^gemini\//, '')
      .replace(/^google\//, '')
      .replace(/^openai\//, '')
      .trim() || GOOGLE_API_PROBE_MODEL

  try {
    await withTimeout(
      client.chat.completions.create({
        model: probeModel,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        temperature: 0,
      }),
      GOOGLE_API_VALIDATION_TIMEOUT_MS,
      'Google API validation timed out.',
    )
  } catch (error: unknown) {
    if (isGoogleApiAuthError(error)) {
      throw new Error(
        'Google rejected this API key. Check GEMINI_API_KEY and ensure the key is active in Google AI Studio.',
      )
    }

    // Timeout/non-auth issues are non-blocking to avoid trapping /login.
    if (isLikelyTimeoutError(error)) {
      return
    }
  }
}

function persistGoogleApiProviderSelection(apiKey: string): void {
  const envPatch: Record<string, string | undefined> = {}
  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    envPatch[key] = undefined
  }
  envPatch[GEMINI_PROVIDER_ENV_KEY] = '1'
  envPatch[GEMINI_API_KEY_ENV_KEY] = apiKey
  envPatch[GOOGLE_API_KEY_ENV_KEY] = undefined
  if (!process.env[GEMINI_BASE_URL_ENV_KEY]?.trim()) {
    envPatch[GEMINI_BASE_URL_ENV_KEY] = DEFAULT_GEMINI_BASE_URL
  }

  const updateResult = updateSettingsForSource('userSettings', {
    env: envPatch as Record<string, string>,
  })
  if (updateResult.error) {
    throw new Error(
      `Google API key was accepted, but failed to persist provider settings: ${updateResult.error.message}`,
    )
  }

  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    delete process.env[key]
  }
  process.env[GEMINI_PROVIDER_ENV_KEY] = '1'
  process.env[GEMINI_API_KEY_ENV_KEY] = apiKey
  delete process.env[GOOGLE_API_KEY_ENV_KEY]
  if (!process.env[GEMINI_BASE_URL_ENV_KEY]?.trim()) {
    process.env[GEMINI_BASE_URL_ENV_KEY] = DEFAULT_GEMINI_BASE_URL
  }
}

export function GoogleApiAuthFlow({ onSuccess, onBack }: Props): React.ReactNode {
  const [status, setStatus] = useState<GoogleApiAuthStatus>({ state: 'initial' })
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [cursorOffset, setCursorOffset] = useState(0)
  const latestSubmitRef = useRef(0)
  const textInputColumns = Math.max(
    20,
    useTerminalSize().columns - API_KEY_PROMPT.length - 1,
  )

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

    const apiKey = normalizeGoogleApiKeyInput(value)
    if (!apiKey) {
      setStatus({ state: 'error', message: 'API key cannot be empty.' })
      return
    }

    setStatus({ state: 'validating' })
    try {
      await validateGoogleApiKey(apiKey)
      if (latestSubmitRef.current !== submitId) {
        return
      }
      setStatus({ state: 'saving' })
      persistGoogleApiProviderSelection(apiKey)
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
          <Text> Validating Google API key...</Text>
        </Box>
      </Box>
    )
  }

  if (status.state === 'saving') {
    return (
      <Box flexDirection="column" gap={1}>
        <Box>
          <Spinner />
          <Text> Saving Google API credentials...</Text>
        </Box>
      </Box>
    )
  }

  if (status.state === 'success') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="green">Google API provider configured successfully.</Text>
        <Text dimColor>Using {process.env.GEMINI_BASE_URL || DEFAULT_GEMINI_BASE_URL}</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap={1} marginTop={1}>
      <Text bold>Connect Google API (AI Studio)</Text>
      <Text>Enter your Google Gemini API key from Google AI Studio.</Text>
      <Text dimColor>
        Endpoint: {process.env.GEMINI_BASE_URL || DEFAULT_GEMINI_BASE_URL}
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

export default GoogleApiAuthFlow
