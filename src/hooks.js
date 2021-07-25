import React from 'react'

export const useMountedCallback = callback => {
  const mounted = React.useRef(false)

  React.useLayoutEffect(() => {
    mounted.current = true
    return () => (mounted.current = false)
  }, [])

  return React.useCallback(
    (...args) => (mounted.current ? callback(...args) : void 0),
    [callback]
  )
}

export const useHideElementWhileMounted = element => {
  React.useEffect(() => {
    if (element) {
      element.setAttribute('hidden', '')
    }

    return () => {
      if (element) {
        element.removeAttribute('hidden')
      }
    }
  }, [element])
}

export const useObserver = (observer, selectorFn, dependencies = []) => {
  // eslint-disable-next-line
  const memoizedSelectorFn = React.useCallback(selectorFn, dependencies)

  const [state, set] = React.useState(() =>
    memoizedSelectorFn(observer.currentResult)
  )

  React.useEffect(() => {
    set(memoizedSelectorFn(observer.currentResult))

    return observer.subscribe(query => {
      set(memoizedSelectorFn(query))
    })
  }, [observer, memoizedSelectorFn])

  return state
}
