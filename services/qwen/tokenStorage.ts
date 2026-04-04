import * as fs from 'fs'
import * as path from 'path'
import { homedir } from 'os'
import type { QwenAuthData, QwenTokens } from './types.js'

const STORAGE_DIR = path.join(homedir(), '.claudecode')
const STORAGE_FILE = path.join(STORAGE_DIR, 'qwen-auth.json')

function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true, mode: 0o700 })
  }
}

export function loadQwenAuth(): QwenAuthData | null {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return null
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8')
    const auth = JSON.parse(raw) as QwenAuthData
    auth.lastUsed = Date.now()
    saveQwenAuth(auth)
    return auth
  } catch {
    return null
  }
}

export function saveQwenAuth(authData: QwenAuthData): void {
  ensureStorageDir()
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(authData, null, 2), {
    mode: 0o600,
  })
}

export function saveQwenTokens(tokens: QwenTokens): void {
  saveQwenAuth({
    tokens,
    authMethod: 'oauth',
    createdAt: Date.now(),
    lastUsed: Date.now(),
  })
}

export function clearQwenAuth(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE)
    }
  } catch {
    // best-effort
  }
}

export function isQwenAuthValid(): boolean {
  const auth = loadQwenAuth()
  if (!auth) return false
  const expirationBuffer = 5 * 60 * 1000
  return auth.tokens.expiresAt > Date.now() + expirationBuffer
}

export function getQwenAccessToken(): string | null {
  const auth = loadQwenAuth()
  if (!auth) return null
  if (auth.tokens.expiresAt <= Date.now()) {
    return null
  }
  return auth.tokens.accessToken
}

export function getQwenRefreshToken(): string | null {
  const auth = loadQwenAuth()
  return auth?.tokens.refreshToken || null
}

export function updateQwenTokens(tokens: QwenTokens): void {
  const auth = loadQwenAuth()
  if (!auth) {
    saveQwenTokens(tokens)
    return
  }
  auth.tokens = tokens
  auth.lastUsed = Date.now()
  saveQwenAuth(auth)
}

