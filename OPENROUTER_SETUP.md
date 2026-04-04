# Using Claude Code with OpenRouter

OpenRouter provides unified access to **hundreds of AI models** through a single API, including many **FREE** models. This guide shows you how to configure Claude Code to use any OpenRouter model.

## Setup

### 1. Get your OpenRouter API Key

1. Go to https://openrouter.ai/
2. Sign up or log in
3. Navigate to https://openrouter.ai/keys
4. Create a new API key (free account works!)

### 2. Configure Environment Variables

**Minimum required setup:**

```powershell
# Windows PowerShell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"  # Your OpenRouter API key
```

```bash
# Linux/macOS
export CLAUDE_CODE_USE_OPENROUTER=true
export OPENROUTER_API_KEY=sk-or-v1-xxxxx  # Your OpenRouter API key
```

**Using a specific model (IMPORTANT - override default):**

```powershell
# Windows PowerShell - Use a FREE model
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="qwen/qwen3.6-plus:free"  # FREE Qwen model
```

```bash
# Linux/macOS - Use a FREE model
export CLAUDE_CODE_USE_OPENROUTER=true
export OPENROUTER_API_KEY=sk-or-v1-xxxxx
export ANTHROPIC_MODEL=qwen/qwen3.6-plus:free  # FREE Qwen model
```

### 3. Run Claude Code

```powershell
claudecode
```

## Available Models (Updated 2026-04-02)

Browse all models at: **https://openrouter.ai/models**

### Free Models (VERIFIED WORKING)

| Model | OpenRouter ID | Description |
|-------|--------------|-------------|
| **Qwen 3.6 Plus** | `qwen/qwen3.6-plus:free` | Fast, intelligent, FREE ⭐ |
| **Qwen 3.6 Plus Preview** | `qwen/qwen3.6-plus-preview:free` | Preview version, FREE |
| **NVIDIA Nemotron 3** | `nvidia/nemotron-3-super-120b-a12b:free` | Large model, FREE |
| **MiniMax M2.5** | `minimax/minimax-m2.5:free` | Versatile, FREE |
| **StepFun Step 3.5** | `stepfun/step-3.5-flash:free` | Fast, FREE |
| **Free Models Router** | `openrouter/free` | Auto-routes to best free model |

**Note**: Google Gemini models are no longer free on OpenRouter. Use Qwen models instead!

### Premium Models (Paid)

| Model | OpenRouter ID | Cost per 1M tokens |
|-------|--------------|-------------------|
| **Claude 3.5 Sonnet** | `anthropic/claude-3.5-sonnet` | ~$3-15 |
| **GPT-5.4** | `openai/gpt-5.4` | Varies |
| **Gemini 1.5 Pro** | `google/gemini-pro-1.5` | ~$1.25-5 |

## Example Configurations

### Using FREE Qwen 3.6 (Recommended)

```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="qwen/qwen3.6-plus:free"
claudecode
```

### Using Free Router (Auto-selects best free model)

```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="openrouter/free"
claudecode
```

### Using Paid Claude 3.5 Sonnet

```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="anthropic/claude-3.5-sonnet"
claudecode
```

### Using Paid GPT-5.4

```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="openai/gpt-5.4"
claudecode
```

## Advanced Configuration

### Custom Headers (Optional)

OpenRouter allows you to track your usage better:

```powershell
# Add your site URL for rankings
$env:OPENROUTER_REFERER="https://your-site.com"

# Add app title for rankings
$env:OPENROUTER_TITLE="My AI App"
```

### Changing Models at Runtime

You can also change models during a session:

```
> /model google/gemini-2.0-flash-exp:free
Model changed to: google/gemini-2.0-flash-exp:free

> /model anthropic/claude-3.5-sonnet
Model changed to: anthropic/claude-3.5-sonnet
```

## Persistent Configuration

To avoid setting environment variables every time:

### Windows

1. Open System Properties → Advanced → Environment Variables
2. Add user variables:
   - Name: `CLAUDE_CODE_USE_OPENROUTER`, Value: `true`
   - Name: `OPENROUTER_API_KEY`, Value: `sk-or-v1-xxxxx`
   - Name: `ANTHROPIC_MODEL`, Value: `google/gemini-2.0-flash-exp:free`

### Linux/macOS

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export CLAUDE_CODE_USE_OPENROUTER=true
export OPENROUTER_API_KEY=sk-or-v1-xxxxx
export ANTHROPIC_MODEL=google/gemini-2.0-flash-exp:free
```

## Pricing

- **Free models**: Completely free, no credit card required
- **Paid models**: Only pay for what you use
- **Credits**: You can add credits at https://openrouter.ai/credits

Check current pricing at: https://openrouter.ai/models

## Finding the Right Model

1. Visit https://openrouter.ai/models
2. Use filters:
   - **Free models**: Toggle "Free" filter
   - **By provider**: Select Google, Meta, Anthropic, OpenAI, etc.
   - **By capability**: Vision, function calling, etc.
3. Copy the model ID (e.g., `google/gemini-2.0-flash-exp:free`)
4. Set it in `ANTHROPIC_MODEL` environment variable

## Troubleshooting

### Error: OPENROUTER_API_KEY environment variable is required

Make sure you've set the `OPENROUTER_API_KEY` environment variable before running claudecode.

### Model not found / Model not available

- Check the model ID is correct: https://openrouter.ai/models
- Some models require credits even if listed
- Free models may have rate limits

### Rate limiting on free models

Free models have usage limits. If you hit limits:
- Wait a few minutes and try again
- Switch to a different free model
- Add credits to your account for higher limits

### Default to Claude models (expensive!)

If you don't set `ANTHROPIC_MODEL`, it will use Claude models by default which are **NOT FREE**. Always set:

```powershell
$env:ANTHROPIC_MODEL="google/gemini-2.0-flash-exp:free"
```

## Recommended Free Model

**Google Gemini 2.0 Flash** is the best free option:
- Fast responses
- High quality
- Good context window
- Completely free

```powershell
$env:ANTHROPIC_MODEL="google/gemini-2.0-flash-exp:free"
```

## Additional Features

OpenRouter supports:
- 100+ AI models from various providers
- Automatic fallback to alternative models
- Usage tracking and analytics
- Custom model routing
- Free and paid options
- No vendor lock-in

For more information, visit https://openrouter.ai/docs

