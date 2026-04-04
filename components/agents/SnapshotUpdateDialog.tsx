/**
 * Snapshot Update Dialog - Stub
 */
import React from 'react'

export interface SnapshotUpdateDialogProps {
  onClose: () => void
}

export function SnapshotUpdateDialog({ onClose }: SnapshotUpdateDialogProps): React.ReactElement {
  React.useEffect(() => {
    // Auto-close since this is a stub
    onClose()
  }, [onClose])
  
  return null as unknown as React.ReactElement
}

export default SnapshotUpdateDialog
