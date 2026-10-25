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

        switch (node.kind) {
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
            return (
              <TakoProvider key={itemVirtualPath} repository={node.repository}>
                <SubmoduleItem
                  level={level}
                  name={`${node.name} @ ${node.repository.ref.slice(0, 7)}`}
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
