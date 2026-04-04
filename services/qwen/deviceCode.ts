import axios from 'axios'
import { randomUUID } from 'crypto'
import { generatePkceCodes } from '../openai/pkce.js'
import { QWEN_OAUTH_CONFIG } from './config.js'
import type { QwenDeviceCodeResponse, QwenTokens } from './types.js'

type QwenErrorData = {
  error?: string
  error_description?: string
}

function toFormBody(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

function getErrorDescription(errorData: unknown): string {
  if (!errorData || typeof errorData !== 'object') {
    return 'unknown error'
  }
  const parsed = errorData as QwenErrorData
  return parsed.error_description || parsed.error || 'unknown error'
}

export async function requestQwenDeviceCode(): Promise<QwenDeviceCodeResponse & {
  codeVerifier: string
}> {
  const pkce = generatePkceCodes()

  const body = toFormBody({
    client_id: QWEN_OAUTH_CONFIG.CLIENT_ID,
    scope: QWEN_OAUTH_CONFIG.SCOPE,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: 'S256',
  })

  const response = await axios.post(QWEN_OAUTH_CONFIG.DEVICE_CODE_URL, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'x-request-id': randomUUID(),
    },
    timeout: 30000,
  })

  const data = response.data as {
    device_code?: string
    user_code?: string
    verification_uri?: string
    verification_uri_complete?: string
    expires_in?: number
  }

  if (
    !data.device_code ||
    !data.user_code ||
    !data.verification_uri ||
    !data.verification_uri_complete
  ) {
    throw new Error('Qwen OAuth did not return a complete device-code response')
  }

  return {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUrl: data.verification_uri,
    verificationUrlComplete: data.verification_uri_complete,
    expiresIn: data.expires_in || 900,
    codeVerifier: pkce.codeVerifier,
  }
}

async function pollQwenToken(deviceCode: string, codeVerifier: string): Promise<{
  status: 'pending'
  slowDown?: boolean
} | {
  status: 'success'
  tokens: QwenTokens
}> {
  const body = toFormBody({
    grant_type: QWEN_OAUTH_CONFIG.DEVICE_GRANT_TYPE,
    client_id: QWEN_OAUTH_CONFIG.CLIENT_ID,
    device_code: deviceCode,
    code_verifier: codeVerifier,
  })

  const response = await axios.post(QWEN_OAUTH_CONFIG.TOKEN_URL, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    timeout: 30000,
    validateStatus: () => true,
  })

  if (response.status >= 200 && response.status < 300) {
    const data = response.data as {
      access_token?: string | null
      refresh_token?: string | null
      id_token?: string | null
      token_type?: string
      expires_in?: number | null
      resource_url?: string
    }

    if (!data.access_token) {
      throw new Error('Qwen OAuth token response missing access_token')
    }

    return {
      status: 'success',
      tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? undefined,
        idToken: data.id_token ?? undefined,
        tokenType: data.token_type || 'Bearer',
        expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
        resourceUrl: data.resource_url,
      },
    }
  }

  if (response.status === 400 && response.data?.error === 'authorization_pending') {
    return { status: 'pending' }
  }

  if (response.status === 429 && response.data?.error === 'slow_down') {
    return { status: 'pending', slowDown: true }
  }

  throw new Error(
    `Qwen token polling failed: ${response.status} ${getErrorDescription(response.data)}`,
  )
}

export async function completeQwenDeviceCodeFlow(params: {
  deviceCode: string
  codeVerifier: string
  expiresIn: number
}): Promise<QwenTokens> {
  const started = Date.now()
  let pollIntervalMs = QWEN_OAUTH_CONFIG.DEFAULT_POLL_INTERVAL_MS
  const maxWaitMs = Math.min(
    QWEN_OAUTH_CONFIG.DEVICE_CODE_TIMEOUT_MS,
    Math.max(1000, params.expiresIn * 1000),
  )

  while (Date.now() - started < maxWaitMs) {
    const result = await pollQwenToken(params.deviceCode, params.codeVerifier)
    if (result.status === 'success') {
      return result.tokens
    }

    if (result.slowDown) {
      pollIntervalMs = Math.min(Math.round(pollIntervalMs * 1.5), 10000)
    } else {
      pollIntervalMs = QWEN_OAUTH_CONFIG.DEFAULT_POLL_INTERVAL_MS
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error('Qwen device code authentication timed out')
}

export async function refreshQwenToken(refreshToken: string): Promise<QwenTokens> {
  const body = toFormBody({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: QWEN_OAUTH_CONFIG.CLIENT_ID,
  })

  const response = await axios.post(QWEN_OAUTH_CONFIG.TOKEN_URL, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    timeout: 30000,
    validateStatus: () => true,
  })

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Failed to refresh Qwen token: ${response.status} ${getErrorDescription(response.data)}`,
    )
  }

  const data = response.data as {
    access_token?: string
    refresh_token?: string
    id_token?: string
    token_type?: string
    expires_in?: number
    resource_url?: string
  }

  if (!data.access_token) {
    throw new Error('Qwen refresh did not return access_token')
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    idToken: data.id_token,
    tokenType: data.token_type || 'Bearer',
    expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
    resourceUrl: data.resource_url,
  }
}

