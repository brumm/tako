import { useQuery } from '@tanstack/react-query'
import { TakoContextProps, useTako } from '../components/Tako'

export const latestCommitInfoQueryConfig = (
  tako: TakoContextProps,
  path: string,
) => ({
  queryKey: ['lastCommit', path, tako.repository],
  queryFn: async () => {
    const response = await tako.client.repos.listCommits({
      ...tako.repository,
      path,
      page: 1,
      per_page: 1,
    })
    const item = response.data[0]
    if (item) {
      return {
        message: item.commit.message,
        date: item.commit.committer?.date,
        htmlUrl: item.html_url,
      }
    }

    return null
  },
})

export const useLatestCommitInfo = (path: string, options = {}) => {
  const tako = useTako()
  return useQuery({ ...latestCommitInfoQueryConfig(tako, path), ...options })
}
