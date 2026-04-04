# OpenAI/ChatGPT Setup for Claude Code

This guide explains how to use OpenAI models (GPT-5.4, GPT-5.3 Codex, etc.) with Claude Code CLI.

## Quick Start

### Using OpenRouter (Recommended - Easier)

OpenRouter provides a universal API that supports OpenAI models with the same message format Claude Code uses.

```powershell
# Windows PowerShell
$env:CLAUDE_CODE_USE_OPENAI="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"  # Get from https://openrouter.ai/keys
$env:OPENAI_MODEL="openai/gpt-5.4"
claudecode
```

```bash
# Linux/macOS
export CLAUDE_CODE_USE_OPENAI=true
export OPENROUTER_API_KEY=sk-or-v1-xxxxx
export OPENAI_MODEL=openai/gpt-5.4
claudecode
```

### Available OpenAI Models (via OpenRouter)

| Model | ID | Speed | Cost |
|-------|-----|-------|------|
| GPT-5.4 | `openai/gpt-5.4` | ⚡ | $$$ |
| GPT-5.4 Mini | `openai/gpt-5.4-mini` | ⚡⚡⚡ | $ |
| GPT-5.3 Codex | `openai/gpt-5.3-codex` | ⚡⚡ | $$ |
| GPT-5.2 Codex | `openai/gpt-5.2-codex` | ⚡⚡ | $$ |
| GPT-5.2 | `openai/gpt-5.2` | ⚡⚡ | $$ |
| GPT-5.1 Codex Max | `openai/gpt-5.1-codex-max` | ⚡ | $$$ |
| GPT-5.1 Codex Mini | `openai/gpt-5.1-codex-mini` | ⚡⚡⚡ | $ |

Check https://openrouter.ai/models for current pricing and availability.

## Environment Variables

### Required (one of these)

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key (recommended) |
| `OPENAI_API_KEY` | Direct OpenAI API key (requires OpenRouter for format translation) |

### Optional

| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_USE_OPENAI` | Set to `true` to enable OpenAI mode |
| `OPENAI_MODEL` | Model ID (default: `openai/gpt-5.4`) |
| `ANTHROPIC_MODEL` | Alternative model override |
| `OPENROUTER_REFERER` | Your site URL for OpenRouter rankings |
| `OPENROUTER_TITLE` | App name for OpenRouter rankings |

## ChatGPT OAuth (Coming Soon)

We're working on adding native ChatGPT OAuth support, which will let you use your ChatGPT Plus/Pro/Team subscription directly without an API key.

### Current Status

✅ **Works Now**: OpenAI models via OpenRouter API
🚧 **In Progress**: ChatGPT OAuth (device code flow)
📋 **Planned**: Direct OpenAI API support

### Authentication Module (Preview)

The OpenAI OAuth module is created but not yet integrated into the onboarding flow:

```typescript
import { 
  requestDeviceCode, 
  completeDeviceCodeFlow 
} from 'src/services/openai'

// Request device code
const deviceCode = await requestDeviceCode()
console.log(`Visit: ${deviceCode.verificationUrl}`)
console.log(`Enter code: ${deviceCode.userCode}`)

// Wait for user to authorize
const tokens = await completeDeviceCodeFlow(deviceCode)
```

## Model Comparison

| Feature | Claude (Anthropic) | GPT-5.4 (OpenAI) | Qwen 3.6 (Free) |
|---------|-------------------|-----------------|-----------------|
| Cost | $$-$$$$ | $$ | FREE |
| Coding | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Reasoning | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Context | 200K-1M | 128K | 32K |

## Troubleshooting

### "402 requires more credits"

OpenAI models on OpenRouter require credits. Either:
1. Add credits at https://openrouter.ai/settings/credits
2. Use a free model like `qwen/qwen3.6-plus:free`

### Model not responding

Try a different model:
```powershell
$env:OPENAI_MODEL="openai/gpt-5.4-mini"  # Cheaper, faster
```

### "OPENAI_API_KEY required" error

You need either:
- `OPENROUTER_API_KEY` from https://openrouter.ai/keys (recommended)
- `OPENAI_API_KEY` from https://platform.openai.com/api-keys

## Files Created

This integration created/modified:

- `services/openai/config.ts` - OAuth configuration
- `services/openai/pkce.ts` - PKCE authentication
- `services/openai/deviceCode.ts` - Device code OAuth flow
- `services/openai/tokenStorage.ts` - Token persistence
- `services/openai/types.ts` - TypeScript types
- `services/openai/index.ts` - Module exports
- `utils/model/providers.ts` - Added 'openai' provider
- `utils/model/configs.ts` - Added OpenAI model mappings
- `utils/auth.ts` - Added OpenAI to 3P auth bypass
- `services/api/client.ts` - Added OpenAI client initialization

## See Also

- [OPENROUTER_SETUP.md](./OPENROUTER_SETUP.md) - OpenRouter documentation
- [QUICK_START_OPENROUTER.md](./QUICK_START_OPENROUTER.md) - Quick start guide
- https://openrouter.ai/models - Available models
- https://platform.openai.com/docs - OpenAI documentation
