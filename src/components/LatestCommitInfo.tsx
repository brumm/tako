import { useQuery } from '@tanstack/react-query'
import { format } from 'timeago.js'

import { useStore } from '../store'
import { useTako } from './Tako'

const useLatestCommitInfo = (path: string, options = {}) => {
  const tako = useTako()
  return useQuery({
    queryKey: ['lastCommit', tako.repository, path],
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
    ...options,
  })
}

export const LatestCommitInfo = ({ path }) => {
  const hasPreviewedFile = useStore((state) => state.previewedFile !== null)
  const lastCommitQuery = useLatestCommitInfo(path, {
    enabled: !hasPreviewedFile,
  })
  const lastCommit = lastCommitQuery.data

  if (hasPreviewedFile || lastCommitQuery.isLoading || !lastCommit) {
    return null
  }

  return (
    <>
      <div
        role="gridcell"
        className="flex-auto min-width-0 d-none d-md-block col-5 mr-3"
      >
        <span className="css-truncate css-truncate-target d-block width-fit markdown-title">
          <a
            title={lastCommit.message}
            className="Link--secondary"
            href={lastCommit.htmlUrl}
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            {lastCommit.message}
          </a>
        </span>
      </div>
      <div
        role="gridcell"
        className="color-fg-muted text-right"
        style={{ width: 100 }}
      >
        {lastCommit.date && (
          <div className="no-wrap">{format(lastCommit.date)}</div>
        )}
      </div>
    </>
  )
}
