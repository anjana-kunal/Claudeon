#!/usr/bin/env bun
/**
 * Build script for Claude Code CLI
 * Handles MACRO replacement, feature flags, and bundling
 */

import { build, type BuildConfig } from 'bun'
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative, extname } from 'path'

const isDev = process.argv.includes('--dev')
const isExternal = process.argv.includes('--external')

// Build-time constants
const VERSION = process.env.VERSION || '1.0.0-local'
const BUILD_TIME = new Date().toISOString()
const PACKAGE_URL = '@anthropic-ai/claude-code'
const NATIVE_PACKAGE_URL = '@anthropic-ai/claude-code-native'
const ISSUES_EXPLAINER = 'open an issue at https://github.com/anthropics/claude-code/issues'
const FEEDBACK_CHANNEL = '#claude-code-feedback'

// Feature flags - set all to false for external builds, true for internal
const FEATURE_FLAGS: Record<string, boolean> = {
  'ABLATION_BASELINE': false,
  'AGENT_MEMORY_SNAPSHOT': false,
  'AGENT_TRIGGERS': false,
  'AGENT_TRIGGERS_REMOTE': false,
  'ALLOW_TEST_VERSIONS': isDev,
  'ANTI_DISTILLATION_CC': false,
  'AUTO_THEME': true,
  'AWAY_SUMMARY': false,
  'BASH_CLASSIFIER': false,
  'BG_SESSIONS': true,
  'BREAK_CACHE_COMMAND': false,
  'BRIDGE_MODE': false,
  'BUDDY': false,
  'BUILDING_CLAUDE_APPS': false,
  'BUILTIN_EXPLORE_PLAN_AGENTS': true,
  'BYOC_ENVIRONMENT_RUNNER': false,
  'CACHED_MICROCOMPACT': false,
  'CCR_AUTO_CONNECT': false,
  'CCR_MIRROR': false,
  'CCR_REMOTE_SETUP': false,
  'CHICAGO_MCP': false,
  'COMMIT_ATTRIBUTION': true,
  'COMPACTION_REMINDERS': true,
  'CONNECTOR_TEXT': false,
  'CONTEXT_COLLAPSE': true,
  'COORDINATOR_MODE': false,
  'COWORKER_TYPE_TELEMETRY': false,
  'DAEMON': false,
  'DIRECT_CONNECT': false,
  'DOWNLOAD_USER_SETTINGS': false,
  'DUMP_SYSTEM_PROMPT': isDev,
  'ENHANCED_TELEMETRY_BETA': false,
  'EXPERIMENTAL_SKILL_SEARCH': false,
  'EXTRACT_MEMORIES': false,
  'FILE_PERSISTENCE': false,
  'FORK_SUBAGENT': false,
  'HARD_FAIL': false,
  'HISTORY_PICKER': true,
  'HISTORY_SNIP': false,
  'HOOK_PROMPTS': false,
  'IS_LIBC_GLIBC': process.platform === 'linux',
  'IS_LIBC_MUSL': false,
  'KAIROS': false,
  'KAIROS_CHANNELS': false,
  'KAIROS_GITHUB_WEBHOOKS': false,
  'LODESTONE': false,
  'MCP_RICH_OUTPUT': true,
  'MCP_SKILLS': true,
  'MEMORY_SHAPE_TELEMETRY': false,
  'MESSAGE_ACTIONS': false,
  'MONITOR_TOOL': false,
  'NATIVE_CLIENT_ATTESTATION': false,
  'NATIVE_CLIPBOARD_IMAGE': true,
  'NEW_INIT': true,
  'OVERFLOW_TEST_TOOL': false,
  'PERFETTO_TRACING': false,
  'POWERSHELL_AUTO_MODE': true,
  'PROACTIVE': false,
  'PROMPT_CACHE_BREAK_DETECTION': false,
  'QUICK_SEARCH': true,
  'REACTIVE_COMPACT': true,
  'REVIEW_ARTIFACT': false,
  'RUN_SKILL_GENERATOR': false,
  'SELF_HOSTED_RUNNER': false,
  'SHOT_STATS': false,
  'SKILL_IMPROVEMENT': false,
  'SKIP_DETECTION_WHEN_AUTOUPDATES_DISABLED': false,
  'SLOW_OPERATION_LOGGING': false,
  'SSH_REMOTE': false,
  'STREAMLINED_OUTPUT': true,
  'TEAMMEM': false,
  'TEMPLATES': false,
  'TERMINAL_PANEL': false,
  'TOKEN_BUDGET': true,
  'TORCH': false,
  'TRANSCRIPT_CLASSIFIER': false,
  'TREE_SITTER_BASH': false,
  'TREE_SITTER_BASH_SHADOW': false,
  'UDS_INBOX': false,
  'ULTRAPLAN': false,
  'ULTRATHINK': false,
  'UNATTENDED_RETRY': false,
  'UPLOAD_USER_SETTINGS': false,
  'VERIFICATION_AGENT': false,
  'VOICE_MODE': false,
  'WEB_BROWSER_TOOL': false,
  'WORKFLOW_SCRIPTS': false,
}

// Version changelog (empty for local builds)
const VERSION_CHANGELOG = ''

console.log('🔨 Building Claude Code CLI...')
console.log(`   Version: ${VERSION}`)
console.log(`   Build time: ${BUILD_TIME}`)
console.log(`   Mode: ${isDev ? 'development' : 'production'}`)

const srcDir = join(import.meta.dir, '..')
const outDir = join(srcDir, 'dist')

// Clean output directory
if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true })
}
mkdirSync(outDir, { recursive: true })

