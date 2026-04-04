/**
 * Agents Platform commands - Stub
 */

export async function runAgentsPlatformCommand(): Promise<void> {
  console.log('Agents platform commands are not available in local builds')
}

export default {
  name: 'agents-platform',
  description: 'Agents platform features (not available in local builds)',
  run: runAgentsPlatformCommand,
}
