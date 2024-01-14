import { useQuery } from '@tanstack/react-query'
import { format } from 'timeago.js'
import { useTako } from './Tako'

const useMostRecentCommit = () => {
  const tako = useTako()
  return useQuery({
    queryKey: ['mostRecentCommit', tako.repository],
    queryFn: async () => {
      const response = await tako.client.repos.listCommits({
        ...tako.repository,
        page: 1,
        per_page: 1,
      })

      const totalCommitCount = response.headers.link?.match(
        /page=(?<count>\d+)&per_page=1>;\srel="last"/,
      )?.groups?.count

      const item = response.data[0]
      if (item) {
        return {
          ...item,
          totalCommitCount,
        }
      }

      return null
    },
  })
}

export const MostRecentRepoCommit = () => {
  const { repository } = useTako()
  const mostRecentCommitQuery = useMostRecentCommit()
  const mostRecentCommit = mostRecentCommitQuery.data

  if (mostRecentCommitQuery.isLoading || !mostRecentCommit) {
    return null
  }

  return (
    <div className="border-bottom d-flex gap-3 color-bg-subtle flex-items-center px-3 py-2">
      <div className="d-flex gap-2">
        {mostRecentCommit.author && (
          <a
            href={`/${mostRecentCommit.author.login}`}
            className="d-flex flex-items-center gap-2"
          >
            <img
              alt={mostRecentCommit.author.login}
              src={mostRecentCommit.author.avatar_url}
              height="20"
              width="20"
              className="avatar circle"
            />
            <span className="Link--primary text-bold">
              {mostRecentCommit.author.login}
            </span>
          </a>
        )}
        <a href="" className="Link--secondary">
          {mostRecentCommit.commit.message}
        </a>
      </div>

      <div className="flex-1" />

      <div className="text-small color-fg-muted">
        <a
          href={`/${repository.owner}/${repository.repo}/commit/${mostRecentCommit.sha}`}
          className="Link--secondary"
        >
          {mostRecentCommit.sha.slice(0, 7)}
        </a>

        {mostRecentCommit.commit.author?.date && (
          <>
            &nbsp;·&nbsp;
            <span>{format(mostRecentCommit.commit.author.date)}</span>
          </>
        )}
      </div>

      <div className="text-small d-flex flex-items-center gap-2">
        <HistoryIcon />
        <a
          href={`/${repository.owner}/${repository.repo}/commits`}
          className="Link--primary text-semibold"
        >
          {mostRecentCommit.totalCommitCount} Commits
        </a>
      </div>
    </div>
  )
}

const HistoryIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="img"
    className="octicon octicon-history"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"></path>
  </svg>
)
