import { format } from 'timeago.js'

import { useLatestCommitInfo } from '../hooks/useLatestCommitInfo'
import { useStore } from '../store'

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
