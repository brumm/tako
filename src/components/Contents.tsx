import invariant from 'tiny-invariant'

import { utils } from 'github-url-detection'
import { useRepoContentsQuery } from '../hooks/useRepoContentsQuery'
import { DirItem, FileItem, SubmoduleItem, SymlinkItem } from './Item'
import { TakoProvider } from './Tako'

type Props = {
  path?: string
  level?: number
  virtualPath?: string
}

export const Contents = ({ path = '', level = 1, virtualPath = '' }: Props) => {
  const query = useRepoContentsQuery(path)

  if (!query.data) {
    return null
  }

  return (
    <>
      {query.data.map((node) => {
        const itemVirtualPath = virtualPath
          ? `${virtualPath}/${node.name}`
          : node.name

        switch (node.type) {
          case 'dir': {
            return (
              <DirItem
                key={itemVirtualPath}
                level={level}
                name={node.name}
                path={node.path}
                virtualPath={itemVirtualPath}
              />
            )
          }

          case 'file': {
            return (
              <FileItem
                key={itemVirtualPath}
                level={level}
                name={node.name}
                path={node.path}
                sha={node.sha}
                virtualPath={itemVirtualPath}
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
                  key={itemVirtualPath}
                  level={level}
                  name={`${node.name} @ ${ref.slice(0, 7)}`}
                  path=""
                  virtualPath={itemVirtualPath}
                />
              </TakoProvider>
            )
          }

          case 'symlink': {
            return (
              <SymlinkItem
                key={itemVirtualPath}
                level={level}
                name={node.name}
                path={node.path}
                virtualPath={itemVirtualPath}
              />
            )
          }
        }
      })}
    </>
  )
}
