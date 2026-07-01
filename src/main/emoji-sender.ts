import { clipboard, Notification } from 'electron'
import { execFile, execFileSync } from 'child_process'
import { promisify } from 'util'

const pExecFile = promisify(execFile)

/**
 * How Everymoji injects the chosen emoji into the currently focused input.
 *
 * Windows used a single native path (SetForegroundWindow + keybd_event Ctrl+V).
 * Linux has no single universal way to do this, so we detect the session and
 * pick the most reliable available tool, and ALWAYS fall back to the clipboard
 * so an emoji is never lost.
 *
 *  - x11-xdotool     : X11 sessions. Re-activates the last external window and
 *                      pastes with Ctrl+V. Window can stay open (like Windows).
 *  - wayland-wtype    : Wayland sessions with the virtual-keyboard protocol
 *                      (wlroots, COSMIC, KDE). Types the emoji directly.
 *  - wayland-ydotool  : Wayland fallback that works everywhere incl. GNOME
 *                      (uinput level). Needs the ydotoold daemon.
 *  - clipboard-only   : Nothing available. Emoji is copied and the user pastes.
 */
export type BackendKind =
  | 'x11-xdotool'
  | 'wayland-wtype'
  | 'wayland-ydotool'
  | 'clipboard-only'

export interface BackendInfo {
  kind: BackendKind
  session: 'x11' | 'wayland' | 'unknown'
  tool: string | null
  /** Human-readable hint shown in the tray tooltip / logs. */
  note: string
}

let backend: BackendInfo | null = null
let ownWindowId: number | null = null
let lastWindowId: number | null = null

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Cheap, synchronous "is this CLI tool on PATH" check (runs once at startup). */
function commandExists(cmd: string): boolean {
  try {
    execFileSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

async function run(cmd: string, args: string[], timeout = 1500): Promise<void> {
  await pExecFile(cmd, args, { timeout })
}

/**
 * Detect the best available injection backend. Cached after the first call.
 * Can be forced with EVERYMOJI_BACKEND=x11-xdotool|wayland-wtype|wayland-ydotool|clipboard-only.
 */
export function detectBackend(): BackendInfo {
  if (backend) return backend

  const sessionType = (process.env.XDG_SESSION_TYPE || '').toLowerCase()
  const onWayland = !!process.env.WAYLAND_DISPLAY || sessionType === 'wayland'
  const onX11 = !onWayland && (!!process.env.DISPLAY || sessionType === 'x11')
  const session: BackendInfo['session'] = onWayland ? 'wayland' : onX11 ? 'x11' : 'unknown'

  const override = process.env.EVERYMOJI_BACKEND as BackendKind | undefined
  if (override) {
    const toolMap: Record<BackendKind, string | null> = {
      'x11-xdotool': 'xdotool',
      'wayland-wtype': 'wtype',
      'wayland-ydotool': 'ydotool',
      'clipboard-only': null
    }
    backend = {
      kind: override,
      session,
      tool: toolMap[override] ?? null,
      note: `forced via EVERYMOJI_BACKEND=${override}`
    }
    return backend
  }

  if (onWayland) {
    if (commandExists('wtype')) {
      backend = {
        kind: 'wayland-wtype',
        session,
        tool: 'wtype',
        note: 'Wayland: types emoji directly via virtual-keyboard protocol'
      }
    } else if (commandExists('ydotool')) {
      backend = {
        kind: 'wayland-ydotool',
        session,
        tool: 'ydotool',
        note: 'Wayland: pastes via ydotool (needs the ydotoold daemon running)'
      }
    } else {
      backend = {
        kind: 'clipboard-only',
        session,
        tool: null,
        note: 'Wayland: install "wtype" (or "ydotool") for automatic insertion'
      }
    }
    return backend
  }

  // X11 or unknown (unknown often still has a usable X server via XWayland)
  if (commandExists('xdotool')) {
    backend = {
      kind: 'x11-xdotool',
      session,
      tool: 'xdotool',
      note: 'X11: re-activates the last window and pastes with Ctrl+V'
    }
  } else {
    backend = {
      kind: 'clipboard-only',
      session,
      tool: null,
      note: 'install "xdotool" for automatic insertion'
    }
  }
  return backend
}

export function getBackendInfo(): BackendInfo {
  return detectBackend()
}

/** True when the backend needs our own window to step aside before injecting. */
export function backendNeedsFocusReturn(): boolean {
  const kind = detectBackend().kind
  return kind === 'wayland-wtype' || kind === 'wayland-ydotool'
}

export function setOwnWindowId(id: number | null): void {
  ownWindowId = id
}

/** Called by the X11 foreground tracker with the last non-Everymoji window. */
export function setLastWindowId(id: number | null): void {
  if (id && id !== ownWindowId) {
    lastWindowId = id
  }
}

function notifyCopied(emoji: string): void {
  try {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Everymoji',
        body: `${emoji} kopiert – mit Strg+V einfügen`
      }).show()
    }
  } catch {
    // Notifications are best-effort only.
  }
}

/**
 * Copy the emoji to the clipboard and try to insert it at the cursor of the
 * previously focused window. Always returns true when at least the clipboard
 * step succeeded (the emoji is then never lost).
 *
 * `opts.returnFocus` is provided by the main process for Wayland backends: it
 * hides our picker so the compositor hands focus back to the target app before
 * we type into it.
 */
export async function sendEmoji(
  emoji: string,
  opts?: { returnFocus?: () => Promise<void> }
): Promise<boolean> {
  const b = detectBackend()

  // 1. Guaranteed fallback: the emoji is on the clipboard no matter what.
  clipboard.writeText(emoji)

  try {
    switch (b.kind) {
      case 'x11-xdotool': {
        // Restore the target window (mirrors the Windows SetForegroundWindow step)
        if (lastWindowId && lastWindowId !== ownWindowId) {
          await run('xdotool', ['windowactivate', '--sync', String(lastWindowId)])
        }
        await delay(60)
        await run('xdotool', ['key', '--clearmodifiers', 'ctrl+v'])
        return true
      }

      case 'wayland-wtype': {
        // Step aside so focus returns to the target, then type the emoji directly.
        if (opts?.returnFocus) await opts.returnFocus()
        else await delay(80)
        await run('wtype', ['--', emoji])
        return true
      }

      case 'wayland-ydotool': {
        if (opts?.returnFocus) await opts.returnFocus()
        else await delay(80)
        // Ctrl+V via Linux input keycodes: 29 = LEFTCTRL, 47 = V (press/release)
        await run('ydotool', ['key', '29:1', '47:1', '47:0', '29:0'])
        return true
      }

      case 'clipboard-only':
      default: {
        notifyCopied(emoji)
        return true
      }
    }
  } catch (err) {
    // Injection tool failed (missing perms, no target, timeout, …).
    // The emoji is still on the clipboard, so surface that to the user.
    console.error('[everymoji] injection failed, emoji is on the clipboard:', err)
    notifyCopied(emoji)
    return true
  }
}
