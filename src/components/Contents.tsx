import { useQuery } from '@tanstack/react-query'
import arraySort from 'array-sort'
import invariant from 'tiny-invariant'

import { utils } from 'github-url-detection'
import { DirItem, FileItem, SubmoduleItem, SymlinkItem } from './Item'
import { TakoProvider, useTako } from './Tako'

type Props = {
  path?: string
  level?: number
}

const SORT_ORDER = ['dir', 'file']

export const useRepoContents = (path: string, options = {}) => {
  const tako = useTako()
  return useQuery({
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
    ...options,
  })
}

export const Contents = ({ path = '', level = 1 }: Props) => {
  const query = useRepoContents(path)

  if (!query.data) {
    return null
  }

  return (
    <>
      {query.data.map((node) => {
        switch (node.type) {
          case 'dir': {
            return (
              <DirItem
                key={node.path}
                level={level}
                name={node.name}
                path={node.path}
              />
            )
          }

          case 'file': {
            return (
              <FileItem
                key={node.path}
                level={level}
                name={node.name}
                path={node.path}
                sha={node.sha}
              />
            )
          }

          case 'submodule': {
            invariant(node.html_url)
            const info = utils.getRepositoryInfo(node.html_url)
            invariant(info)
            const { owner, name: repo, path } = info
            const ref = path.replace('tree/', '')
            const repository = {
              owner,
              repo,
              ref,
            }
            return (
              <TakoProvider repository={repository}>
                <SubmoduleItem
                  key={node.path}
                  level={level}
                  name={`${node.name} @ ${ref.slice(0, 7)}`}
                  path=""
                />
              </TakoProvider>
            )
          }

          case 'symlink': {
            return (
              <SymlinkItem
                key={node.path}
                level={level}
                name={node.name}
                path={node.path}
              />
            )
          }
        }
      })}
    </>
  )
}
