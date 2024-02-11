import { useQuery } from '@tanstack/react-query'
import { TakoContextProps, useTako } from '../components/Tako'

export const mostRecentRepoCommitQueryConfig = (tako: TakoContextProps) => ({
  queryKey: [
    'mostRecentRepoCommit',
    tako.repository,
    tako.repository.owner,
    tako.repository.repo,
    tako.repository.ref,
  ],
  queryFn: async () => {
    const response = await tako.client.repos.listCommits({
      owner: tako.repository.owner,
      repo: tako.repository.repo,
      sha: tako.repository.ref,
      page: 1,
      per_page: 1,
    })

    const totalCommitCount = response.headers.link?.match(
      /page=(?<count>\d+)&per_page=1>;\srel="last"/,
    )?.groups?.count

    const item = response.data[0]
    if (item) {
      return {
        ...item,
        totalCommitCount,
      }
    }

    return null
  },
})

export const useMostRecentRepoCommitQuery = (config = {}) => {
  const tako = useTako()
  return useQuery({ ...mostRecentRepoCommitQueryConfig(tako), ...config })
}
