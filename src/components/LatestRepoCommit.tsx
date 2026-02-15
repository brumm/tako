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
      className="d-flex p-2 pl-3 bgColor-muted"
      style={{
        borderBottom: 'var(--borderWidth-thin)solid var(--borderColor-muted)',
      }}
    >
      <div
        data-testid="latest-commit"
        className="LatestCommit-module__Box_1__YkEgg"
      >
        <div className="CommitAttribution-module__CommitAttributionContainer__I_rfs">
          {mostRecentRepoCommit.author && authorUrl && (
            <div
              data-testid="author-avatar"
              className="Box-sc-62in7e-0 AuthorAvatar-module__AuthorAvatarContainer__n0MVc"
            >
              <a
                className="Link__StyledLink-sc-1syctfj-0 prc-Link-Link-9ZwDx"
                href={authorUrl}
                data-testid="avatar-icon-link"
                octo-dimensions="link_type:self"
                aria-keyshortcuts="Alt+ArrowUp"
              >
                <img
                  data-component="Avatar"
                  className="Box-sc-62in7e-0 kglDHV AuthorAvatar-module__authorAvatarImage__a3R8x prc-Avatar-Avatar-0xaUi"
                  alt={mostRecentRepoCommit.author.login}
                  width="20"
                  height="20"
                  data-testid="github-avatar"
                  aria-label={mostRecentRepoCommit.author.login}
                  src={mostRecentRepoCommit.author.avatar_url}
                  style={
                    { '--avatarSize-regular': '20px' } as React.CSSProperties
                  }
                />
              </a>
              <a
                className="Link__StyledLink-sc-1syctfj-0 dtKDuy AuthorAvatar-module__authorHoverableLink__MHTT8 prc-Link-Link-9ZwDx"
                data-muted="true"
                href={`${authorUrl}/${repository.repo}/commits?author=${mostRecentRepoCommit.author.login}`}
                aria-label={`commits by ${mostRecentRepoCommit.author.login}`}
                octo-dimensions="link_type:self"
                aria-keyshortcuts="Alt+ArrowUp"
              >
                {mostRecentRepoCommit.author.login}
              </a>
            </div>
          )}
          <span className=""></span>
        </div>
        <div className="d-none d-sm-flex LatestCommit-module__Box_2__pSPKJ">
          <div className="Truncate flex-items-center f5">
            <span
              className="Text__StyledText-sc-1klmep6-0 Truncate-text prc-Text-Text-9mHv3"
              data-testid="latest-commit-html"
            >
              <a href={commitUrl} className="Link--secondary" data-pjax="true">
                {commitMessageTitle}
              </a>
            </span>
          </div>
        </div>
      </div>
      <div className="d-flex flex-shrink-0 gap-2">
        <div className="d-flex gap-2">
          <a
            href={commitsUrl}
            className="prc-Button-ButtonBase-9n-Xk d-none d-lg-flex LinkButton-module__linkButton__nFnov flex-items-center fgColor-default"
            data-loading="false"
            data-size="small"
            data-variant="invisible"
          >
            <span
              data-component="buttonContent"
              data-align="center"
              className="prc-Button-ButtonContent-Iohp5"
            >
              <span
                data-component="leadingVisual"
                className="prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq"
              >
                <HistoryIcon />
              </span>
              <span data-component="text" className="prc-Button-Label-FWkx3">
                <span className="fgColor-default">
                  {mostRecentRepoCommit.totalCommitCount} Commits
                </span>
              </span>
            </span>
          </a>
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
