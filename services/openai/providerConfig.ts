/**
 * Provider configuration for Codex and OpenAI-compatible backends
 * 
 * Based on OpenClaude's providerConfig.ts for compatibility with Codex CLI auth.
 * Handles credential resolution from:
 * - Environment variables (CODEX_API_KEY, OPENAI_API_KEY)
 * - Codex CLI auth.json files (~/.codex/auth.json)
 */

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'
export const DEFAULT_CODEX_BASE_URL = 'https://chatgpt.com/backend-api/codex'

export type ProviderTransport = 'chat_completions' | 'codex_responses'

export type ResolvedCodexCredentials = {
  apiKey: string
  accountId?: string
  authPath?: string
  source: 'env' | 'auth.json' | 'none'
}

export type ResolvedProviderRequest = {
  transport: ProviderTransport
  requestedModel: string
  resolvedModel: string
  baseUrl: string
}

const CODEX_ALIAS_MODELS: Record<string, { model: string }> = {
  codexplan: { model: 'gpt-5.4' },
  'gpt-5.4': { model: 'gpt-5.4' },
  'gpt-5.3-codex': { model: 'gpt-5.3-codex' },
  'gpt-5.3-codex-spark': { model: 'gpt-5.3-codex-spark' },
  codexspark: { model: 'gpt-5.3-codex-spark' },
  'gpt-5.2-codex': { model: 'gpt-5.2-codex' },
  'gpt-5.1-codex-max': { model: 'gpt-5.1-codex-max' },
  'gpt-5.1-codex-mini': { model: 'gpt-5.1-codex-mini' },
  'gpt-5.4-mini': { model: 'gpt-5.4-mini' },
  'gpt-5.2': { model: 'gpt-5.2' },
} as const

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readNestedString(
  value: unknown,
  paths: string[][],
): string | undefined {
  for (const path of paths) {
    let current = value
    let valid = true
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        valid = false
        break
      }
      current = (current as Record<string, unknown>)[key]
    }
    if (!valid) continue
    const stringValue = asTrimmedString(current)
    if (stringValue) return stringValue
  }
  return undefined
}

