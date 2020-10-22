import { QueryCache } from 'react-query'

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000,
    },
  },
})

export default queryCache
