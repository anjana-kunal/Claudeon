# Quick Start: OpenRouter with FREE Models

## Copy-Paste Setup (Windows PowerShell)

### Option 1: Qwen 3.6 Plus (FREE, Recommended)
```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"  # Get from https://openrouter.ai/keys
$env:ANTHROPIC_MODEL="qwen/qwen3.6-plus:free"
claudecode
```

### Option 2: Free Models Router (Auto-selects best)
```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"  
$env:ANTHROPIC_MODEL="openrouter/free"
claudecode
```

### Option 3: NVIDIA Nemotron 3 (FREE, Large)
```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"  
$env:ANTHROPIC_MODEL="nvidia/nemotron-3-super-120b-a12b:free"
claudecode
```

## Copy-Paste Setup (Linux/macOS)

### Qwen 3.6 Plus (FREE)
```bash
export CLAUDE_CODE_USE_OPENROUTER=true
export OPENROUTER_API_KEY=sk-or-v1-xxxxx  # Get from https://openrouter.ai/keys
export ANTHROPIC_MODEL=qwen/qwen3.6-plus:free
claudecode
```

## Get Your API Key

1. Visit: https://openrouter.ai/keys
2. Sign up (free!)
3. Create an API key
4. Copy it and replace `sk-or-v1-xxxxx` above

## Browse All Models

Visit https://openrouter.ai/models to see:
- 100+ available models
- FREE models (no credit card needed)
- Pricing for paid models
- Model capabilities

## Change Models Anytime

Just set a different model ID:
```powershell
# Switch to another free model
$env:ANTHROPIC_MODEL="qwen/qwen3.6-plus-preview:free"

# Switch to a paid model
$env:ANTHROPIC_MODEL="openai/gpt-5.4"
```

Or change during a session:
```
> /model qwen/qwen3.6-plus:free
```

## Popular FREE Models (2026-04-02)

| Model | ID | Speed | Quality |
|-------|-----|-------|---------|
| Qwen 3.6 Plus | `qwen/qwen3.6-plus:free` | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| Free Router | `openrouter/free` | ⚡⚡⚡ | ⭐⭐⭐⭐ |
| NVIDIA Nemotron | `nvidia/nemotron-3-super-120b-a12b:free` | ⚡⚡ | ⭐⭐⭐⭐ |
| MiniMax M2.5 | `minimax/minimax-m2.5:free` | ⚡⚡⚡ | ⭐⭐⭐ |

**Note**: Google Gemini models are no longer free on OpenRouter!

For full documentation, see [OPENROUTER_SETUP.md](./OPENROUTER_SETUP.md)
