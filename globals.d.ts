/**
 * Global type declarations for Claude Code CLI
 */

// MACRO build-time constants (replaced during bundling)
declare const MACRO: {
  VERSION: string
  BUILD_TIME: string
  PACKAGE_URL: string
  NATIVE_PACKAGE_URL: string
  ISSUES_EXPLAINER: string
  FEEDBACK_CHANNEL: string
  VERSION_CHANGELOG: string
}

// bun:bundle module provides feature flags for conditional compilation
declare module 'bun:bundle' {
  /**
   * Check if a feature flag is enabled.
   * This is evaluated at build time for dead code elimination.
   */
  export function feature(flag: FeatureFlag): boolean

  type FeatureFlag =
    | 'ABLATION_BASELINE'
    | 'AGENT_MEMORY_SNAPSHOT'
    | 'AGENT_TRIGGERS'
    | 'AGENT_TRIGGERS_REMOTE'
    | 'ALLOW_TEST_VERSIONS'
    | 'ANTI_DISTILLATION_CC'
    | 'AUTO_THEME'
    | 'AWAY_SUMMARY'
    | 'BASH_CLASSIFIER'
    | 'BG_SESSIONS'
    | 'BREAK_CACHE_COMMAND'
    | 'BRIDGE_MODE'
    | 'BUDDY'
    | 'BUILDING_CLAUDE_APPS'
    | 'BUILTIN_EXPLORE_PLAN_AGENTS'
    | 'BYOC_ENVIRONMENT_RUNNER'
    | 'CACHED_MICROCOMPACT'
    | 'CCR_AUTO_CONNECT'
    | 'CCR_MIRROR'
    | 'CCR_REMOTE_SETUP'
    | 'CHICAGO_MCP'
    | 'COMMIT_ATTRIBUTION'
    | 'COMPACTION_REMINDERS'
    | 'CONNECTOR_TEXT'
    | 'CONTEXT_COLLAPSE'
    | 'COORDINATOR_MODE'
    | 'COWORKER_TYPE_TELEMETRY'
    | 'DAEMON'
    | 'DIRECT_CONNECT'
    | 'DOWNLOAD_USER_SETTINGS'
    | 'DUMP_SYSTEM_PROMPT'
    | 'ENHANCED_TELEMETRY_BETA'
    | 'EXPERIMENTAL_SKILL_SEARCH'
    | 'EXTRACT_MEMORIES'
    | 'FILE_PERSISTENCE'
    | 'FORK_SUBAGENT'
    | 'HARD_FAIL'
    | 'HISTORY_PICKER'
    | 'HISTORY_SNIP'
    | 'HOOK_PROMPTS'
    | 'IS_LIBC_GLIBC'
    | 'IS_LIBC_MUSL'
    | 'KAIROS'
    | 'KAIROS_CHANNELS'
    | 'KAIROS_GITHUB_WEBHOOKS'
    | 'LODESTONE'
    | 'MCP_RICH_OUTPUT'
    | 'MCP_SKILLS'
    | 'MEMORY_SHAPE_TELEMETRY'
    | 'MESSAGE_ACTIONS'
    | 'MONITOR_TOOL'
    | 'NATIVE_CLIENT_ATTESTATION'
    | 'NATIVE_CLIPBOARD_IMAGE'
    | 'NEW_INIT'
    | 'OVERFLOW_TEST_TOOL'
    | 'PERFETTO_TRACING'
    | 'POWERSHELL_AUTO_MODE'
    | 'PROACTIVE'
    | 'PROMPT_CACHE_BREAK_DETECTION'
    | 'QUICK_SEARCH'
    | 'REACTIVE_COMPACT'
    | 'REVIEW_ARTIFACT'
    | 'RUN_SKILL_GENERATOR'
    | 'SELF_HOSTED_RUNNER'
    | 'SHOT_STATS'
    | 'SKILL_IMPROVEMENT'
    | 'SKIP_DETECTION_WHEN_AUTOUPDATES_DISABLED'
    | 'SLOW_OPERATION_LOGGING'
    | 'SSH_REMOTE'
    | 'STREAMLINED_OUTPUT'
    | 'TEAMMEM'
    | 'TEMPLATES'
    | 'TERMINAL_PANEL'
    | 'TOKEN_BUDGET'
    | 'TORCH'
    | 'TRANSCRIPT_CLASSIFIER'
    | 'TREE_SITTER_BASH'
    | 'TREE_SITTER_BASH_SHADOW'
    | 'UDS_INBOX'
    | 'ULTRAPLAN'
    | 'ULTRATHINK'
    | 'UNATTENDED_RETRY'
    | 'UPLOAD_USER_SETTINGS'
    | 'VERIFICATION_AGENT'
    | 'VOICE_MODE'
    | 'WEB_BROWSER_TOOL'
    | 'WORKFLOW_SCRIPTS'
}

// Extend NodeJS global
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USER_TYPE?: 'ant' | 'external'
      CLAUDE_CODE_ENTRYPOINT?: string
      CLAUDE_CODE_REMOTE?: string
      CLAUDE_CODE_ABLATION_BASELINE?: string
      CLAUDE_CODE_SIMPLE?: string
      CLAUDE_CODE_DISABLE_THINKING?: string
      DISABLE_INTERLEAVED_THINKING?: string
      DISABLE_COMPACT?: string
      DISABLE_AUTO_COMPACT?: string
      CLAUDE_CODE_DISABLE_AUTO_MEMORY?: string
      CLAUDE_CODE_DISABLE_BACKGROUND_TASKS?: string
      USE_LOCAL_OAUTH?: string
      USE_STAGING_OAUTH?: string
      CLAUDE_CODE_CUSTOM_OAUTH_URL?: string
      GH_TOKEN?: string
      GITHUB_TOKEN?: string
      DEMO_VERSION?: string
      COREPACK_ENABLE_AUTO_PIN?: string
      NODE_OPTIONS?: string
    }
  }
}

export {}
