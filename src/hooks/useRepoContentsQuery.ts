import { queryOptions, useQuery } from '@tanstack/react-query'
import arraySort from 'array-sort'
import invariant from 'tiny-invariant'
import { TakoContextProps, useTako } from '../components/Tako'

const SORT_ORDER = ['dir', 'file', 'symlink']

// GitHub file mode mappings (decimal)
const FILE_MODES = {
  REGULAR_FILE: 33188,
  EXECUTABLE: 33261,
  SYMLINK: 40960,
  DIRECTORY: 16384,
  SUBMODULE: 57344,
} as const

const getTypeFromMode = (mode: number): 'file' | 'dir' | 'symlink' | 'submodule' => {
  switch (mode) {
    case FILE_MODES.DIRECTORY:
      return 'dir'
    case FILE_MODES.SYMLINK:
      return 'symlink'
    case FILE_MODES.SUBMODULE:
      return 'submodule'
    case FILE_MODES.REGULAR_FILE:
    case FILE_MODES.EXECUTABLE:
      return 'file'
    default:
      return 'file'
  }
}

type RepoContentsResponse = {
  repository: {
    object: {
      entries: Array<{
        name: string
        path: string
        type: string
        mode: number
        oid: string
        object?: {
          commitUrl?: string
        }
      }>
    }
  }
}

export const repoContentsQueryConfig = (tako: TakoContextProps, path: string) =>
  queryOptions({
    queryKey: ['contents', tako.repository, path],
    queryFn: async () => {
      const response = await tako.client.graphql<RepoContentsResponse>(`
      query {
        repository(owner: "${tako.repository.owner}", name: "${tako.repository.repo}") {
          object(expression: "${tako.repository.ref}:${path}") {
            ... on Tree {
              entries {
                name
                path
                type
                mode
                oid
                object {
                  ... on Commit {
                    commitUrl
                  }
                }
              }
            }
          }
        }
      }
    `)

      return response.repository.object.entries
    },
    select: (data) => {
      invariant(Array.isArray(data))

      // Enrich type based on mode and map oid to sha
      const enrichedData = data.map((item) => {
        const type = getTypeFromMode(item.mode)
        const baseUrl = `https://github.com/${tako.repository.owner}/${tako.repository.repo}`

        let html_url: string
        if (type === 'submodule' && item.object?.commitUrl) {
          html_url = item.object.commitUrl
        } else if (type === 'dir') {
          html_url = `${baseUrl}/tree/${tako.repository.ref}/${item.path}`
        } else {
          html_url = `${baseUrl}/blob/${tako.repository.ref}/${item.path}`
        }

        return {
          ...item,
          type,
          sha: item.oid,
          html_url,
        }
      })

      const items = arraySort(enrichedData, [
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
