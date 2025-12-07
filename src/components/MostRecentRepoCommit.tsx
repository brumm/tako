import { format } from 'timeago.js'
import { useMostRecentRepoCommitQuery } from '../hooks/useMostRecentRepoCommitQuery'
import { useTako } from './Tako'

export const MostRecentRepoCommit = () => {
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
    <div className="LatestCommit-module__Box--Fimpo py-1 bgColor-muted border-bottom">
      <h2
        className="sr-only ScreenReaderHeading-module__userSelectNone--vlUbc prc-Heading-Heading-6CmGO"
        data-testid="screen-reader-heading"
      >
        Latest commit
      </h2>
      <div
        data-testid="latest-commit"
        className="LatestCommit-module__Box_1--aQ5OG"
      >
        <div className="CommitAttribution-module__CommitAttributionContainer--Si80C">
          {mostRecentRepoCommit.author && authorUrl && (
            <div
              data-testid="author-avatar"
              className="Box-sc-62in7e-0 AuthorAvatar-module__AuthorAvatarContainer--Z1TF8"
            >
              <a
                className="Link__StyledLink-sc-1syctfj-0 prc-Link-Link-85e08"
                href={authorUrl}
                data-testid="avatar-icon-link"
              >
                <img
                  data-component="Avatar"
                  className="Box-sc-62in7e-0 kglDHV AuthorAvatar-module__authorAvatarImage--bQzij prc-Avatar-Avatar-ZRS-m"
                  alt={mostRecentRepoCommit.author.login}
                  width="20"
                  height="20"
                  src={mostRecentRepoCommit.author.avatar_url}
                  data-testid="github-avatar"
                  aria-label={mostRecentRepoCommit.author.login}
                  style={
                    { '--avatarSize-regular': '20px' } as React.CSSProperties
                  }
                />
              </a>
              <a
                className="Link__StyledLink-sc-1syctfj-0 dBLZyi AuthorAvatar-module__authorHoverableLink--vw9qe prc-Link-Link-85e08"
                data-muted="true"
                href={`${authorUrl}/${repository.repo}/commits?author=${mostRecentRepoCommit.author.login}`}
                aria-label={`commits by ${mostRecentRepoCommit.author.login}`}
              >
                {mostRecentRepoCommit.author.login}
              </a>
            </div>
          )}
          <span className=""></span>
        </div>
        <div className="d-none d-sm-flex LatestCommit-module__Box_2--JDY37">
          <div className="Truncate flex-items-center f5">
            <span
              className="Text__StyledText-sc-1klmep6-0 Truncate-text prc-Text-Text-0ima0"
              data-testid="latest-commit-html"
            >
              <a href={commitUrl} className="Link--secondary" data-pjax="true">
                {commitMessageTitle}
              </a>
            </span>
          </div>
        </div>
        <span className="d-flex d-sm-none fgColor-muted f6">
          {mostRecentRepoCommit.commit.author?.date && (
            <span>{format(mostRecentRepoCommit.commit.author.date)}</span>
          )}
        </span>
      </div>
      <div className="d-flex flex-shrink-0 gap-2">
        <div
          data-testid="latest-commit-details"
          className="d-none d-sm-flex flex-items-center"
        >
          <span className="d-flex flex-nowrap fgColor-muted f6">
            <a
              className="Link--secondary prc-Link-Link-85e08"
              aria-label={`Commit ${mostRecentRepoCommit.sha.slice(0, 7)}`}
              href={commitUrl}
              data-discover="true"
            >
              {mostRecentRepoCommit.sha.slice(0, 7)}
            </a>
            &nbsp;·&nbsp;
            {mostRecentRepoCommit.commit.author?.date && (
              <span>{format(mostRecentRepoCommit.commit.author.date)}</span>
            )}
          </span>
        </div>
        <div className="d-flex gap-2">
          <h2
            className="sr-only ScreenReaderHeading-module__userSelectNone--vlUbc prc-Heading-Heading-6CmGO"
            data-testid="screen-reader-heading"
          >
            History
          </h2>
          <a
            href={commitsUrl}
            className="prc-Button-ButtonBase-c50BI d-none d-lg-flex LinkButton-module__code-view-link-button--thtqc flex-items-center fgColor-default"
            data-loading="false"
            data-size="small"
            data-variant="invisible"
          >
            <span
              data-component="buttonContent"
              data-align="center"
              className="prc-Button-ButtonContent-HKbr-"
            >
              <span
                data-component="leadingVisual"
                className="prc-Button-Visual-2epfX prc-Button-VisualWrap-Db-eB"
              >
                <HistoryIcon />
              </span>
              <span data-component="text" className="prc-Button-Label-pTQ3x">
                <span className="fgColor-default">
                  {mostRecentRepoCommit.totalCommitCount} Commits
                </span>
              </span>
            </span>
          </a>
          <div className="d-lg-none">
            <a
              aria-label="View commit history for this file."
              href={commitsUrl}
              className="prc-Button-ButtonBase-c50BI LinkButton-module__code-view-link-button--thtqc flex-items-center fgColor-default"
              data-loading="false"
              data-size="small"
              data-variant="invisible"
            >
              <span
                data-component="buttonContent"
                data-align="center"
                className="prc-Button-ButtonContent-HKbr-"
              >
                <span
                  data-component="leadingVisual"
                  className="prc-Button-Visual-2epfX prc-Button-VisualWrap-Db-eB"
                >
                  <HistoryIcon />
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
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
