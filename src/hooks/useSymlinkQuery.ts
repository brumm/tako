import { useQuery } from '@tanstack/react-query'
import invariant from 'tiny-invariant'
import { TakoContextProps, useTako } from '../components/Tako'

const resolveSymlinkPath = (symlinkPath: string, target: string): string => {
  const pathParts = symlinkPath.split('/').slice(0, -1)
  const targetParts = target.split('/')

  for (const part of targetParts) {
    if (part === '..') {
      pathParts.pop()
    } else if (part !== '.') {
      pathParts.push(part)
    }
  }

  return pathParts.join('/')
}

export const symlinkQueryConfig = (tako: TakoContextProps, path: string) => ({
  queryKey: ['symlink', tako.repository, path],
  queryFn: async () => {
    // Fetch symlink target using GraphQL
    const symlinkResponse = await tako.client.graphql<{
      repository: {
        object: {
          text: string
        }
      }
    }>(`
      query {
        repository(owner: "${tako.repository.owner}", name: "${tako.repository.repo}") {
          object(expression: "${tako.repository.ref}:${path}") {
            ... on Blob {
              text
            }
          }
        }
      }
    `)

    const target = symlinkResponse.repository.object.text
    invariant(target, 'Symlink target not found')

    const resolvedPath = resolveSymlinkPath(path, target)

    // Fetch target metadata using GraphQL
    const targetResponse = await tako.client.graphql<{
      repository: {
        object: {
          __typename: string
          oid: string
        }
      }
    }>(`
      query {
        repository(owner: "${tako.repository.owner}", name: "${tako.repository.repo}") {
          object(expression: "${tako.repository.ref}:${resolvedPath}") {
            __typename
            oid
          }
        }
      }
    `)

    const targetData = targetResponse.repository.object

    if (targetData.__typename === 'Tree') {
      return {
        path: resolvedPath,
        type: 'dir' as const,
      }
    }

    if (targetData.__typename === 'Blob') {
      return {
        path: resolvedPath,
        type: 'file' as const,
        sha: targetData.oid,
      }
    }

    invariant(false, 'Unexpected symlink target data format')
  },
})

export const useSymlinkQuery = (path: string, config = {}) => {
  const tako = useTako()
  return useQuery({ ...symlinkQueryConfig(tako, path), ...config })
}
