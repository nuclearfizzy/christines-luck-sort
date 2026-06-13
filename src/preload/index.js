import { contextBridge } from 'electron'

// The preload script is the ONLY place allowed to bridge the secure window
// and the system. We expose a tiny, read-only surface — nothing dangerous.
const api = {
  platform: process.platform
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // Fallback (context isolation disabled) — shouldn't happen with our config.
  window.api = api
}
