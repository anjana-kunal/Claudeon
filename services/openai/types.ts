/**
 * Type definitions for OpenAI OAuth
 */

/**
 * Response from device code request
 */
export interface DeviceCodeResponse {
  deviceAuthId: string
  userCode: string
  verificationUrl: string
  pollInterval: number  // seconds
  expiresIn: number     // seconds
}

/**
 * OAuth tokens returned after successful authentication
 */
export interface OpenAITokens {
  accessToken: string
  refreshToken: string
  idToken?: string
  expiresAt: number  // Unix timestamp in milliseconds
  tokenType: string  // Usually 'Bearer'
}

/**
 * Stored auth data for OpenAI
 */
export interface OpenAIAuthData {
  tokens: OpenAITokens
  apiKey?: string  // For API key auth instead of OAuth
  exchangedApiKey?: string // API key obtained from id_token token-exchange
  authMethod: 'oauth' | 'apikey'
  createdAt: number
  lastUsed: number
  userInfo?: OpenAIUserInfo
}

/**
 * User information from ID token
 */
export interface OpenAIUserInfo {
  sub?: string
  email?: string
  name?: string
  workspaceId?: string
}

/**
 * ChatGPT subscription types
 */
export type ChatGPTSubscriptionType = 
  | 'free'
  | 'plus'
  | 'pro'
  | 'team'
  | 'enterprise'
  | 'edu'

/**
 * OpenAI API response wrapper
 */
export interface OpenAIResponse<T> {
  id: string
  object: string
  created: number
  model: string
  choices: T[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Chat completion choice
 */
export interface ChatCompletionChoice {
  index: number
  message: {
    role: 'assistant'
    content: string | null
    tool_calls?: ToolCall[]
  }
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
}

/**
 * Tool call in response
 */
export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

/**
 * Streaming delta for chat completions
 */
export interface ChatCompletionDelta {
  role?: 'assistant'
  content?: string
  tool_calls?: Partial<ToolCall>[]
}
