import React, { useEffect, useRef, useState } from 'react'
import { Box, Link, Text } from '../ink.js'
import {
  completeQwenDeviceCodeFlow,
  requestQwenDeviceCode,
} from '../services/qwen/deviceCode.js'
import type { QwenDeviceCodeResponse } from '../services/qwen/types.js'
import { saveQwenTokens } from '../services/qwen/tokenStorage.js'
import { updateSettingsForSource } from '../utils/settings/settings.js'
import { openBrowser } from '../utils/browser.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import { Spinner } from './Spinner.js'

type QwenAuthStatus =
  | { state: 'initial' }
  | { state: 'requesting_code' }
  | {
      state: 'waiting_for_user'
      deviceCode: Pick<
        QwenDeviceCodeResponse,
        'verificationUrl' | 'verificationUrlComplete' | 'userCode'
      >
    }
  | { state: 'success' }
  | { state: 'error'; message: string }

type Props = {
  onSuccess: () => void
  onBack: () => void
}

const QWEN_PROVIDER_ENV_KEY = 'CLAUDE_CODE_USE_QWEN'
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

function persistQwenProviderSelection(): void {
  const envPatch: Record<string, string | undefined> = {}
  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    envPatch[key] = undefined
  }
  envPatch[QWEN_PROVIDER_ENV_KEY] = '1'

  const updateResult = updateSettingsForSource('userSettings', {
    env: envPatch as Record<string, string>,
  })
  if (updateResult.error) {
    throw new Error(
      `Signed in with Qwen, but failed to persist provider settings: ${updateResult.error.message}`,
    )
  }

  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    delete process.env[key]
  }
  process.env[QWEN_PROVIDER_ENV_KEY] = '1'
}

export function QwenAuthFlow({ onSuccess, onBack }: Props): React.ReactNode {
  const [status, setStatus] = useState<QwenAuthStatus>({ state: 'initial' })
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
    setStatus({ state: 'requesting_code' })
    try {
      const deviceCode = await requestQwenDeviceCode()
      setStatus({
        state: 'waiting_for_user',
        deviceCode: {
          verificationUrl: deviceCode.verificationUrl,
          verificationUrlComplete: deviceCode.verificationUrlComplete,
          userCode: deviceCode.userCode,
        },
      })

      await openBrowser(deviceCode.verificationUrlComplete)

      const tokens = await completeQwenDeviceCodeFlow({
        deviceCode: deviceCode.deviceCode,
        codeVerifier: deviceCode.codeVerifier,
        expiresIn: deviceCode.expiresIn,
      })

      saveQwenTokens(tokens)
      persistQwenProviderSelection()
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
          <Text bold>Sign in with Qwen</Text>
          <Text>
            Use your qwen.ai account to authenticate Claude Code against Qwen
            OAuth.
          </Text>
          <Text dimColor>
            Press <Text bold>Enter</Text> to continue, or <Text bold>Escape</Text>{' '}
            to go back.
          </Text>
        </Box>
      )
    case 'requesting_code':
      return (
        <Box flexDirection="column" gap={1}>
          <Box>
            <Spinner />
            <Text> Requesting Qwen authorization code...</Text>
          </Box>
        </Box>
      )
    case 'waiting_for_user':
      return (
        <Box flexDirection="column" gap={1}>
          <Text bold>Sign in to Qwen</Text>
          <Box flexDirection="column">
            <Text>
              1. Visit:{' '}
              <Link url={status.deviceCode.verificationUrlComplete}>
                {status.deviceCode.verificationUrlComplete}
              </Link>
            </Text>
            <Text>
              2. Enter code:{' '}
              <Text bold color="green">
                {status.deviceCode.userCode}
              </Text>
            </Text>
            <Text>3. Authorize this CLI session</Text>
          </Box>
          <Box marginTop={1}>
            <Spinner />
            <Text> Waiting for authorization...</Text>
          </Box>
        </Box>
      )
    case 'success':
      return (
        <Box flexDirection="column" gap={1}>
          <Text color="green">✓ Successfully signed in with Qwen!</Text>
          <Text dimColor>Setting up Qwen provider...</Text>
        </Box>
      )
    case 'error':
      return (
        <Box flexDirection="column" gap={1}>
          <Text color="red">✗ Qwen authentication failed</Text>
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

export default QwenAuthFlow

