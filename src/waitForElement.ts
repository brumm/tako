export const waitForElement = (selector: string, timeout = 2_000) =>
  new Promise<HTMLElement>((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes.values()) {
          const element = addedNode as HTMLElement
          if (
            typeof element.matches === 'function' &&
            element.matches(selector)
          ) {
            resolve(element)
            observer.disconnect()
            clearTimeout(timerId)
          }
        }
      }
    })

    const element = document.querySelector<HTMLElement>(selector)
    if (element != null) {
      resolve(element)
    }

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    const timerId = setTimeout(() => {
      reject(new Error('Not found element match the selector:' + selector))
      observer.disconnect()
    }, timeout)
  })

export const onElementRemoval = async (
  selector: string,
  callback: () => void,
) => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const removedNode of mutation.removedNodes.values()) {
        const element = removedNode as HTMLElement
        if (
          typeof element.matches === 'function' &&
          element.matches(selector)
        ) {
          callback()
          observer.disconnect()
        }
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}