function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const parts = token.split('.')
  if (parts.length < 2) return undefined

  try {
    const payload = parts[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = Buffer.from(padded, 'base64').toString('utf8')
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Parse ChatGPT account ID from a JWT token
 */
export function parseChatgptAccountId(
  token: string | undefined,
): string | undefined {
  if (!token) return undefined
  const payload = decodeJwtPayload(token)
  const fromClaim = asTrimmedString(
    payload?.['https://api.openai.com/auth.chatgpt_account_id'],
  )
  if (fromClaim) return fromClaim
  return asTrimmedString(payload?.chatgpt_account_id)
}

/**
 * Resolve the path to Codex auth.json
 */
export function resolveCodexAuthPath(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const explicit = asTrimmedString(env.CODEX_AUTH_JSON_PATH)
  if (explicit) return explicit

  const codexHome = asTrimmedString(env.CODEX_HOME)
  if (codexHome) return join(codexHome, 'auth.json')

  return join(homedir(), '.codex', 'auth.json')
}

/**
 * Load Codex auth.json file
 */
function loadCodexAuthJson(
  authPath: string,
): Record<string, unknown> | undefined {
  if (!existsSync(authPath)) return undefined
  try {
    const raw = readFileSync(authPath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Check if a base URL is the official Codex endpoint
 */
export function isCodexBaseUrl(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false
  try {
    const parsed = new URL(baseUrl)
    return (
      parsed.hostname === 'chatgpt.com' &&
      parsed.pathname.replace(/\/+$/, '') === '/backend-api/codex'
    )
  } catch {
    return false
  }
}

/**
 * Check if model name is a Codex alias
 */
function isCodexAlias(model: string): boolean {
  const normalized = model.trim().toLowerCase()
  const base = normalized.split('?', 1)[0] ?? normalized
  return base in CODEX_ALIAS_MODELS
}

/**
 * Resolve Codex API credentials from env vars or auth.json
 */
export function resolveCodexApiCredentials(
  env: NodeJS.ProcessEnv = process.env,
): ResolvedCodexCredentials {
  // First check environment variables
  const envApiKey = asTrimmedString(env.CODEX_API_KEY)
  const envAccountId =
    asTrimmedString(env.CODEX_ACCOUNT_ID) ??
    asTrimmedString(env.CHATGPT_ACCOUNT_ID)

  if (envApiKey) {
    return {
      apiKey: envApiKey,
      accountId: envAccountId ?? parseChatgptAccountId(envApiKey),
      source: 'env',
    }
  }

  // Fall back to auth.json file
  const authPath = resolveCodexAuthPath(env)
  const authJson = loadCodexAuthJson(authPath)
  if (!authJson) {
    return {
      apiKey: '',
      authPath,
      source: 'none',
    }
  }

  // Extract API key from various possible locations in auth.json
  const apiKey = readNestedString(authJson, [
    ['access_token'],
    ['accessToken'],
    ['tokens', 'access_token'],
    ['tokens', 'accessToken'],
    ['auth', 'access_token'],
    ['auth', 'accessToken'],
    ['token', 'access_token'],
    ['token', 'accessToken'],
    ['tokens', 'id_token'],
    ['tokens', 'idToken'],
    ['OPENAI_API_KEY'],
  ])
  
  // Extract account ID
  const accountId =
    envAccountId ??
    readNestedString(authJson, [
      ['account_id'],
      ['accountId'],
      ['tokens', 'account_id'],
      ['tokens', 'accountId'],
      ['auth', 'account_id'],
      ['auth', 'accountId'],
    ]) ??
    parseChatgptAccountId(apiKey)

  if (!apiKey) {
    return {
      apiKey: '',
      accountId,
      authPath,
      source: 'none',
    }
  }

  return {
    apiKey,
    accountId,
    authPath,
    source: 'auth.json',
  }
}

/**
 * Resolve provider request settings based on model and base URL
 */
export function resolveProviderRequest(options?: {
  model?: string
  baseUrl?: string
  fallbackModel?: string
}): ResolvedProviderRequest {
  const requestedModel =
    options?.model?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    options?.fallbackModel?.trim() ||
    'gpt-4o'
  
  const rawBaseUrl =
    options?.baseUrl ??
    process.env.OPENAI_BASE_URL ??
    process.env.OPENAI_API_BASE ??
    undefined

  // Use Codex transport only when:
  // - the base URL is explicitly the Codex endpoint, OR
  // - the model is a Codex alias AND no custom base URL has been set
  const transport: ProviderTransport =
    isCodexBaseUrl(rawBaseUrl) || (!rawBaseUrl && isCodexAlias(requestedModel))
      ? 'codex_responses'
      : 'chat_completions'

  // Resolve model alias
  const normalizedModel = requestedModel.trim().toLowerCase()
  const baseModel = normalizedModel.split('?', 1)[0] ?? normalizedModel
  const aliasConfig = CODEX_ALIAS_MODELS[baseModel as keyof typeof CODEX_ALIAS_MODELS]
  const resolvedModel = aliasConfig?.model ?? requestedModel

  return {
    transport,
    requestedModel,
    resolvedModel,
    baseUrl:
      (rawBaseUrl ??
        (transport === 'codex_responses'
          ? DEFAULT_CODEX_BASE_URL
          : DEFAULT_OPENAI_BASE_URL)
      ).replace(/\/+$/, ''),
  }
}

/**
 * Get the URL for fetching Codex usage/rate-limit information
 */
export function getCodexUsageUrl(baseUrl = DEFAULT_CODEX_BASE_URL): string {
  return new URL('/backend-api/wham/usage', baseUrl).toString()
}
