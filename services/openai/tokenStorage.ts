/**
 * Token storage for OpenAI OAuth
 * 
 * Stores tokens in ~/.claudecode/openai-auth.json
 * Also supports reading from Codex CLI auth (~/.codex/auth.json)
 */

import * as fs from 'fs'
import * as path from 'path'
import { homedir } from 'os'
import type { OpenAIAuthData, OpenAITokens } from './types.js'
import { resolveCodexAuthPath, resolveCodexApiCredentials } from './providerConfig.js'

const STORAGE_DIR = path.join(homedir(), '.claudecode')
const STORAGE_FILE = path.join(STORAGE_DIR, 'openai-auth.json')
const CODEX_AUTH_FILE = path.join(homedir(), '.codex', 'auth.json')

type CodexAuthDotJson = {
  OPENAI_API_KEY?: string | null
  access_token?: string | null
  tokens?: {
    access_token?: string
    refresh_token?: string
    id_token?: string
  } | null
}

function parseJwtExpirationMs(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as {
      exp?: number
    }
    if (typeof json.exp !== 'number') return null
    return json.exp * 1000
  } catch {
    return null
  }
}

function importFromCodexAuthIfAvailable(): OpenAIAuthData | null {
  // Try to use the new resolveCodexApiCredentials for better compatibility
  const credentials = resolveCodexApiCredentials()
  
  if (credentials.source === 'none' || !credentials.apiKey) {
    // Fall back to legacy direct file reading
    if (!fs.existsSync(CODEX_AUTH_FILE)) return null
    
    try {
      const raw = fs.readFileSync(CODEX_AUTH_FILE, 'utf-8')
      const codexAuth = JSON.parse(raw) as CodexAuthDotJson

      // Check for OPENAI_API_KEY field
      if (codexAuth.OPENAI_API_KEY) {
        const authData: OpenAIAuthData = {
          tokens: {
            accessToken: codexAuth.OPENAI_API_KEY,
            refreshToken: '',
            expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
            tokenType: 'Bearer',
          },
          apiKey: codexAuth.OPENAI_API_KEY,
          authMethod: 'apikey',
          createdAt: Date.now(),
          lastUsed: Date.now(),
        }
        saveOpenAIAuth(authData)
        return authData
      }

      // Check for direct access_token
      if (codexAuth.access_token) {
        const expiresAt =
          parseJwtExpirationMs(codexAuth.access_token) ?? Date.now() + 55 * 60 * 1000

        const authData: OpenAIAuthData = {
          tokens: {
            accessToken: codexAuth.access_token,
            refreshToken: '',
            expiresAt,
            tokenType: 'Bearer',
          },
          authMethod: 'oauth',
          createdAt: Date.now(),
          lastUsed: Date.now(),
        }
        saveOpenAIAuth(authData)
        return authData
      }

      // Check for nested tokens object
      const accessToken = codexAuth.tokens?.access_token
      const refreshToken = codexAuth.tokens?.refresh_token
      if (!accessToken) return null

      const expiresAt =
        parseJwtExpirationMs(accessToken) ?? Date.now() + 55 * 60 * 1000

      const authData: OpenAIAuthData = {
        tokens: {
          accessToken,
          refreshToken: refreshToken || '',
          idToken: codexAuth.tokens?.id_token,
          expiresAt,
          tokenType: 'Bearer',
        },
        authMethod: 'oauth',
        createdAt: Date.now(),
        lastUsed: Date.now(),
      }
      saveOpenAIAuth(authData)
      return authData
    } catch {
      return null
    }
  }

  // Use credentials from resolveCodexApiCredentials
  const expiresAt =
    parseJwtExpirationMs(credentials.apiKey) ?? Date.now() + 55 * 60 * 1000

  const authData: OpenAIAuthData = {
    tokens: {
      accessToken: credentials.apiKey,
      refreshToken: '',
      expiresAt,
      tokenType: 'Bearer',
    },
    authMethod: credentials.source === 'env' ? 'apikey' : 'oauth',
    createdAt: Date.now(),
    lastUsed: Date.now(),
  }
  
  // Only save if loaded from auth.json (not env vars)
  if (credentials.source === 'auth.json') {
    saveOpenAIAuth(authData)
  }
  
  return authData
}

/**
 * Ensure the storage directory exists
 */
function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true, mode: 0o700 })
  }
}

/**
 * Load stored OpenAI auth data
 */
export function loadOpenAIAuth(): OpenAIAuthData | null {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return importFromCodexAuthIfAvailable()
    }
    
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8')
    const authData = JSON.parse(data) as OpenAIAuthData
    
    // Update last used
    authData.lastUsed = Date.now()
    saveOpenAIAuth(authData)
    
    return authData
  } catch (error) {
    console.error('Failed to load OpenAI auth:', error)
    return null
  }
}

/**
 * Save OpenAI auth data
 */
