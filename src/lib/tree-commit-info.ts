import invariant from 'tiny-invariant'
import type { RepositoryInfo } from '../types'

export type CommitInfo = {
  title: string
  message: string
  date: string
  url: string
}

type RawCommitInfo = {
  oid: string
  url: string
  date: string
  shortMessageHtmlLink: { value: string }
}

// Undocumented endpoint behind github.com's own file list: latest commit of
// every entry in a directory in one request, authenticated by session cookie
export const fetchTreeCommitInfo = async (
  { owner, repo, ref }: RepositoryInfo,
  path: string,
) => {
  const segments = [owner, repo, 'tree-commit-info', ...ref.split('/')]
  if (path) {
    segments.push(...path.split('/'))
  }
  const response = await pageFetch(
    `https://github.com/${segments.map(encodeURIComponent).join('/')}`,
    { headers: { Accept: 'application/json' } },
  )
  invariant(response.ok, `tree-commit-info ${response.status}: ${path}`)

  const { entries } = (await response.json()) as {
    entries: Record<string, RawCommitInfo>
  }
  return Object.fromEntries(
    Object.entries(entries).map(([name, commit]) => [
      name,
      toCommitInfo(commit),
    ]),
  )
}

const toCommitInfo = ({
  url,
  date,
  shortMessageHtmlLink,
}: RawCommitInfo): CommitInfo => {
  const link = new DOMParser()
    .parseFromString(shortMessageHtmlLink.value, 'text/html')
    .querySelector('a')
  const title = link?.textContent ?? ''
  return {
    title,
    message: link?.getAttribute('title') || title,
    date,
    url,
  }
}

// Firefox content scripts only send the page's cookies through content.fetch
const pageFetch: typeof fetch =
  (globalThis as { content?: { fetch: typeof fetch } }).content?.fetch ??
  ((input, init) => fetch(input, init))
