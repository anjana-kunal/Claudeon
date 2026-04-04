# OpenRouter Integration - Technical Fixes

This document details all the fixes applied to make Claude Code work with OpenRouter and other third-party APIs.

## Issues Fixed

### 1. Authentication Screen Bypass
**Problem**: Even with OpenRouter configured, Claude Code showed authentication prompts asking for Claude/Anthropic login.

**Root Cause**: The `isAnthropicAuthEnabled()` function in `utils/auth.ts` didn't recognize OpenRouter as a third-party provider.

**Fix**: Added OpenRouter check to the third-party provider detection:
```typescript
const is3P =
  isEnvTruthy(process.env.CLAUDE_CODE_USE_BEDROCK) ||
  isEnvTruthy(process.env.CLAUDE_CODE_USE_VERTEX) ||
  isEnvTruthy(process.env.CLAUDE_CODE_USE_FOUNDRY) ||
  isEnvTruthy(process.env.CLAUDE_CODE_USE_OPENROUTER)  // Added
```

**File Modified**: `utils/auth.ts` (line 115-119)

---

### 2. Headers.get() Not a Function
**Problem**: Error `q.headers?.get is not a function` when making API calls.

**Root Cause**: OpenRouter returns headers as a plain JavaScript object `{key: value}` instead of a Headers instance with `.get()` method.

**Fix**: Created `safeGetHeader()` helper function to handle both cases:
```typescript
function safeGetHeader(error: APIError, headerName: string): string | null {
  if (!error.headers) return null
  
  // If headers has a .get method (Headers object), use it
  if (typeof error.headers.get === 'function') {
    return error.headers.get(headerName)
  }
  
  // If headers is a plain object, access directly
  if (typeof error.headers === 'object') {
    return (error.headers as Record<string, string>)[headerName] ?? null
  }
  
  return null
}
```

**Files Modified**: 
- `services/api/errors.ts` (lines 54-76, replaced all `error.headers?.get?.(...)` calls)
- `services/api/withRetry.ts` (lines 51-73, replaced all `error.headers?.get?.(...)` calls)

---

### 3. Headers.forEach() Not a Function  
**Problem**: Error `q.forEach is not a function` when detecting gateway fingerprints.

**Root Cause**: Code tried to iterate headers using `forEach()` method which doesn't exist on plain objects.

**Fix**: Added compatibility check to handle both Headers objects and plain objects:
```typescript
if (typeof headers.forEach === 'function') {
  // Headers object
  headers.forEach((_, key) => headerNames.push(key))
} else if (typeof headers === 'object') {
  // Plain object (from OpenRouter, etc.)
  headerNames.push(...Object.keys(headers))
}
```

**File Modified**: `services/api/logging.ts` (lines 111-127)

---

### 4. Base URL Double /v1 Issue (CRITICAL)
**Problem**: API returned 404 "model not found" even though the model exists.

**Root Cause**: The Anthropic SDK automatically appends `/v1` to the base URL. Setting `baseURL: 'https://openrouter.ai/api/v1'` resulted in requests to `https://openrouter.ai/api/v1/v1/messages` - a double `/v1`.

**Fix**: Changed base URL to not include `/v1`:
```typescript
// WRONG - results in /api/v1/v1/messages
baseURL: 'https://openrouter.ai/api/v1'

// CORRECT - SDK adds /v1 automatically, results in /api/v1/messages
baseURL: 'https://openrouter.ai/api'
```

**File Modified**: `services/api/client.ts` (line 329)

---

### 5. Default Model for OpenRouter
**Problem**: `getSmallFastModel()` and `getDefaultMainLoopModel()` returned Anthropic models like `claude-3-haiku`, which don't exist on OpenRouter (unless you use `anthropic/` prefix).

**Root Cause**: The default model functions assumed Anthropic models are always available.

**Fix**: Added OpenRouter check to return user's selected model:
```typescript
export function getSmallFastModel(): ModelName {
  // For OpenRouter, use the user's selected model
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_OPENROUTER)) {
    return process.env.ANTHROPIC_MODEL || process.env.ANTHROPIC_SMALL_FAST_MODEL || getDefaultHaikuModel()
  }
  return process.env.ANTHROPIC_SMALL_FAST_MODEL || getDefaultHaikuModel()
}

export function getDefaultMainLoopModelSetting(): ModelName | ModelAlias {
  // For OpenRouter, use the user's ANTHROPIC_MODEL env var as the default
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_OPENROUTER) && process.env.ANTHROPIC_MODEL) {
    return process.env.ANTHROPIC_MODEL
  }
  // ... rest of function
}
```

**File Modified**: `utils/model/model.ts` (lines 36-43, 183-210)

