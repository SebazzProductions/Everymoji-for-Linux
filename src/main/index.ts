import { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage } from 'electron'
import { join, dirname } from 'path'
import { mkdirSync, accessSync, constants } from 'fs'
import { execFile } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  sendEmoji,
  setLastWindowId,
  setOwnWindowId,
  getBackendInfo,
  backendNeedsFocusReturn
} from './emoji-sender'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let trackTimer: ReturnType<typeof setInterval> | null = null

const backend = getBackendInfo()

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * "Portable"-style storage, mirroring the Windows build: when launched as an
 * AppImage we keep favorites/recents next to the AppImage file if that folder
 * is writable. Otherwise Electron's default (~/.config/everymoji) is used.
 */
function configurePortableStorage(): void {
  const appImage = process.env.APPIMAGE
  if (!appImage) return

  const baseDir = dirname(appImage)
  try {
    accessSync(baseDir, constants.W_OK)
  } catch {
    return // not writable (e.g. mounted read-only) -> fall back to XDG default
  }

  const dataDir = join(baseDir, 'Everymoji Data')
  const sessionDir = join(dataDir, 'session')
  const logsDir = join(dataDir, 'logs')

  try {
    mkdirSync(sessionDir, { recursive: true })
    mkdirSync(logsDir, { recursive: true })
    app.setPath('userData', dataDir)
    app.setPath('sessionData', sessionDir)
    app.setPath('logs', logsDir)
  } catch (err) {
    console.error('[everymoji] portable storage unavailable, using default:', err)
  }
}

configurePortableStorage()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 540,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // Remember our own X11 window id so the tracker can skip it.
    setOwnWindowId(getX11WindowId(mainWindow))
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/** Read the X11 window id (XID) out of Electron's native handle, if on X11. */
function getX11WindowId(win: BrowserWindow | null): number | null {
  if (!win) return null
  try {
    const handle = win.getNativeWindowHandle()
    if (handle.length >= 4) return handle.readUInt32LE(0)
  } catch {
    // Non-X11 (native Wayland) handles are not usable this way.
  }
  return null
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Anzeigen',
      click: (): void => {
        mainWindow?.show()
      }
    },
    {
      label: `Modus: ${backend.kind}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Beenden',
      click: (): void => {
        app.quit()
      }
    }
  ])

  tray.setToolTip(`Everymoji — ${backend.note}`)
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    toggleWindow()
  })
}

function toggleWindow(): void {
  if (!mainWindow) {
    createWindow()
    return
  }
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

/**
 * X11 only: poll the active window so we know where to paste. We exclude our
 * own window by PID (robust against X reparenting, where the XID from
 * getNativeWindowHandle differs from the WM-managed top-level).
 */
function startForegroundTracking(): void {
  if (backend.kind !== 'x11-xdotool') return

  trackTimer = setInterval(() => {
    if (mainWindow?.isFocused()) return
    execFile(
      'xdotool',
      ['getactivewindow', 'getwindowpid'],
      { timeout: 800 },
      (err, stdout) => {
        if (err) return
        const lines = stdout.trim().split('\n')
        if (lines.length < 2) return
        const winId = parseInt(lines[0], 10)
        const pid = parseInt(lines[1], 10)
        if (!Number.isFinite(winId) || pid === process.pid) return
        setLastWindowId(winId)
      }
    )
  }, 400)
}

// Single-instance: launching Everymoji again toggles the picker. This is how
// Wayland users bind a global hotkey (their compositor runs `everymoji`, which
// hits this handler in the already-running instance).
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    toggleWindow()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.everymoji.app')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC handlers
    ipcMain.handle('send-emoji', async (_event, emoji: string) => {
      return sendEmoji(emoji, {
        // Wayland backends need us to step aside so focus returns to the target.
        returnFocus: async () => {
          if (backendNeedsFocusReturn()) {
            mainWindow?.hide()
            await delay(120)
          }
        }
      })
    })

    ipcMain.on('window-minimize', () => {
      mainWindow?.hide()
    })

    ipcMain.on('window-close', () => {
      app.quit()
    })

    createWindow()
    createTray()
    startForegroundTracking()

    // Global hotkey Alt+E (works on X11; on Wayland it is usually blocked by the
    // compositor — bind a shortcut to the `everymoji` command instead, see README).
    const registered = globalShortcut.register('Alt+E', toggleWindow)
    if (!registered) {
      console.warn(
        '[everymoji] Alt+E global shortcut not available (typical on Wayland). ' +
          'Bind a desktop shortcut to the "everymoji" command to toggle the picker.'
      )
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  if (trackTimer) clearInterval(trackTimer)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
