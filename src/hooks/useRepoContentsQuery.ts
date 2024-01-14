import { useQuery } from '@tanstack/react-query'
import arraySort from 'array-sort'
import { utils } from 'github-url-detection'
import invariant from 'tiny-invariant'
import { TakoContextProps, useTako } from '../components/Tako'

const SORT_ORDER = ['dir', 'file']

export const repoContentsQueryConfig = (
  tako: TakoContextProps,
  path: string,
) => ({
  queryKey: ['contents', tako.repository, path],
  queryFn: () => tako.client.repos.getContent({ ...tako.repository, path }),
  select: ({ data }) => {
    invariant(Array.isArray(data))

    // kludge for submodules
    for (const item of data) {
      invariant(item.html_url)

      const url = new URL(item.html_url)
      const info = utils.getRepositoryInfo(url)
      const mismatch = info?.name !== tako.repository.repo
      if (mismatch) {
        item.type = 'submodule'
      }
    }

    const items = arraySort(data, [
      (a, b) => SORT_ORDER.indexOf(a.type) - SORT_ORDER.indexOf(b.type),
      (a, b) => a.name.localeCompare(b.name),
    ])

    return items
  },
})

export const useRepoContentsQuery = (path: string, config = {}) => {
  const tako = useTako()
  return useQuery({ ...repoContentsQueryConfig(tako, path), ...config })
}
