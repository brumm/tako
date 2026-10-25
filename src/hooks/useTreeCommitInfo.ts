import { useQuery } from '@tanstack/react-query'
import { useTako } from '../components/Tako'
import { fetchTreeCommitInfo } from '../lib/tree-commit-info'

export const useTreeCommitInfo = (path: string, config = {}) => {
  const tako = useTako()
  return useQuery({
    queryKey: ['treeCommitInfo', tako.repository, path],
    queryFn: () => fetchTreeCommitInfo(tako.repository, path),
    ...config,
  })
}
