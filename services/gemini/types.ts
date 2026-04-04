export interface GeminiTokens {
  accessToken: string
  refreshToken?: string
  idToken?: string
  tokenType: string
  expiresAt: number
}

export interface GeminiAuthData {
  tokens: GeminiTokens
  authMethod: 'oauth'
  createdAt: number
  lastUsed: number
}

export interface GeminiWebLogin {
  authUrl: string
  loginCompletePromise: Promise<GeminiTokens>
}
