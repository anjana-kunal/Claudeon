/**
 * Assistant Session Chooser - Stub
 */
import React from 'react'

export interface AssistantSessionChooserProps {
  onClose: () => void
  onSelect?: (sessionId: string) => void
}

export function AssistantSessionChooser({ onClose }: AssistantSessionChooserProps): React.ReactElement {
  React.useEffect(() => {
    onClose()
  }, [onClose])
  
  return null as unknown as React.ReactElement
}

export default AssistantSessionChooser
