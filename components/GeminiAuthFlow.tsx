import React, { useEffect, useRef, useState } from 'react'
import { Box, Link, Text } from '../ink.js'
import { startGeminiWebAuth } from '../services/gemini/webAuth.js'
import { saveGeminiTokens } from '../services/gemini/tokenStorage.js'
import { updateSettingsForSource } from '../utils/settings/settings.js'
import { openBrowser } from '../utils/browser.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import { Spinner } from './Spinner.js'

type GeminiAuthStatus =
  | { state: 'initial' }
  | { state: 'starting' }
  | { state: 'waiting_for_user'; authUrl: string }
  | { state: 'success' }
  | { state: 'error'; message: string }

type Props = {
  onSuccess: () => void
  onBack: () => void
}

const GEMINI_PROVIDER_ENV_KEY = 'CLAUDE_CODE_USE_GEMINI'
const GEMINI_API_KEY_ENV_KEY = 'GEMINI_API_KEY'
const GOOGLE_API_KEY_ENV_KEY = 'GOOGLE_API_KEY'
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

function persistGeminiProviderSelection(): void {
  const envPatch: Record<string, string | undefined> = {}
  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    envPatch[key] = undefined
  }
  envPatch[GEMINI_PROVIDER_ENV_KEY] = '1'
  envPatch[GEMINI_API_KEY_ENV_KEY] = undefined
  envPatch[GOOGLE_API_KEY_ENV_KEY] = undefined

  const updateResult = updateSettingsForSource('userSettings', {
    env: envPatch as Record<string, string>,
  })
  if (updateResult.error) {
    throw new Error(
      `Signed in with Gemini, but failed to persist provider settings: ${updateResult.error.message}`,
    )
  }

  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    delete process.env[key]
  }
  delete process.env[GEMINI_API_KEY_ENV_KEY]
  delete process.env[GOOGLE_API_KEY_ENV_KEY]
  process.env[GEMINI_PROVIDER_ENV_KEY] = '1'
}

export function GeminiAuthFlow({ onSuccess, onBack }: Props): React.ReactNode {
  const [status, setStatus] = useState<GeminiAuthStatus>({ state: 'initial' })
  const hasAutoStartedRef = useRef(false)

  useKeybinding(
    'escape',
    () => {
      if (status.state === 'initial' || status.state === 'error') {
        onBack()
      }
    },
    { isActive: status.state === 'initial' || status.state === 'error' },
  )

  useKeybinding(
    'confirm:yes',
    async () => {
      if (status.state === 'initial') {
        await startAuth()
      } else if (status.state === 'error') {
        setStatus({ state: 'initial' })
      }
    },
    { isActive: status.state === 'initial' || status.state === 'error' },
  )

  useEffect(() => {
    if (hasAutoStartedRef.current || status.state !== 'initial') {
      return
    }
    hasAutoStartedRef.current = true
    void startAuth()
  }, [status.state])

  async function startAuth() {
    setStatus({ state: 'starting' })

    try {
      const login = await startGeminiWebAuth()
      setStatus({ state: 'waiting_for_user', authUrl: login.authUrl })

      await openBrowser(login.authUrl)

      const tokens = await login.loginCompletePromise
      saveGeminiTokens(tokens)
      persistGeminiProviderSelection()

      setStatus({ state: 'success' })
      setTimeout(() => onSuccess(), 1500)
    } catch (err: unknown) {
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  switch (status.state) {
    case 'initial':
      return (
        <Box flexDirection="column" gap={1} marginTop={1}>
          <Text bold>Sign in with Gemini</Text>
          <Text>
            Use your Google account to authenticate Claude Code against Gemini.
          </Text>
          <Text dimColor>
            Press <Text bold>Enter</Text> to continue, or <Text bold>Escape</Text>{' '}
            to go back.
          </Text>
        </Box>
      )

    case 'starting':
      return (
        <Box flexDirection="column" gap={1}>
          <Box>
            <Spinner />
            <Text> Preparing Gemini web login...</Text>
          </Box>
        </Box>
      )

    case 'waiting_for_user':
      return (
        <Box flexDirection="column" gap={1}>
          <Text bold>Sign in to Google</Text>
          <Text>
            Continue in your browser:{' '}
            <Link url={status.authUrl}>{status.authUrl}</Link>
          </Text>
          <Box marginTop={1}>
            <Spinner />
            <Text> Waiting for authorization...</Text>
          </Box>
        </Box>
      )

    case 'success':
      return (
        <Box flexDirection="column" gap={1}>
          <Text color="green">Successfully signed in with Gemini.</Text>
          <Text dimColor>Setting up Gemini provider...</Text>
        </Box>
      )

    case 'error':
      return (
        <Box flexDirection="column" gap={1}>
          <Text color="red">Gemini authentication failed</Text>
          <Text>{status.message}</Text>
          <Text dimColor>
            Press <Text bold>Enter</Text> to retry, or <Text bold>Escape</Text>{' '}
            to go back.
          </Text>
        </Box>
      )

    default:
      return null
  }
}

export default GeminiAuthFlow
