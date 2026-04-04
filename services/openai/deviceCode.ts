/**
 * Device Code OAuth flow for ChatGPT authentication
 * 
 * This implements the device authorization grant (RFC 8628) used by
 * OpenAI's Codex CLI to authenticate with ChatGPT accounts.
 * 
 * Flow:
 * 1. Request a device code and user code from ChatGPT
 * 2. Display the user code and verification URL
 * 3. User visits the URL and enters the code
 * 4. Poll for token completion
 * 5. Exchange authorization code for tokens
 * 6. Store tokens for future use
 */

import axios from 'axios'
import { OPENAI_OAUTH_CONFIG } from './config.js'
import { generatePkceCodes, type PkceCodes } from './pkce.js'
import type { OpenAITokens, DeviceCodeResponse } from './types.js'

/**
 * Request a device code from ChatGPT
 * Returns the user code and verification URL
 */
export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  try {
    const response = await axios.post(
      OPENAI_OAUTH_CONFIG.DEVICE_CODE_URL,
      {
        client_id: OPENAI_OAUTH_CONFIG.CLIENT_ID,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    const data = response.data
    
    return {
      deviceAuthId: data.device_auth_id,
      userCode: data.user_code || data.usercode,
      verificationUrl: OPENAI_OAUTH_CONFIG.DEVICE_VERIFICATION_URL,
      pollInterval: parseInt(data.interval, 10) || 5,
      expiresIn: 900, // 15 minutes
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(
          'Device code login is not available. ChatGPT may have changed their authentication system.'
        )
      }
      throw new Error(
        `Failed to request device code: ${error.response?.status} ${error.message}`
      )
    }
    throw error
  }
}

/**
 * Poll for token completion
 * Returns null if still pending, throws on error, returns tokens on success
 */
async function pollForToken(
  deviceAuthId: string,
  userCode: string
): Promise<{ authorizationCode: string; pkce: PkceCodes } | null> {
  try {
    const response = await axios.post(
      OPENAI_OAUTH_CONFIG.TOKEN_POLL_URL,
      {
        device_auth_id: deviceAuthId,
        user_code: userCode,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        validateStatus: (status) => status < 500, // Don't throw on 4xx
      }
    )

    // 403 or 404 means user hasn't completed auth yet
    if (response.status === 403 || response.status === 404) {
      return null
    }

    if (response.status >= 400) {
      throw new Error(`Token poll failed with status ${response.status}`)
    }

    // Success - we have the authorization code and PKCE codes
    const data = response.data
    return {
      authorizationCode: data.authorization_code,
      pkce: {
        codeVerifier: data.code_verifier,
        codeChallenge: data.code_challenge,
      },
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return null // Still pending
    }
    throw error
  }
}

/**
 * Exchange authorization code for access and refresh tokens
 */
async function exchangeCodeForTokens(
  authorizationCode: string,
  pkce: PkceCodes
): Promise<OpenAITokens> {
  const response = await axios.post(
    OPENAI_OAUTH_CONFIG.TOKEN_EXCHANGE_URL,
    {
      grant_type: 'authorization_code',
      code: authorizationCode,
      client_id: OPENAI_OAUTH_CONFIG.CLIENT_ID,
      code_verifier: pkce.codeVerifier,
      redirect_uri: `${OPENAI_OAUTH_CONFIG.ISSUER}/deviceauth/callback`,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  )

  const data = response.data
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    tokenType: data.token_type || 'Bearer',
  }
}

/**
 * Complete the device code flow
 * 
 * @param deviceCode - The device code response from requestDeviceCode
 * @param onPoll - Optional callback for each poll iteration (for progress UI)
 * @returns The OAuth tokens
 */
