import { useQuery } from '@tanstack/react-query'
import { TakoContextProps, useTako } from '../components/Tako'
import { resolveSymlink } from '../lib/repo-tree'

export const symlinkQueryConfig = (tako: TakoContextProps, path: string) => ({
  queryKey: ['symlink', tako.repository, path],
  queryFn: () => resolveSymlink(tako.client, tako.repository, path),
})

export const useSymlinkQuery = (path: string, config = {}) => {
  const tako = useTako()
  return useQuery({ ...symlinkQueryConfig(tako, path), ...config })
}
