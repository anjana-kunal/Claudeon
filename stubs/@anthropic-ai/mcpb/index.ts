/**
 * Stub for @anthropic-ai/mcpb
 * MCP bundle/package manifest handling
 */

import { z } from 'zod'

export const McpbManifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
})

export type McpbManifest = z.infer<typeof McpbManifestSchema>

export interface McpConfig {
  command: string
  args: string[]
  env: Record<string, string>
}

export function getMcpConfigForManifest(_manifest: McpbManifest): McpConfig {
  return {
    command: '',
    args: [],
    env: {},
  }
}

export function validateManifest(data: unknown): McpbManifest {
  return McpbManifestSchema.parse(data)
}
