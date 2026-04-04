import React, { useEffect, useRef, useState } from 'react'
import OpenAI from 'openai'
import { Box, Text } from '../ink.js'
import { updateSettingsForSource } from '../utils/settings/settings.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import { useTerminalSize } from '../hooks/useTerminalSize.js'
import TextInput from './TextInput.js'
import { Spinner } from './Spinner.js'

type NvidiaAuthStatus =
  | { state: 'initial' }
  | { state: 'validating' }
  | { state: 'saving' }
  | { state: 'success' }
  | { state: 'error'; message: string }

type Props = {
  onSuccess: () => void
  onBack: () => void
}

const NVIDIA_PROVIDER_ENV_KEY = 'CLAUDE_CODE_USE_NVIDIA'
const NVIDIA_API_KEY_ENV_KEY = 'NVIDIA_API_KEY'
const NVIDIA_BASE_URL_ENV_KEY = 'NVIDIA_BASE_URL'
const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const API_KEY_PROMPT = 'NVIDIA API key > '
const NVIDIA_AUTH_PROBE_MODEL = 'z-ai/glm5'
const NVIDIA_VALIDATION_TIMEOUT_MS = 12000

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

function normalizeNvidiaBaseUrl(url: string): string {
  const trimmed = url.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '')
  return withoutTrailingSlash.endsWith('/v1')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/v1`
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

function normalizeNvidiaApiKeyInput(rawValue: string): string {
  let normalized = rawValue.trim().replace(/^Bearer\s+/i, '').trim()
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim()
  }
  if (!normalized) {
    return ''
  }

  // Accept keys pasted without the nvapi- prefix.
  if (!normalized.startsWith('nvapi-') && /^[A-Za-z0-9_-]{24,}$/.test(normalized)) {
    normalized = `nvapi-${normalized}`
  }

  return normalized
}

async function validateNvidiaApiKey(apiKey: string): Promise<void> {
  const client = new OpenAI({
    apiKey,
    baseURL: normalizeNvidiaBaseUrl(
      process.env[NVIDIA_BASE_URL_ENV_KEY] || DEFAULT_NVIDIA_BASE_URL,
    ),
    timeout: NVIDIA_VALIDATION_TIMEOUT_MS,
    maxRetries: 0,
  })

  // Some providers expose models listing broadly; probe a tiny completion
  // call to verify the key can actually authenticate generation requests.
  const probeModel = (process.env.NVIDIA_MODEL || NVIDIA_AUTH_PROBE_MODEL)
    .replace(/^nvidia\//, '')
    .replace(/^openai\//, '')
    .trim() || NVIDIA_AUTH_PROBE_MODEL

  try {
    await withTimeout(
      client.chat.completions.create({
        model: probeModel,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        temperature: 0,
      }),
      NVIDIA_VALIDATION_TIMEOUT_MS,
      'NVIDIA validation timed out.',
    )
  } catch (error: unknown) {
    const status = getErrorStatusCode(error)
    if (status === 401 || status === 403) {
      throw new Error(
        'NVIDIA rejected this API key (401/403). Paste the full key from build.nvidia.com (with or without the Bearer prefix).',
      )
    }

    // Timeouts and non-auth errors are treated as non-blocking so /login doesn't hang.
    if (isLikelyTimeoutError(error)) {
      return
    }

    // Non-auth errors (invalid model, limits, etc.) are not treated as key failures.
  }
}

function persistNvidiaProviderSelection(apiKey: string): void {
  const envPatch: Record<string, string | undefined> = {}
  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    envPatch[key] = undefined
  }
  envPatch[NVIDIA_PROVIDER_ENV_KEY] = '1'
  envPatch[NVIDIA_API_KEY_ENV_KEY] = apiKey
  if (!process.env[NVIDIA_BASE_URL_ENV_KEY]?.trim()) {
    envPatch[NVIDIA_BASE_URL_ENV_KEY] = DEFAULT_NVIDIA_BASE_URL
  }

  const updateResult = updateSettingsForSource('userSettings', {
    env: envPatch as Record<string, string>,
  })
  if (updateResult.error) {
    throw new Error(
      `NVIDIA API key was accepted, but failed to persist provider settings: ${updateResult.error.message}`,
    )
  }

  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    delete process.env[key]
  }
  process.env[NVIDIA_PROVIDER_ENV_KEY] = '1'
  process.env[NVIDIA_API_KEY_ENV_KEY] = apiKey
  if (!process.env[NVIDIA_BASE_URL_ENV_KEY]?.trim()) {
    process.env[NVIDIA_BASE_URL_ENV_KEY] = DEFAULT_NVIDIA_BASE_URL
  }
}

export function NvidiaAuthFlow({ onSuccess, onBack }: Props): React.ReactNode {
  const [status, setStatus] = useState<NvidiaAuthStatus>({ state: 'initial' })
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

    const apiKey = normalizeNvidiaApiKeyInput(value)
    if (!apiKey) {
      setStatus({ state: 'error', message: 'API key cannot be empty.' })
      return
    }

    setStatus({ state: 'validating' })
    try {
      await validateNvidiaApiKey(apiKey)
      if (latestSubmitRef.current !== submitId) {
        return
      }
      setStatus({ state: 'saving' })
      persistNvidiaProviderSelection(apiKey)
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
          <Text> Validating NVIDIA API key...</Text>
        </Box>
      </Box>
    )
  }

  if (status.state === 'saving') {
    return (
      <Box flexDirection="column" gap={1}>
        <Box>
          <Spinner />
          <Text> Saving NVIDIA credentials...</Text>
        </Box>
      </Box>
    )
  }

  if (status.state === 'success') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="green">NVIDIA provider configured successfully.</Text>
        <Text dimColor>Using {process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_BASE_URL}</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap={1} marginTop={1}>
      <Text bold>Connect NVIDIA (build.nvidia.com)</Text>
      <Text>Enter your NVIDIA API key to use NVIDIA-hosted models.</Text>
      <Text dimColor>
        Endpoint: {process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_BASE_URL}
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

export default NvidiaAuthFlow
