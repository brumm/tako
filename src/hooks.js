import React from 'react'
import { queryCache, stableStringify } from 'react-query'

export const useQueryState = queryKey => {
  const [state, setState] = React.useState({})
  const queryHash = stableStringify(queryKey)

  React.useEffect(() => queryCache.subscribe(() => setState({})), [])

  return React.useMemo(
    () => {
      const queryKey = JSON.parse(queryHash)
      const query = queryCache.getQuery(queryKey)
      return (query && query.state) || {}
    },
    [state, queryHash]
  )
}