// Create the bun:bundle shim
const bunBundleShim = `
// bun:bundle shim - provides feature() function for conditional compilation
export function feature(flag) {
  const flags = ${JSON.stringify(FEATURE_FLAGS)};
  return flags[flag] ?? false;
}
`

// React compiler runtime shim
const reactCompilerRuntimeShim = `
// React Compiler Runtime shim
export function c(size) {
  const sentinel = Symbol.for('react.memo_cache_sentinel');
  return new Array(size).fill(sentinel);
}
export const $empty = Symbol.for('react.empty');
`

// Write the shims
const shimsDir = join(outDir, '_shims')
mkdirSync(shimsDir, { recursive: true })
writeFileSync(join(shimsDir, 'bun-bundle.js'), bunBundleShim)
writeFileSync(join(shimsDir, 'react-compiler-runtime.js'), reactCompilerRuntimeShim)

// Define macros for build-time replacement (only simple identifiers)
const define: Record<string, string> = {
  'MACRO': JSON.stringify({
    VERSION,
    BUILD_TIME,
    PACKAGE_URL,
    NATIVE_PACKAGE_URL,
    ISSUES_EXPLAINER,
    FEEDBACK_CHANNEL,
    VERSION_CHANGELOG,
  }),
}

const buildConfig: BuildConfig = {
  entrypoints: [
    join(srcDir, 'entrypoints', 'cli.tsx'),
    join(srcDir, 'entrypoints', 'mcp.ts'),
  ],
  outdir: outDir,
  target: 'node',
  format: 'esm',
  splitting: true,
  sourcemap: isDev ? 'inline' : 'external',
  minify: !isDev,
  define,
  external: [
    // Node built-ins only - everything else should be bundled or stubbed
    'fs', 'path', 'os', 'crypto', 'http', 'https', 'net', 'tls', 'url',
    'stream', 'zlib', 'util', 'events', 'child_process', 'readline',
    'dns', 'tty', 'buffer', 'process', 'async_hooks', 'perf_hooks',
    'node:fs', 'node:path', 'node:os', 'node:crypto', 'node:net',
  ],
  plugins: [
    {
      name: 'bun-bundle-resolver',
      setup(build) {
        // Redirect bun:bundle imports to our shim
        build.onResolve({ filter: /^bun:bundle$/ }, () => {
          return { path: join(shimsDir, 'bun-bundle.js') }
        })
        
        // Redirect react/compiler-runtime to our shim
        build.onResolve({ filter: /^react\/compiler-runtime$/ }, () => {
          return { path: join(shimsDir, 'react-compiler-runtime.js') }
        })
        
        // Redirect @ant/* packages to stubs
        build.onResolve({ filter: /^@ant\/claude-for-chrome-mcp/ }, () => {
          return { path: join(srcDir, 'stubs', '@ant', 'claude-for-chrome-mcp', 'index.ts') }
        })
        build.onResolve({ filter: /^@ant\/computer-use-mcp/ }, () => {
          return { path: join(srcDir, 'stubs', '@ant', 'computer-use-mcp', 'index.ts') }
        })
        build.onResolve({ filter: /^@ant\/computer-use-swift/ }, () => {
          return { path: join(srcDir, 'stubs', '@ant', 'computer-use-swift', 'index.ts') }
        })
        build.onResolve({ filter: /^@ant\/computer-use-input/ }, () => {
          return { path: join(srcDir, 'stubs', '@ant', 'computer-use-input', 'index.ts') }
        })
        
        // Redirect @anthropic-ai internal packages to stubs
        build.onResolve({ filter: /^@anthropic-ai\/mcpb/ }, () => {
          return { path: join(srcDir, 'stubs', '@anthropic-ai', 'mcpb', 'index.ts') }
        })
        build.onResolve({ filter: /^@anthropic-ai\/claude-agent-sdk/ }, () => {
          return { path: join(srcDir, 'stubs', '@anthropic-ai', 'claude-agent-sdk', 'index.ts') }
        })
        
        // Redirect native modules to stubs
        build.onResolve({ filter: /^color-diff-napi$/ }, () => {
          return { path: join(srcDir, 'stubs', 'color-diff-napi', 'index.ts') }
        })
        build.onResolve({ filter: /^modifiers-napi$/ }, () => {
          return { path: join(srcDir, 'stubs', 'modifiers-napi', 'index.ts') }
        })
        
        // Handle src/ imports (absolute imports from project root)
        build.onResolve({ filter: /^src\// }, (args) => {
          const relativePath = args.path.replace(/^src\//, '')
          const possiblePaths = [
            join(srcDir, relativePath),
            join(srcDir, relativePath.replace(/\.js$/, '.ts')),
            join(srcDir, relativePath.replace(/\.js$/, '.tsx')),
          ]
          
          for (const p of possiblePaths) {
            if (existsSync(p)) {
              return { path: p }
            }
          }
          
          return undefined
        })
      },
    },
  ],
}

try {
  const result = await build(buildConfig)
  
  if (!result.success) {
    console.error('❌ Build failed:')
    for (const log of result.logs) {
      console.error(log)
    }
    process.exit(1)
  }
  
  console.log('✅ Build completed successfully!')
  console.log(`   Output: ${outDir}`)
  console.log(`   Files: ${result.outputs.length}`)
  
  // Create executable wrapper for cli
  const cliWrapper = `#!/usr/bin/env bun
import './cli.js'
`
  writeFileSync(join(outDir, 'claude'), cliWrapper)
  
} catch (error) {
  console.error('❌ Build error:', error)
  process.exit(1)
}
