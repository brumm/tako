import React from 'react'

import cache from '@/cache'

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
  const [state, setState] = React.useState()

  React.useEffect(() => {
    const query = cache.getQuery(queryKey)

    if (query) {
      setState(query.state)
      query.subscribe(setState)
    }
  }, [queryKey])

  if (state) {
    return state
  }

  return {
    status: 'loading',
    error: null,
    isFetching: true,
    data: undefined,
  }
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
