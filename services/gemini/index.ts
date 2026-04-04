export { GEMINI_OAUTH_CONFIG } from './config.js'
export type { GeminiOAuthConfig } from './config.js'

export type { GeminiTokens, GeminiAuthData, GeminiWebLogin } from './types.js'

export {
  loadGeminiAuth,
  saveGeminiAuth,
  saveGeminiTokens,
  clearGeminiAuth,
  isGeminiAuthValid,
  getGeminiAccessToken,
  getGeminiRefreshToken,
  updateGeminiTokens,
} from './tokenStorage.js'

export { startGeminiWebAuth, refreshGeminiToken } from './webAuth.js'

export {
  getGeminiClient,
  createGeminiAnthropicWrapper,
  shouldUseGeminiWrapper,
} from './client.js'
