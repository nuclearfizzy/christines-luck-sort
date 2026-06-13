import { contextBridge, clipboard } from 'electron'

// The preload script is the ONLY place allowed to bridge the secure window
// and the system. We expose a tiny, safe surface — nothing dangerous.
const api = {
  platform: process.platform,
  // Lets the Daily Challenge copy a shareable result to the clipboard.
  copyToClipboard: (text) => clipboard.writeText(String(text))
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
