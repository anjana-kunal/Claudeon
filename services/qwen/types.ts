export interface QwenDeviceCodeResponse {
  deviceCode: string
  userCode: string
  verificationUrl: string
  verificationUrlComplete: string
  expiresIn: number
}

export interface QwenTokens {
  accessToken: string
  refreshToken?: string
  idToken?: string
  tokenType: string
  expiresAt: number
  resourceUrl?: string
}

export interface QwenAuthData {
  tokens: QwenTokens
  authMethod: 'oauth'
  createdAt: number
  lastUsed: number
}

