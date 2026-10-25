import { format } from 'timeago.js'

import type { CommitInfo } from '../lib/tree-commit-info'
import { useTakoStore } from '../store'

export const LatestItemCommitTableCell = ({
  commit,
}: {
  commit?: CommitInfo
}) => {
  const hasPreviewedFile = useTakoStore((state) => state.previewedFile !== null)

  if (hasPreviewedFile || !commit) {
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
            title={commit.message}
            className="Link--secondary"
            href={commit.url}
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            {commit.title}
          </a>
        </span>
      </div>
      <div
        role="gridcell"
        className="color-fg-muted text-right"
        style={{ width: 100 }}
      >
        <div className="no-wrap">{format(commit.date)}</div>
      </div>
    </>
  )
}
