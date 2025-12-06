import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTako } from '../components/Tako'
import {
  getTypeFromMode,
  repoContentsQueryConfig,
} from './useRepoContentsQuery'

export const useDirChainQuery = (path: string, config = {}) => {
  const tako = useTako()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['dir-chain', tako.repository, path],
    queryFn: async () => {
      const chain: string[] = []
      let currentPath = path

      // Recursively fetch until non-single-child
      while (true) {
        const contents = await queryClient.fetchQuery(
          repoContentsQueryConfig(tako, currentPath),
        )

        // Stop if: empty, multiple children, or single non-dir child
        // Note: fetchQuery bypasses select, so we check mode with helper
        if (
          contents.length !== 1 ||
          getTypeFromMode(contents[0].mode) !== 'dir'
        ) {
          break
        }

        // Continue chain
        chain.push(contents[0].name)
        currentPath = contents[0].path
      }

      // Fetch final level's contents
      const leafContents = await queryClient.fetchQuery(
        repoContentsQueryConfig(tako, currentPath),
      )

      return { chain, leafPath: currentPath, leafContents }
    },
    ...config,
  })
}