export function saveOpenAIAuth(authData: OpenAIAuthData): void {
  try {
    ensureStorageDir()
    
    const data = JSON.stringify(authData, null, 2)
    fs.writeFileSync(STORAGE_FILE, data, { mode: 0o600 })
    
    // Also save in Codex-compatible format for interoperability
    saveCodexAuthCompat(authData)
  } catch (error) {
    console.error('Failed to save OpenAI auth:', error)
    throw error
  }
}

/**
 * Save auth in Codex CLI compatible format (~/.codex/auth.json)
 * This allows seamless interop with the official Codex CLI
 */
function saveCodexAuthCompat(authData: OpenAIAuthData): void {
  try {
    const codexDir = path.join(homedir(), '.codex')
    if (!fs.existsSync(codexDir)) {
      fs.mkdirSync(codexDir, { recursive: true, mode: 0o700 })
    }
    
    const codexAuth: Record<string, unknown> = {}
    
    if (authData.authMethod === 'apikey' && authData.apiKey) {
      codexAuth.OPENAI_API_KEY = authData.apiKey
    } else if (authData.authMethod === 'oauth') {
      codexAuth.access_token = authData.tokens.accessToken
      codexAuth.tokens = {
        access_token: authData.tokens.accessToken,
        refresh_token: authData.tokens.refreshToken || undefined,
        id_token: authData.tokens.idToken || undefined,
      }
    }
    
    fs.writeFileSync(CODEX_AUTH_FILE, JSON.stringify(codexAuth, null, 2), { mode: 0o600 })
  } catch {
    // Silently fail - this is just for interop convenience
  }
}

/**
 * Save OAuth tokens
 */
export function saveOpenAITokens(tokens: OpenAITokens): void {
  const authData: OpenAIAuthData = {
    tokens,
    authMethod: 'oauth',
    createdAt: Date.now(),
    lastUsed: Date.now(),
  }
  saveOpenAIAuth(authData)
}

/**
 * Save API key auth
 */
export function saveOpenAIApiKey(apiKey: string): void {
  const authData: OpenAIAuthData = {
    tokens: {
      accessToken: apiKey,
      refreshToken: '',
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      tokenType: 'Bearer',
    },
    apiKey,
    authMethod: 'apikey',
    createdAt: Date.now(),
    lastUsed: Date.now(),
  }
  saveOpenAIAuth(authData)
}

/**
 * Clear OpenAI auth data (logout)
 */
export function clearOpenAIAuth(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE)
    }
  } catch (error) {
    console.error('Failed to clear OpenAI auth:', error)
  }
}

/**
 * Check if OpenAI auth is valid and not expired
 */
export function isOpenAIAuthValid(): boolean {
  const auth = loadOpenAIAuth()
  if (!auth) return false
  
  // API keys don't expire (practically)
  if (auth.authMethod === 'apikey') {
    return !!auth.apiKey
  }
  
  // OAuth tokens - check expiration with 5 minute buffer
  const expirationBuffer = 5 * 60 * 1000 // 5 minutes
  return auth.tokens.expiresAt > Date.now() + expirationBuffer
}

/**
 * Get the current access token or API key
 * Returns null if not authenticated or expired
 */
export function getOpenAIAccessToken(): string | null {
  const auth = loadOpenAIAuth()
  if (!auth) return null
  
  if (auth.authMethod === 'apikey') {
    return auth.apiKey || null
  }

  if (auth.exchangedApiKey) {
    return auth.exchangedApiKey
  }
  
  // Check if token is expired
  if (auth.tokens.expiresAt <= Date.now()) {
    return null
  }
  
  return auth.tokens.accessToken
}

/**
 * Get refresh token if available
 */
export function getOpenAIRefreshToken(): string | null {
  const auth = loadOpenAIAuth()
  if (!auth || auth.authMethod !== 'oauth') return null
  return auth.tokens.refreshToken || null
}

/**
 * Update tokens after refresh
 */
export function updateOpenAITokens(tokens: OpenAITokens): void {
  const auth = loadOpenAIAuth()
  if (!auth) {
    saveOpenAITokens(tokens)
    return
  }
  
  auth.tokens = tokens
  // Exchanged API key is tied to prior id_token. Force refresh of exchange.
  delete auth.exchangedApiKey
  auth.lastUsed = Date.now()
  saveOpenAIAuth(auth)
}

export function getOpenAIExchangedApiKey(): string | null {
  const auth = loadOpenAIAuth()
  if (!auth || auth.authMethod !== 'oauth') return null
  return auth.exchangedApiKey || null
}

export function clearOpenAIExchangedApiKey(): void {
  const auth = loadOpenAIAuth()
  if (!auth || auth.authMethod !== 'oauth') return
  if (!auth.exchangedApiKey) return
  delete auth.exchangedApiKey
  auth.lastUsed = Date.now()
  saveOpenAIAuth(auth)
}

export function updateOpenAIExchangedApiKey(apiKey: string): void {
  const auth = loadOpenAIAuth()
  if (!auth || auth.authMethod !== 'oauth') return
  auth.exchangedApiKey = apiKey
  auth.lastUsed = Date.now()
  saveOpenAIAuth(auth)
}
