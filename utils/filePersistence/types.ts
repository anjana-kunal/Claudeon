/**
 * File Persistence Types
 */

export interface PersistedFile {
  path: string
  size: number
  hash: string
  uploadedAt: Date
}

export interface FailedPersistence {
  path: string
  error: string
  attempts: number
}

export interface FilesPersistedEventData {
  files: PersistedFile[]
  failed: FailedPersistence[]
  totalSize: number
  duration: number
}

export type TurnStartTime = number | Date

export const DEFAULT_UPLOAD_CONCURRENCY = 5
export const FILE_COUNT_LIMIT = 1000
export const OUTPUTS_SUBDIR = '.outputs'
