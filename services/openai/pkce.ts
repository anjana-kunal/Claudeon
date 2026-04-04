/**
 * PKCE (Proof Key for Code Exchange) implementation for OpenAI OAuth
 * 
 * PKCE adds security to the OAuth authorization code flow by:
 * 1. Generating a random code_verifier
 * 2. Creating a code_challenge from the verifier
 * 3. Sending the challenge during authorization
 * 4. Sending the verifier during token exchange
 */

import { randomBytes, createHash } from 'crypto'

export interface PkceCodes {
  codeVerifier: string
  codeChallenge: string
}

/**
 * Generate a cryptographically random code verifier
 * RFC 7636 requires 43-128 characters from [A-Z, a-z, 0-9, -, ., _, ~]
 */
function generateCodeVerifier(): string {
  // Generate 32 random bytes and convert to base64url
  const buffer = randomBytes(32)
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generate a code challenge from a code verifier using SHA256
 * The challenge is the base64url-encoded SHA256 hash of the verifier
 */
function generateCodeChallenge(codeVerifier: string): string {
  const hash = createHash('sha256').update(codeVerifier).digest()
  return hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generate a complete PKCE code pair
 */
export function generatePkceCodes(): PkceCodes {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  
  return {
    codeVerifier,
    codeChallenge,
  }
}

/**
 * Verify that a code verifier matches a code challenge
 * Used for testing and validation
 */
export function verifyPkceChallenge(
  codeVerifier: string,
  codeChallenge: string
): boolean {
  const expectedChallenge = generateCodeChallenge(codeVerifier)
  return expectedChallenge === codeChallenge
}
