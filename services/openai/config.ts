/**
 * OpenAI/ChatGPT OAuth Configuration
 * 
 * Based on OpenAI's Codex CLI authentication system:
 * - Device code flow for CLI authentication
 * - PKCE for secure token exchange
 * - Token storage in ~/.claudecode/openai-auth.json
 */

export const OPENAI_OAUTH_CONFIG = {
  // OAuth endpoints (from Codex CLI)
  ISSUER: 'https://auth.openai.com',
  // Codex OAuth client id used by official CLI token exchange/refresh flows
  CLIENT_ID: 'app_EMoamEEZ73f0CkXaXp7hrann',
  
  // Device code endpoints
  DEVICE_CODE_URL: 'https://auth.openai.com/api/accounts/deviceauth/usercode',
  TOKEN_POLL_URL: 'https://auth.openai.com/api/accounts/deviceauth/token',
  TOKEN_EXCHANGE_URL: 'https://auth.openai.com/oauth/token',
  
  // User-facing URLs
  DEVICE_VERIFICATION_URL: 'https://auth.openai.com/codex/device',
  
  // Token refresh
  REFRESH_TOKEN_URL: 'https://auth.openai.com/oauth/token',
  
  // API endpoints
  API_BASE_URL: 'https://api.openai.com/v1',
  
  // Timeouts
  DEVICE_CODE_TIMEOUT_MS: 15 * 60 * 1000,  // 15 minutes
  POLL_INTERVAL_MS: 5000,  // 5 seconds
  
  // Scopes
  SCOPES: ['openid', 'profile', 'email'],
} as const

export type OpenAIOAuthConfig = typeof OPENAI_OAUTH_CONFIG
