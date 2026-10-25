import { queryOptions, useQuery } from '@tanstack/react-query'
import { TakoContextProps, useTako } from '../components/Tako'
import { fetchTreeEntries } from '../lib/repo-tree'

export const repoContentsQueryConfig = (tako: TakoContextProps, path: string) =>
  queryOptions({
    queryKey: ['contents', tako.repository, path],
    queryFn: () => fetchTreeEntries(tako.client, tako.repository, path),
  })

export const useRepoContentsQuery = (path: string, config = {}) => {
  const tako = useTako()
  return useQuery({ ...repoContentsQueryConfig(tako, path), ...config })
}