---

## Provider Support Added

### OpenRouter Configuration
```typescript
// services/api/client.ts - lines 299-324
if (isEnvTruthy(process.env.CLAUDE_CODE_USE_OPENROUTER)) {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is required')
  }

  const openRouterHeaders: Record<string, string> = {}
  if (process.env.OPENROUTER_REFERER) {
    openRouterHeaders['HTTP-Referer'] = process.env.OPENROUTER_REFERER
  }
  if (process.env.OPENROUTER_TITLE) {
    openRouterHeaders['X-Title'] = process.env.OPENROUTER_TITLE
  }

  const clientConfig: ConstructorParameters<typeof Anthropic>[0] = {
    apiKey: openRouterApiKey,
    baseURL: 'https://openrouter.ai/api',  // SDK adds /v1 automatically
    ...ARGS,
    defaultHeaders: {
      ...ARGS.defaultHeaders,
      ...openRouterHeaders,
    },
  }

  return new Anthropic(clientConfig)
}
```

### Model Mappings
Added `openrouter` field to all model configs in `utils/model/configs.ts`:

```typescript
export const CLAUDE_3_5_SONNET_CONFIG = {
  firstParty: 'claude-3-5-sonnet-20241022',
  bedrock: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  vertex: 'claude-3-5-sonnet-v2@20241022',
  foundry: 'claude-3-5-sonnet',
  openrouter: 'anthropic/claude-3.5-sonnet',  // Added
}
```

---

## Environment Variables

### Required
- `CLAUDE_CODE_USE_OPENROUTER=true` - Enables OpenRouter mode
- `OPENROUTER_API_KEY=sk-or-v1-xxxxx` - Your API key from https://openrouter.ai/keys

### Optional
- `ANTHROPIC_MODEL=model/id` - Override default model (e.g., `google/gemini-2.0-flash-exp:free`)
- `OPENROUTER_REFERER=https://yoursite.com` - Your site for OpenRouter rankings
- `OPENROUTER_TITLE=App Name` - App title for OpenRouter rankings

---

## Testing

### Test 1: Authentication Bypass
```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="test-key"
claudecode
```

**Expected**: Goes straight to theme picker, no login prompts.  
**Status**: ✅ PASS

### Test 2: Model Override
```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="test-key"
$env:ANTHROPIC_MODEL="google/gemini-2.0-flash-exp:free"
claudecode
```

**Expected**: Shows selected model in UI.  
**Status**: ✅ PASS

### Test 3: API Request
```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="qwen/qwen2.5-7b-instruct:free"
claudecode
> hi
```

**Expected**: Model responds to message.  
**Status**: ✅ PASS (after headers fixes)

---

## Compatibility Notes

### Why These Fixes Were Needed

The Anthropic SDK expects responses that conform to the Fetch API standard:
- Headers as a `Headers` object with `.get()` and `.forEach()` methods
- Specific header names for rate limiting and retries

OpenRouter (and potentially other proxies) return:
- Headers as plain JavaScript objects `{key: value}`
- Different or missing rate limit headers

### Future-Proofing

The `safeGetHeader()` helper and headers compatibility checks ensure Claude Code works with:
- ✅ Direct Anthropic API (Headers object)
- ✅ OpenRouter (plain object)
- ✅ AWS Bedrock (Headers object)  
- ✅ Google Vertex AI (Headers object)
- ✅ Microsoft Foundry (Headers object)
- ✅ Any other API proxy that returns plain object headers

---

## Files Changed

1. `utils/auth.ts` - Added OpenRouter to third-party check
2. `utils/model/providers.ts` - Added `'openrouter'` to APIProvider type
3. `utils/model/configs.ts` - Added OpenRouter model IDs to all configs
4. `utils/model/model.ts` - Added OpenRouter support to default model functions
5. `services/api/client.ts` - Added OpenRouter client initialization (with correct baseURL)
6. `services/api/errors.ts` - Added `safeGetHeader()` helper
7. `services/api/withRetry.ts` - Added `safeGetHeader()` helper
8. `services/api/logging.ts` - Fixed headers iteration compatibility

---

## Documentation Created

1. `OPENROUTER_SETUP.md` - Full setup guide with FREE models
2. `QUICK_START_OPENROUTER.md` - Quick copy-paste commands
3. `OPENROUTER_FIXES.md` - This technical document
4. Updated `README.md` - Added OpenRouter to authentication section

---

## Version

These fixes are included in Claude Code v1.0.0-local build from 2026-04-02.

---

## Credits

Fixes developed and tested with real OpenRouter API keys using free models:
- `qwen/qwen3.6-plus:free` ✅ Working!
