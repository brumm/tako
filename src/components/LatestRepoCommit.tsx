import { useMostRecentRepoCommitQuery } from '../hooks/useMostRecentRepoCommitQuery'
import { useTako } from './Tako'

export const LatestRepoCommit = () => {
  const { repository } = useTako()
  const mostRecentCommitQuery = useMostRecentRepoCommitQuery()
  const mostRecentRepoCommit = mostRecentCommitQuery.data

  if (mostRecentCommitQuery.isLoading || !mostRecentRepoCommit) {
    return null
  }

  const commitUrl = `/${repository.owner}/${repository.repo}/commit/${mostRecentRepoCommit.sha}`
  const commitsUrl = `/${repository.owner}/${repository.repo}/commits/${repository.ref}/`
  const authorUrl = mostRecentRepoCommit.author?.login
    ? `/${mostRecentRepoCommit.author.login}`
    : null

  const [commitMessageTitle] = mostRecentRepoCommit.commit.message.split('\n')

  return (
    <div
      className="d-flex flex-items-center gap-2 p-2 pl-3 bgColor-muted f5"
      style={{
        borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-muted)',
      }}
    >
      <div className="d-flex flex-items-center gap-2 flex-auto min-width-0">
        {mostRecentRepoCommit.author && authorUrl && (
          <>
            <a href={authorUrl} className="d-flex flex-shrink-0">
              <img
                className="avatar circle"
                alt={mostRecentRepoCommit.author.login}
                width="20"
                height="20"
                src={mostRecentRepoCommit.author.avatar_url}
              />
            </a>
            <a
              href={`/${repository.owner}/${repository.repo}/commits?author=${mostRecentRepoCommit.author.login}`}
              className="Link--primary text-bold no-wrap"
            >
              {mostRecentRepoCommit.author.login}
            </a>
          </>
        )}
        <span className="Truncate d-none d-sm-flex">
          <a href={commitUrl} className="Truncate-text Link--secondary">
            {commitMessageTitle}
          </a>
        </span>
      </div>
      <a
        href={commitsUrl}
        className="d-none d-lg-flex flex-items-center gap-1 flex-shrink-0 Link--primary text-bold no-wrap"
      >
        <HistoryIcon />
        {mostRecentRepoCommit.totalCommitCount} Commits
      </a>
    </div>
  )
}

const HistoryIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    className="octicon octicon-history"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="currentColor"
    display="inline-block"
    overflow="visible"
    style={{ verticalAlign: 'text-bottom' }}
  >
    <path d="m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"></path>
  </svg>
)
