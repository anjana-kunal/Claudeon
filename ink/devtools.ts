/**
 * Ink Devtools - Development-only module
 * This connects to React DevTools for debugging
 */

// This is a stub - devtools connection is optional
export function connectToDevtools(): void {
  // Only in development mode
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { connectToDevTools } = require('react-devtools-core')
    connectToDevTools({
      host: 'localhost',
      port: 8097,
    })
  } catch {
    // react-devtools-core not installed, skip
  }
}

// Auto-connect in development
connectToDevtools()
