/**
 * OpenAI services module
 * 
 * Provides ChatGPT OAuth authentication and OpenAI API integration
 */

// Configuration
export { OPENAI_OAUTH_CONFIG } from './config.js'
export type { OpenAIOAuthConfig } from './config.js'

// Provider Configuration (Codex-compatible)
export {
  DEFAULT_OPENAI_BASE_URL,
  DEFAULT_CODEX_BASE_URL,
  resolveCodexAuthPath,
  resolveCodexApiCredentials,
  resolveProviderRequest,
  parseChatgptAccountId,
  isCodexBaseUrl,
  getCodexUsageUrl,
} from './providerConfig.js'
export type {
  ProviderTransport,
  ResolvedCodexCredentials,
  ResolvedProviderRequest,
} from './providerConfig.js'

// Types
export type {
  DeviceCodeResponse,
  OpenAITokens,
  OpenAIAuthData,
  OpenAIUserInfo,
  ChatGPTSubscriptionType,
  OpenAIResponse,
  ChatCompletionChoice,
  ChatCompletionDelta,
  ToolCall,
} from './types.js'

// PKCE
export {
  generatePkceCodes,
  verifyPkceChallenge,
  type PkceCodes,
} from './pkce.js'

// Device Code OAuth
export {
  requestDeviceCode,
  completeDeviceCodeFlow,
  exchangeIdTokenForApiKey,
  refreshOpenAIToken,
} from './deviceCode.js'

// Token Storage
export {
  loadOpenAIAuth,
  saveOpenAIAuth,
  saveOpenAITokens,
  saveOpenAIApiKey,
  clearOpenAIAuth,
  clearOpenAIExchangedApiKey,
  isOpenAIAuthValid,
  getOpenAIAccessToken,
  getOpenAIExchangedApiKey,
  getOpenAIRefreshToken,
  updateOpenAIExchangedApiKey,
  updateOpenAITokens,
} from './tokenStorage.js'

// OpenAI Client
export {
  getOpenAIClient,
  convertAnthropicToOpenAI,
  convertOpenAIToAnthropic,
  convertAnthropicToolsToOpenAI,
  isCodexModel,
  createCodexChatCompletion,
} from './client.js'

// Codex Shim (for Codex backend API)
export {
  performCodexRequest,
  collectCodexResponse,
  readCodexSseEvents,
  convertCodexToOpenAIFormat,
} from './codexShim.js'
export type {
  CodexUsage,
  CodexStreamEvent,
  CodexRequestParams,
} from './codexShim.js'

// Anthropic SDK Wrapper
export {
  createOpenAIAnthropicWrapper,
  shouldUseOpenAIWrapper,
} from './anthropicWrapper.js'

