# Claude Code CLI - Local Build

This is a local source build of the Claude Code CLI.

WARNING: This codebase is community-maintained from extracted sources. Some internal features are stubbed and may not work.

## Prerequisites

1. Bun (required): https://bun.sh
2. Node.js 18+ (recommended for running the built CLI and wrapper scripts)

Install Bun:

```powershell
# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

## Quick Install (Windows, Recommended)

Use this from the repository root (not a nested src folder):

```powershell
cd "C:\path\to\claudecode"
bun install
bun run install:global
claudecode --version
```

What `bun run install:global` does:

- Builds automatically if `dist/cli.js` is missing
- Creates `%USERPROFILE%\claudecode.cmd`
- Adds `%USERPROFILE%` to your User PATH (if needed)
- Verifies the install by running `claudecode --version`

If a different terminal still cannot find `claudecode`, close and reopen that terminal.

## Install (macOS/Linux)

```bash
cd /path/to/claudecode
bun install
bun run build
node ./dist/cli.js --version
```

## Run

```powershell
# Global command (after install:global on Windows)
claudecode

# Run built CLI directly
node .\dist\cli.js

# Development mode from source
bun run start

# Hot-reload dev mode
bun run dev
```

## Authentication and Provider Modes

Default mode is Anthropic first-party. You can also enable third-party providers.

| Provider | Enable flag | Auth / required env | Model env |
|---|---|---|---|
| Anthropic (default) | none | `ANTHROPIC_API_KEY` or account login | `ANTHROPIC_MODEL` |
| OpenRouter | `CLAUDE_CODE_USE_OPENROUTER=true` | `OPENROUTER_API_KEY` | `ANTHROPIC_MODEL` |
| OpenAI | `CLAUDE_CODE_USE_OPENAI=true` | `OPENAI_API_KEY` or ChatGPT OAuth login | `OPENAI_MODEL` (or `ANTHROPIC_MODEL`) |
| Gemini | `CLAUDE_CODE_USE_GEMINI=true` | `GEMINI_API_KEY` / `GOOGLE_API_KEY` or Google OAuth login | `GEMINI_MODEL` (or `ANTHROPIC_MODEL`) |
| Qwen | `CLAUDE_CODE_USE_QWEN=true` | qwen.ai OAuth login | `QWEN_MODEL` (or `ANTHROPIC_MODEL`) |
| NVIDIA | `CLAUDE_CODE_USE_NVIDIA=true` | `NVIDIA_API_KEY` | `NVIDIA_MODEL` (or `ANTHROPIC_MODEL`) |
| Mistral API | `CLAUDE_CODE_USE_MISTRAL=true` | `MISTRAL_API_KEY` | `MISTRAL_MODEL` (or `ANTHROPIC_MODEL`) |
| AWS Bedrock | `CLAUDE_CODE_USE_BEDROCK=true` | AWS credentials + region | `ANTHROPIC_MODEL` |
| Google Vertex | `CLAUDE_CODE_USE_VERTEX=true` | GCP auth + project/region | `ANTHROPIC_MODEL` |
| Microsoft Foundry | `CLAUDE_CODE_USE_FOUNDRY=true` | Foundry auth vars | `ANTHROPIC_MODEL` |

## Newly Added / Updated LLM Model Targets

These are the current default or mapped model targets used in code:

| Mode | Main default | Small/Fast default |
|---|---|---|
| Anthropic first-party | `claude-sonnet-4-6` (or `claude-opus-4-6` for some plans) | `claude-haiku-4-5-20251001` |
| OpenAI mode | `openai/gpt-5.4` | `openai/gpt-5.4-mini` |
| Gemini mode | `gemini/gemini-2.5-pro` | `gemini/gemini-2.5-flash` |
| Qwen mode | `qwen/coder-model` | `qwen/coder-model` |
| NVIDIA mode | `nvidia/z-ai/glm5` | `nvidia/minimaxai/minimax-m2.5` |
| Mistral mode | `mistral/codestral-latest` | `mistral/codestral-latest` |

OpenRouter is model-ID driven. Set `ANTHROPIC_MODEL` explicitly.
Common examples:

- `anthropic/claude-sonnet-4.6`
- `anthropic/claude-opus-4.6`
- `qwen/qwen3.6-plus:free`
- `openrouter/free`
- `openai/gpt-5.4`

## Quick Provider Examples

OpenRouter:

```powershell
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="qwen/qwen3.6-plus:free"
.\claudecode.cmd
```

OpenAI:

```powershell
$env:CLAUDE_CODE_USE_OPENAI="true"
$env:OPENAI_API_KEY="sk-xxxxx"
$env:OPENAI_MODEL="openai/gpt-5.4"
.\claudecode.cmd
```

Gemini:

```powershell
$env:CLAUDE_CODE_USE_GEMINI="true"
$env:GEMINI_API_KEY="your-gemini-key"
$env:GEMINI_MODEL="gemini/gemini-2.5-pro"
.\claudecode.cmd
```

NVIDIA:

```powershell
$env:CLAUDE_CODE_USE_NVIDIA="true"
$env:NVIDIA_API_KEY="nvapi-xxxxx"
$env:NVIDIA_MODEL="nvidia/z-ai/glm5"
.\claudecode.cmd
```

## What Works

- Core CLI + REPL
- File read/write/edit tools
- Shell tools (bash/powershell)
- Most built-in tools
- MCP server support
- Multi-provider model routing

## Known Stubbed/Internal Features

- `@ant/computer-use-mcp`
- `@ant/computer-use-swift`
- `@ant/computer-use-input`
- `@ant/claude-for-chrome-mcp`
- `@anthropic-ai/mcpb`
- Native color-diff (fallback used)
- Native keyboard modifier detection

## Troubleshooting

Reinstall dependencies:

```powershell
bun install --force
```

Clean and rebuild:

```powershell
Remove-Item -Recurse -Force dist
bun run build
```

Type check:

```powershell
bun run typecheck
```

## Project Layout (Current)

```text
.
|- entrypoints/    # CLI entry points (cli.tsx, mcp.ts)
|- tools/          # Built-in tools
|- services/       # API and provider integrations
|- components/     # React/Ink UI components
|- utils/          # Core utilities and model logic
|- stubs/          # Stubs for internal dependencies
|- scripts/        # Build and dev scripts
|- dist/           # Build output
|- claudecode.cmd  # Windows wrapper
|- package.json
`- tsconfig.json
```

## Additional Setup Docs

- [OPENROUTER_SETUP.md](./OPENROUTER_SETUP.md)
- [QUICK_START_OPENROUTER.md](./QUICK_START_OPENROUTER.md)
- [OPENROUTER_FIXES.md](./OPENROUTER_FIXES.md)
- [OPENAI_SETUP.md](./OPENAI_SETUP.md)

## License

This repository is intended for local experimentation and learning.
Review upstream licensing and ownership details before redistribution.
