import React, { useEffect, useRef, useState } from 'react';
import { Box, Link, Text } from '../ink.js';
import { requestDeviceCode, completeDeviceCodeFlow } from '../services/openai/deviceCode.js';
import type { DeviceCodeResponse } from '../services/openai/types.js';
import { saveOpenAITokens } from '../services/openai/tokenStorage.js';
import { updateSettingsForSource } from '../utils/settings/settings.js';
import { openBrowser } from '../utils/browser.js';
import { useKeybinding } from '../keybindings/useKeybinding.js';
import { Spinner } from './Spinner.js';

type OpenAIAuthStatus = 
  | { state: 'initial' }
  | { state: 'requesting_code' }
  | { state: 'waiting_for_user'; deviceCode: DeviceCodeResponse }
  | { state: 'polling' }
  | { state: 'success' }
  | { state: 'error'; message: string };

type Props = {
  onSuccess: () => void;
  onBack: () => void;
};

const OPENAI_PROVIDER_ENV_KEY = 'CLAUDE_CODE_USE_OPENAI';
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
] as const;

function persistOpenAIProviderSelection(): void {
  const envPatch: Record<string, string | undefined> = {};
  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    envPatch[key] = undefined;
  }
  envPatch[OPENAI_PROVIDER_ENV_KEY] = '1';

  const updateResult = updateSettingsForSource('userSettings', {
    env: envPatch as Record<string, string>,
  });
  if (updateResult.error) {
    throw new Error(
      `Signed in with ChatGPT, but failed to persist provider settings: ${updateResult.error.message}`,
    );
  }

  for (const key of PROVIDER_ENV_KEYS_TO_CLEAR) {
    delete process.env[key];
  }
  process.env[OPENAI_PROVIDER_ENV_KEY] = '1';
}

export function OpenAIAuthFlow({ onSuccess, onBack }: Props): React.ReactNode {
  const [status, setStatus] = useState<OpenAIAuthStatus>({ state: 'initial' });
  const hasAutoStartedRef = useRef(false);

  // Handle back with Escape
  useKeybinding('escape', () => {
    if (status.state === 'initial' || status.state === 'error') {
      onBack();
    }
  }, { isActive: status.state === 'initial' || status.state === 'error' });

  // Handle Enter to start auth
  useKeybinding('confirm:yes', async () => {
    if (status.state === 'initial') {
      await startAuth();
    } else if (status.state === 'error') {
      setStatus({ state: 'initial' });
    }
  }, { isActive: status.state === 'initial' || status.state === 'error' });

  useEffect(() => {
    if (hasAutoStartedRef.current || status.state !== 'initial') {
      return;
    }
    hasAutoStartedRef.current = true;
    void startAuth();
  }, [status.state]);

  async function startAuth() {
    setStatus({ state: 'requesting_code' });
    
    try {
      // Step 1: Request device code
      const deviceCode = await requestDeviceCode();
      setStatus({ state: 'waiting_for_user', deviceCode });

      // Step 2: Explicitly open browser for device-code login.
      // If this fails, we continue and show the URL/code so the user can open it manually.
      await openBrowser(deviceCode.verificationUrl);

      // Step 3: Poll for token completion while keeping code visible
      const tokens = await completeDeviceCodeFlow(deviceCode);
      
      // Step 4: Save tokens
      await saveOpenAITokens(tokens);
      
      // Persist OpenAI provider mode for current and future sessions
      persistOpenAIProviderSelection();
      
      setStatus({ state: 'success' });
      
      // Wait a moment then call onSuccess
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err: any) {
      setStatus({ state: 'error', message: err.message || 'Authentication failed' });
    }
  }

  switch (status.state) {
    case 'initial':
      return (
        <Box flexDirection="column" gap={1} marginTop={1}>
          <Text bold>Sign in with ChatGPT</Text>
          <Box flexDirection="column" gap={1}>
            <Text>
              Use your ChatGPT Plus/Pro subscription to power Claude Code with GPT models.
            </Text>
            <Text>
              You'll be redirected to sign in via your browser.
            </Text>
            <Box marginTop={1}>
              <Text dimColor>
                Press <Text bold>Enter</Text> to continue, or <Text bold>Escape</Text> to go back.
              </Text>
            </Box>
          </Box>
        </Box>
      );

    case 'requesting_code':
      return (
        <Box flexDirection="column" gap={1}>
          <Box>
            <Spinner />
            <Text> Requesting authorization code...</Text>
          </Box>
        </Box>
      );

    case 'waiting_for_user':
      return (
        <Box flexDirection="column" gap={1}>
          <Text bold>Sign in to ChatGPT</Text>
          <Box flexDirection="column">
            <Text>1. Visit: <Link url={status.deviceCode.verificationUrl}>{status.deviceCode.verificationUrl}</Link></Text>
            <Text>2. Enter code: <Text bold color="green">{status.deviceCode.userCode}</Text></Text>
            <Text>3. Authorize Claude Code to use your ChatGPT account</Text>
          </Box>
          <Box marginTop={1}>
            <Spinner />
            <Text> Waiting for authorization...</Text>
          </Box>
        </Box>
      );

    case 'polling':
      return (
        <Box flexDirection="column" gap={1}>
          <Box>
            <Spinner />
            <Text> Completing authentication...</Text>
          </Box>
        </Box>
      );

    case 'success':
      return (
        <Box flexDirection="column" gap={1}>
          <Text color="green">✓ Successfully signed in with ChatGPT!</Text>
          <Text dimColor>Setting up OpenAI integration...</Text>
        </Box>
      );

    case 'error':
      return (
        <Box flexDirection="column" gap={1}>
          <Text color="red">✗ Authentication failed</Text>
          <Text>{status.message}</Text>
          <Box marginTop={1}>
            <Text dimColor>
              Press <Text bold>Enter</Text> to retry, or <Text bold>Escape</Text> to go back.
            </Text>
          </Box>
        </Box>
      );

    default:
      return null;
  }
}

export default OpenAIAuthFlow;
