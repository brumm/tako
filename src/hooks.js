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

export const useOtherQuery = queryKey => {
  const [, setState] = React.useState({})
  const query = queryCache.getQuery(queryKey)

  React.useEffect(() => {
    if (query) {
      query.subscribe({
        id: Math.random().toString(32).slice(2),
        onStateUpdate: setState,
      })
    }
  }, [query])

  if (query) {
    return {
      status: query.state.status,
      error: query.state.error,
      isFetching: query.state.isFetching,
      data: query.state.data,
    }
  }

  return {
    status: 'loading',
    error: null,
    isFetching: true,
    data: undefined,
  }
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
