import * as fs from 'fs'
import * as path from 'path'
import { homedir } from 'os'
import type { GeminiAuthData, GeminiTokens } from './types.js'

const STORAGE_DIR = path.join(homedir(), '.claudecode')
const STORAGE_FILE = path.join(STORAGE_DIR, 'gemini-auth.json')

function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true, mode: 0o700 })
  }
}

export function loadGeminiAuth(): GeminiAuthData | null {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return null
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8')
    const auth = JSON.parse(raw) as GeminiAuthData
    auth.lastUsed = Date.now()
    saveGeminiAuth(auth)
    return auth
  } catch {
    return null
  }
}

export function saveGeminiAuth(authData: GeminiAuthData): void {
  ensureStorageDir()
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(authData, null, 2), {
    mode: 0o600,
  })
}

export function saveGeminiTokens(tokens: GeminiTokens): void {
  saveGeminiAuth({
    tokens,
    authMethod: 'oauth',
    createdAt: Date.now(),
    lastUsed: Date.now(),
  })
}

export function clearGeminiAuth(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE)
    }
  } catch {
    // best-effort
  }
}

export function isGeminiAuthValid(): boolean {
  const auth = loadGeminiAuth()
  if (!auth) return false
  const expirationBuffer = 5 * 60 * 1000
  return auth.tokens.expiresAt > Date.now() + expirationBuffer
}

export function getGeminiAccessToken(): string | null {
  const auth = loadGeminiAuth()
  if (!auth) return null
  if (auth.tokens.expiresAt <= Date.now()) {
    return null
  }
  return auth.tokens.accessToken
}

export function getGeminiRefreshToken(): string | null {
  const auth = loadGeminiAuth()
  return auth?.tokens.refreshToken || null
}

export function updateGeminiTokens(tokens: GeminiTokens): void {
  const auth = loadGeminiAuth()
  if (!auth) {
    saveGeminiTokens(tokens)
    return
  }
  auth.tokens = tokens
  auth.lastUsed = Date.now()
  saveGeminiAuth(auth)
}
