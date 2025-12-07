// This file must be imported before MSW to polyfill localStorage and browser APIs
const storage = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size
    },
  },
  writable: true,
  configurable: true,
})

// Mock browser extension APIs (chrome and browser) for webextension-polyfill
;(() => {
  const browserStorage = new Map<string, any>()
  const storageListeners = new Set<Function>()

  const browserAPI = {
    storage: {
      sync: {
        get: async (keys?: string | string[]) => {
          if (!keys) return Object.fromEntries(browserStorage)
          const keyArray = Array.isArray(keys) ? keys : [keys]
          const result: Record<string, any> = {}
          for (const key of keyArray) {
            if (browserStorage.has(key)) {
              result[key] = browserStorage.get(key)
            }
          }
          return result
        },
        set: async (items: Record<string, any>) => {
          const changes: Record<string, any> = {}
          for (const [key, value] of Object.entries(items)) {
            const oldValue = browserStorage.get(key)
            browserStorage.set(key, value)
            changes[key] = { oldValue, newValue: value }
          }
          storageListeners.forEach((listener) => listener(changes, 'sync'))
        },
      },
      onChanged: {
        addListener: (callback: Function) => {
          storageListeners.add(callback)
        },
        removeListener: (callback: Function) => {
          storageListeners.delete(callback)
        },
      },
    },
    runtime: {
      id: 'test-extension-id',
    },
  }

  // Mock both chrome and browser globals for webextension-polyfill
  Object.defineProperty(globalThis, 'chrome', {
    value: browserAPI,
    writable: true,
    configurable: true,
  })

  Object.defineProperty(globalThis, 'browser', {
    value: browserAPI,
    writable: true,
    configurable: true,
  })
})()
