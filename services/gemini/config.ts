/**
 * Gemini OAuth/OpenAI-compatible API configuration.
 *
 * OAuth client/scopes mirror Google's Gemini CLI "login with Google" flow.
 */
export const GEMINI_OAUTH_CONFIG = {
  OAUTH_BASE_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  CLIENT_ID:
    '681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com',
  CLIENT_SECRET: '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',
  SCOPES: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],

  CALLBACK_PATH: '/oauth2callback',
  CALLBACK_LISTEN_HOST: '127.0.0.1',
  WEB_LOGIN_TIMEOUT_MS: 15 * 60 * 1000,

  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/openai',
} as const

export type GeminiOAuthConfig = typeof GEMINI_OAUTH_CONFIG
