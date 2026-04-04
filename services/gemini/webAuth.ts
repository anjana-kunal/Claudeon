import axios from 'axios'
import { randomBytes } from 'crypto'
import { createServer } from 'http'
import type { AddressInfo } from 'net'
import { OAuth2Client, type Credentials } from 'google-auth-library'
import { GEMINI_OAUTH_CONFIG } from './config.js'
import type { GeminiTokens, GeminiWebLogin } from './types.js'

type GeminiTokenResponse = {
  access_token?: string
  refresh_token?: string
  id_token?: string
  token_type?: string
  expires_in?: number
  error?: string
  error_description?: string
}

const SIGN_IN_SUCCESS_HTML = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Gemini Login Complete</title></head>
  <body>
    <h2>Gemini login successful</h2>
    <p>You can return to Claude Code.</p>
  </body>
</html>`

const SIGN_IN_FAILURE_HTML = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Gemini Login Failed</title></head>
  <body>
    <h2>Gemini login failed</h2>
    <p>Close this tab and retry from Claude Code.</p>
  </body>
</html>`

function createOAuthClient(redirectUri: string): OAuth2Client {
  return new OAuth2Client({
    clientId: GEMINI_OAUTH_CONFIG.CLIENT_ID,
    clientSecret: GEMINI_OAUTH_CONFIG.CLIENT_SECRET,
    redirectUri,
  })
}

function respondHtml(
  res: Parameters<typeof createServer>[0] extends (
    req: any,
    res: infer T,
  ) => any
    ? T
    : never,
  status: number,
  html: string,
): void {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(html)
}

async function getAvailablePort(host: string): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    const server = createServer()

    server.once('error', reject)
    server.listen(0, host, () => {
      const address = server.address() as AddressInfo | null
      if (!address) {
        server.close()
        reject(new Error('Unable to reserve OAuth callback port'))
        return
      }

      const port = address.port
      server.close(err => {
        if (err) {
          reject(err)
          return
        }
        resolve(port)
      })
    })
  })
}

async function waitForAuthorizationCode(params: {
  port: number
  listenHost: string
  callbackPath: string
  expectedState: string
  timeoutMs: number
}): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const parsedUrl = new URL(
        req.url || '',
        `http://127.0.0.1:${params.port}`,
      )

      if (parsedUrl.pathname !== params.callbackPath) {
        respondHtml(res, 404, SIGN_IN_FAILURE_HTML)
        return
      }

      const error = parsedUrl.searchParams.get('error')
      if (error) {
        respondHtml(res, 400, SIGN_IN_FAILURE_HTML)
        finalize(() => {
          reject(
            new Error(
              `Gemini OAuth failed: ${error}${parsedUrl.searchParams.get('error_description') ? ` (${parsedUrl.searchParams.get('error_description')})` : ''}`,
            ),
          )
        })
        return
      }

      const state = parsedUrl.searchParams.get('state')
      const code = parsedUrl.searchParams.get('code')

      if (!state || state !== params.expectedState) {
        respondHtml(res, 400, SIGN_IN_FAILURE_HTML)
        finalize(() => {
          reject(new Error('Gemini OAuth state mismatch. Please retry login.'))
        })
        return
      }

      if (!code) {
        respondHtml(res, 400, SIGN_IN_FAILURE_HTML)
        finalize(() => {
          reject(new Error('Gemini OAuth callback missing authorization code.'))
        })
        return
      }

      respondHtml(res, 200, SIGN_IN_SUCCESS_HTML)
      finalize(() => resolve(code))
    })

    let settled = false

    const finalize = (callback: () => void): void => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timeout)
      server.removeAllListeners('error')
      server.close(() => callback())
    }

    const timeout = setTimeout(() => {
      finalize(() => {
        reject(new Error('Gemini web login timed out. Please retry /login.'))
      })
    }, params.timeoutMs)

    server.once('error', err => {
      finalize(() => {
        reject(new Error(`Gemini OAuth callback server failed: ${err.message}`))
      })
    })

    server.listen(params.port, params.listenHost)
  })
}

function toGeminiTokens(tokens: Credentials): GeminiTokens {
  if (!tokens.access_token) {
    throw new Error('Gemini OAuth did not return access_token')
  }

  const expiresAt =
    typeof tokens.expiry_date === 'number'
      ? tokens.expiry_date
      : Date.now() + 60 * 60 * 1000

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || undefined,
    idToken: tokens.id_token || undefined,
    tokenType: tokens.token_type || 'Bearer',
    expiresAt,
  }
}

function getErrorDescription(errorData: unknown): string {
  if (!errorData || typeof errorData !== 'object') {
    return 'unknown error'
  }

  const parsed = errorData as GeminiTokenResponse
  return parsed.error_description || parsed.error || 'unknown error'
}

export async function startGeminiWebAuth(): Promise<GeminiWebLogin> {
  const listenHost =
    process.env.OAUTH_CALLBACK_HOST || GEMINI_OAUTH_CONFIG.CALLBACK_LISTEN_HOST
  const port = await getAvailablePort(listenHost)
  const redirectUri = `http://127.0.0.1:${port}${GEMINI_OAUTH_CONFIG.CALLBACK_PATH}`
  const state = randomBytes(32).toString('hex')

  const client = createOAuthClient(redirectUri)
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [...GEMINI_OAUTH_CONFIG.SCOPES],
    state,
    prompt: 'consent',
    include_granted_scopes: true,
  })

  const loginCompletePromise = (async () => {
    const authorizationCode = await waitForAuthorizationCode({
      port,
      listenHost,
      callbackPath: GEMINI_OAUTH_CONFIG.CALLBACK_PATH,
      expectedState: state,
      timeoutMs: GEMINI_OAUTH_CONFIG.WEB_LOGIN_TIMEOUT_MS,
    })

    let tokenResult: { tokens: Credentials }
    try {
      tokenResult = await client.getToken(authorizationCode)
    } catch (error) {
      throw new Error(
        `Gemini token exchange failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    return toGeminiTokens(tokenResult.tokens)
  })()

  return {
    authUrl,
    loginCompletePromise,
  }
}

export async function refreshGeminiToken(
  refreshToken: string,
): Promise<GeminiTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: GEMINI_OAUTH_CONFIG.CLIENT_ID,
    client_secret: GEMINI_OAUTH_CONFIG.CLIENT_SECRET,
  }).toString()

  const response = await axios.post(GEMINI_OAUTH_CONFIG.TOKEN_URL, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    timeout: 30000,
    validateStatus: () => true,
  })

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Failed to refresh Gemini token: ${response.status} ${getErrorDescription(response.data)}`,
    )
  }

  const data = response.data as GeminiTokenResponse
  if (!data.access_token) {
    throw new Error('Gemini token refresh did not return access_token')
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    idToken: data.id_token,
    tokenType: data.token_type || 'Bearer',
    expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
  }
}
