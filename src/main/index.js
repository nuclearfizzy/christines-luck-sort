import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

const isDev = !!process.env['ELECTRON_RENDERER_URL']

// Creates the actual desktop window that the game lives inside.
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 960,
    minHeight: 720,
    show: false, // stay hidden until the page is painted (avoids a white flash)
    autoHideMenuBar: true,
    backgroundColor: '#0b3d2e',
    title: "Christine's Luck Sort",
    // In dev, show our icon in the taskbar. (The packaged app uses the .exe icon.)
    ...(isDev ? { icon: join(__dirname, '../../build/icon.png') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // Security best practices: keep the web page walled off from Node.
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Open any external links in the user's real browser, not inside the app.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // In development, load the live dev server; in production, load the built files.
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Electron is ready — open the window.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS, re-open a window when the dock icon is clicked.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed (except on macOS, which stays open).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
