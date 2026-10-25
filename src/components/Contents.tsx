import { useRepoContentsQuery } from '../hooks/useRepoContentsQuery'
import { useTreeCommitInfo } from '../hooks/useTreeCommitInfo'
import { useTakoStore } from '../store'
import { SymlinkItem, TreeItem } from './Item'
import { TakoProvider } from './Tako'

type Props = {
  path?: string
  level?: number
  virtualPath?: string
}

export const Contents = ({ path = '', level = 1, virtualPath = '' }: Props) => {
  const query = useRepoContentsQuery(path)
  const hasPreviewedFile = useTakoStore((state) => state.previewedFile !== null)
  const commitInfoQuery = useTreeCommitInfo(path, {
    enabled: !hasPreviewedFile,
  })

  if (!query.data) {
    return null
  }

  return (
    <>
      {query.data.map((entry) => {
        const itemVirtualPath = virtualPath
          ? `${virtualPath}/${entry.name}`
          : entry.name
        const commit = commitInfoQuery.data?.[entry.name]

        switch (entry.kind) {
          case 'dir':
          case 'file': {
            return (
              <TreeItem
                key={itemVirtualPath}
                level={level}
                name={entry.name}
                virtualPath={itemVirtualPath}
                target={entry}
                commit={commit}
              />
            )
          }

          case 'submodule': {
            return (
              <TakoProvider key={itemVirtualPath} repository={entry.repository}>
                <TreeItem
                  level={level}
                  name={`${entry.name} @ ${entry.repository.ref.slice(0, 7)}`}
                  virtualPath={itemVirtualPath}
                  target={{ kind: 'dir', path: '' }}
                  variant="submodule"
                  commit={commit}
                />
              </TakoProvider>
            )
          }

          case 'symlink': {
            return (
              <SymlinkItem
                key={itemVirtualPath}
                level={level}
                name={entry.name}
                path={entry.path}
                virtualPath={itemVirtualPath}
                commit={commit}
              />
            )
          }
        }
      })}
    </>
  )
}
