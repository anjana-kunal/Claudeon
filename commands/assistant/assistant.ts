/**
 * Assistant command - Stub
 */

export async function runAssistantCommand(): Promise<void> {
  console.log('Assistant command is not available in local builds')
}

export default {
  name: 'assistant',
  description: 'Assistant features (not available in local builds)',
  run: runAssistantCommand,
}
