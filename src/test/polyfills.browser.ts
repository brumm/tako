// Browser test polyfills - must run before webextension-polyfill loads
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

  // @ts-ignore
  window.chrome = browserAPI
  // @ts-ignore
  window.browser = browserAPI
})()
