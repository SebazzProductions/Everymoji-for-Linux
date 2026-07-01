import { ElectronAPI } from '@electron-toolkit/preload'

interface EvermojiAPI {
  sendEmoji: (emoji: string) => Promise<boolean>
  windowMinimize: () => void
  windowClose: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: EvermojiAPI
  }
}
