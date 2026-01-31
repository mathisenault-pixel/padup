// Utilitaire de debug pour mode développement uniquement

const isDev = process.env.NODE_ENV === 'development'

export const debug = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args)
  },
  count: (label: string) => {
    if (isDev) console.count(label)
  },
  time: (label: string) => {
    if (isDev) console.time(label)
  },
  timeEnd: (label: string) => {
    if (isDev) console.timeEnd(label)
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: any[]) => {
    if (isDev) console.error(...args)
  }
}
