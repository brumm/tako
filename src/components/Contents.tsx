import invariant from 'tiny-invariant'

import { utils } from 'github-url-detection'
import { useRepoContentsQuery } from '../hooks/useRepoContentsQuery'
import { DirItem, FileItem, SubmoduleItem, SymlinkItem } from './Item'
import { TakoProvider } from './Tako'

type Props = {
  path?: string
  level?: number
}

export const Contents = ({ path = '', level = 1 }: Props) => {
  const query = useRepoContentsQuery(path)

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