export async function completeDeviceCodeFlow(
  deviceCode: DeviceCodeResponse,
  onPoll?: (attempt: number, elapsed: number) => void
): Promise<OpenAITokens> {
  const startTime = Date.now()
  const maxWait = OPENAI_OAUTH_CONFIG.DEVICE_CODE_TIMEOUT_MS
  let attempt = 0

  while (true) {
    const elapsed = Date.now() - startTime
    
    if (elapsed >= maxWait) {
      throw new Error('Device code authentication timed out after 15 minutes')
    }

    attempt++
    if (onPoll) {
      onPoll(attempt, elapsed)
    }

    const result = await pollForToken(
      deviceCode.deviceAuthId,
      deviceCode.userCode
    )

    if (result) {
      // User completed authentication, exchange for tokens
      return await exchangeCodeForTokens(result.authorizationCode, result.pkce)
    }

    // Wait before polling again
    const waitTime = Math.min(
      deviceCode.pollInterval * 1000,
      maxWait - elapsed
    )
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshOpenAIToken(
  refreshToken: string
): Promise<OpenAITokens> {
  try {
    const response = await axios.post(
      OPENAI_OAUTH_CONFIG.REFRESH_TOKEN_URL,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: OPENAI_OAUTH_CONFIG.CLIENT_ID,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    const data = response.data
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // May return same refresh token
      idToken: data.id_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      tokenType: data.token_type || 'Bearer',
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Official Codex flow retries refresh with a second client id when the first is unauthorized.
      if (error.response?.status === 401) {
        try {
          const fallbackResponse = await axios.post(
            OPENAI_OAUTH_CONFIG.REFRESH_TOKEN_URL,
            {
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
              client_id: 'codex-cli',
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            }
          )

          const data = fallbackResponse.data
          return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            idToken: data.id_token,
            expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
            tokenType: data.token_type || 'Bearer',
          }
        } catch {}
      }

      throw new Error(
        `Failed to refresh OpenAI token: ${error.response?.status} ${error.message}`
      )
    }
    throw error
  }
}

/**
 * Exchange a ChatGPT id_token for an OpenAI API access token ("openai-api-key").
 * This mirrors Codex CLI token exchange so requests are billed/authorized correctly.
 */
export async function exchangeIdTokenForApiKey(
  idToken: string
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    client_id: OPENAI_OAUTH_CONFIG.CLIENT_ID,
    requested_token: 'openai-api-key',
    subject_token: idToken,
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
  }).toString()

  try {
    const response = await axios.post(
      OPENAI_OAUTH_CONFIG.TOKEN_EXCHANGE_URL,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000,
      }
    )

    const accessToken = response.data?.access_token
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('OpenAI token exchange did not return access_token')
    }
    return accessToken
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const tokenExchangeError = error.response?.data?.error
      const tokenExchangeCode =
        typeof tokenExchangeError?.code === 'string'
          ? tokenExchangeError.code
          : undefined
      const tokenExchangeMessage =
        typeof tokenExchangeError?.message === 'string'
          ? tokenExchangeError.message
          : undefined

      if (status === 401) {
        const message =
          tokenExchangeCode === 'invalid_subject_token' ||
          tokenExchangeMessage?.includes('missing organization_id')
            ? 'OpenAI token exchange failed for this ChatGPT session (invalid_subject_token: missing organization_id). Re-login alone may not fix this account state.'
            : 'OpenAI authentication expired or unauthorized. Please run /login and choose "Sign in with ChatGPT" again.'
        const enrichedError = new Error(message) as Error & {
          status?: number
          code?: string
        }
        enrichedError.status = status
        if (tokenExchangeCode) {
          enrichedError.code = tokenExchangeCode
        }
        throw enrichedError
      }

      const enrichedError = new Error(
        `OpenAI token exchange failed: ${status ?? 'unknown'} ${error.message}`
      ) as Error & {
        status?: number
        code?: string
      }
      enrichedError.status = status
      if (tokenExchangeCode) {
        enrichedError.code = tokenExchangeCode
      }
      throw enrichedError
    }
    throw error
  }
}
