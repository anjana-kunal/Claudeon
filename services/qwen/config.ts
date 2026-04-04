/**
 * Qwen OAuth/OpenAI-compatible API configuration.
 *
 * OAuth endpoints mirror qwen-code's device flow:
 * https://github.com/QwenLM/qwen-code
 */
export const QWEN_OAUTH_CONFIG = {
  OAUTH_BASE_URL: 'https://chat.qwen.ai',
  DEVICE_CODE_URL: 'https://chat.qwen.ai/api/v1/oauth2/device/code',
  TOKEN_URL: 'https://chat.qwen.ai/api/v1/oauth2/token',
  CLIENT_ID: 'f0304373b74a44d2b584a3fb70ca9e56',
  DEVICE_GRANT_TYPE: 'urn:ietf:params:oauth:grant-type:device_code',
  SCOPE: 'openid profile email model.completion',

  // Fallback API endpoint (DashScope) - OAuth tokens use portal.qwen.ai based on resource_url
  API_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  // Portal endpoint used with OAuth tokens
  PORTAL_API_BASE_URL: 'https://portal.qwen.ai/v1',

  DEVICE_CODE_TIMEOUT_MS: 15 * 60 * 1000,
  DEFAULT_POLL_INTERVAL_MS: 2000,
} as const

export type QwenOAuthConfig = typeof QWEN_OAUTH_CONFIG
