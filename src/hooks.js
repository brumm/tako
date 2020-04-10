import React from 'react'
import { queryCache, stableStringify } from 'react-query'

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

export const useQueryState = queryKey => {
  const [state, setState] = React.useState({})
  const queryHash = stableStringify(queryKey)

  useMountedCallback(() => queryCache.subscribe(() => setState({})), [])

  return React.useMemo(() => {
    const queryKey = JSON.parse(queryHash)
    const query = queryCache.getQuery(queryKey)
    // `state` is only here so eslint shuts up
    return (query && state && query.state) || {}
  }, [state, queryHash])
}

export const useIdleCallback = (userFn, deps = []) => {
  const userCallback = useMountedCallback(userFn, deps)

  React.useEffect(() => {
    const handle = window.requestIdleCallback(userCallback)
    return () => window.cancelIdleCallback(handle)
  }, [userCallback])
}

export const useHideElementWhileMounted = element => {
  React.useEffect(() => {
    element.setAttribute('hidden', '')
    document.querySelector(
      '.Box-header.Box-header--blue.position-relative'
    ).style.marginBottom = 0

    return () => {
      element.removeAttribute('hidden')
      document.querySelector(
        '.Box-header.Box-header--blue.position-relative'
      ).style.marginBottom = -1
    }
  }, [element])
}
