# Claude Code CLI - Local Build

This is a local build from source of the Claude Code CLI (originally from Anthropic's internal codebase).

**⚠️ WARNING:** This is reverse-engineered from extracted source code. Some features are stubbed out and may not work.

## Prerequisites

1. **Bun** (required) - Install from https://bun.sh
   ```powershell
   # Windows
   powershell -c "irm bun.sh/install.ps1 | iex"
   
   # macOS/Linux
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Node.js** (optional, for npm compatibility) - v18+

## Installation

```powershell
# Navigate to this directory
cd "C:\Users\A N J A N A\Desktop\src"

# Install dependencies
bun install

# Build the CLI
bun run build

# Test it works
bun dist/cli.js --version
```

## Running

After building, you can run the CLI:

```powershell
# Run the CLI
bun dist/cli.js

# Or run directly from source (development mode)
bun run start

# Or with the wrapper script
bun dist/claude
```

## Adding to PATH (Global Installation)

To use `claude` command globally:

```powershell
# Create a batch wrapper
echo '@echo off
bun "C:\Users\A N J A N A\Desktop\src\dist\cli.js" %*' > "$env:USERPROFILE\claude.cmd"

# Add to PATH (run as admin or add permanently via System Properties)
$env:Path += ";$env:USERPROFILE"
```

## Development

```powershell
# Run in development mode with hot reload
bun run dev

# Type check
bun run typecheck

# Build in dev mode (with source maps)
bun run build:dev
```

## What Works

- Basic CLI interface and REPL
- File operations (read/write/edit)
- Shell commands (bash/powershell)
- Most built-in tools
- MCP server support

## What Doesn't Work (Stubbed Features)

The following internal Anthropic features are stubbed out:
- `@ant/computer-use-mcp` - Computer use functionality
- `@ant/computer-use-swift` - macOS Swift bridge  
- `@ant/computer-use-input` - Native input handling
- `@ant/claude-for-chrome-mcp` - Chrome extension integration
- `@anthropic-ai/mcpb` - MCP bundle handling
- Native color-diff (using fallback)
- Native keyboard modifier detection

## Authentication

You'll need to authenticate with your Anthropic account or use a third-party platform:

### Option 1: Anthropic Account (Direct)
```powershell
# Run and follow login prompts
claudecode
# Then use /login command
```

### Option 2: API Key
```powershell
$env:ANTHROPIC_API_KEY = "your-api-key-here"
claudecode
```

### Option 3: Third-Party Platforms

Claude Code supports the following third-party platforms:

#### **OpenRouter** (Recommended - FREE models available!)
```powershell
# Using FREE Google Gemini
$env:CLAUDE_CODE_USE_OPENROUTER="true"
$env:OPENROUTER_API_KEY="sk-or-v1-xxxxx"
$env:ANTHROPIC_MODEL="google/gemini-2.0-flash-exp:free"
claudecode

# Or use Meta Llama (also FREE)
$env:ANTHROPIC_MODEL="meta-llama/llama-3.1-8b-instruct:free"

# Or any model from https://openrouter.ai/models
$env:ANTHROPIC_MODEL="openai/gpt-5.4"  # Paid models also available
```
**See [OPENROUTER_SETUP.md](./OPENROUTER_SETUP.md) for full list of FREE models and detailed setup.**

#### **Amazon Bedrock**
```powershell
$env:CLAUDE_CODE_USE_BEDROCK="true"
$env:AWS_REGION="us-east-1"
# Uses AWS credentials from ~/.aws/credentials
claudecode
```

#### **Google Vertex AI**
```powershell
$env:CLAUDE_CODE_USE_VERTEX="true"
$env:ANTHROPIC_VERTEX_PROJECT_ID="your-project-id"
$env:CLOUD_ML_REGION="us-east5"
# Uses GCP credentials from gcloud CLI
claudecode
```

#### **Microsoft Foundry (Azure)**
```powershell
$env:CLAUDE_CODE_USE_FOUNDRY="true"
$env:ANTHROPIC_FOUNDRY_RESOURCE="your-resource-name"
$env:ANTHROPIC_FOUNDRY_API_KEY="your-api-key"
claudecode
```

## Troubleshooting

### Module Resolution Errors
If you see import errors, reinstall dependencies:
```powershell
bun install --force
```

### Build Errors
Clear the dist folder and rebuild:
```powershell
Remove-Item -Recurse -Force dist
bun run build
```

### TypeScript Errors
Many TS errors are expected due to missing internal type definitions.
The build should still succeed.

## Project Structure

```
src/
├── entrypoints/     # CLI entry points (cli.tsx, mcp.ts)
├── tools/           # Built-in tools
├── services/        # API and service layer
├── components/      # React/Ink UI components
├── utils/           # Utility functions
├── stubs/           # Stub packages for internal deps
├── scripts/         # Build scripts
├── dist/            # Built output (after bun run build)
└── package.json     # Dependencies
```

## Build Configuration

Feature flags and build-time constants are configured in `scripts/build.ts`.
You can modify `FEATURE_FLAGS` to enable/disable features.

## License

This source code appears to be from Anthropic's proprietary codebase.
Use at your own risk. Not intended for redistribution.
