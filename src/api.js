import Bottleneck from 'bottleneck'

import { betterAtob, sortContents } from '@/utils'
import RelativeTime from '@/github-relative-time'
import { getState } from '@/storage'

const MAX_REQUESTS = 10

const limiter = new Bottleneck({
  maxConcurrent: MAX_REQUESTS,
})

class ApiError extends Error {
  constructor({ status, message }) {
    super(`${message} [${status}]`)
    this.name = 'ApiError'
    this.status = status
    this.message = `${message} [${status}]`
  }
}

const githubFetch = (fragment, options = {}) =>
  fetch(`https://api.github.com/${fragment}`, {
    ...options,
    headers: {
      Authorization: `token ${getState().token}`,
    },
  }).then(response => {
    if (response.status < 200 || response.status > 299) {
      throw new ApiError({
        status: response.status,
        message: response.statusText,
      })
    }

    return response
  })

export const getNode = (
  { queryKey: [_type, { user, repo, path, branch }] },
  prefetch = false
) =>
  limiter
    .schedule(
      { priority: prefetch ? 1 : 9 },
      githubFetch,
      `repos/${user}/${repo}/contents/${encodeURIComponent(
        path
      )}?ref=${branch}`,
      { importance: prefetch ? 'low' : 'auto' }
    )
    .then(response => response.json())
    .then(contents => {
      if (Array.isArray(contents)) {
        return sortContents(
          contents.map(({ path, name, type, sha, html_url, url }) => {
            // https://docs.github.com/en/rest/repos/contents#if-the-content-is-a-directory
            // On github's current API, the type of a submodule node is still 'file'
            // We manually detect a submodule by checking the urls, and we coerce the
            // type into our own 'submodule', though it differs from the github API
            if (type === 'file') {
              // Our detection of submodule simply consists of checking the repo where
              // we are standing (`url`) against the repo we are being linked to
              // (`html_url`)

              // This makes the assumption that there are no nested submodules (i.e,
              // submodule always points to another repo instead of itself)

              // url example: https://api.github.com/repos/brumm/tako/contents/README.md?ref=master
              // html_url example: https://github.com/brumm/tako/blob/master/README.md

              const { pathname: urlPath } = new URL(url)

              const { pathname: submodulePath } = new URL(html_url)

              const urlRepo = urlPath
                .replace('/repos', '')
                .split('/')
                .slice(0, 3)
                .join('/')
              const submoduleRepo = submodulePath
                .split('/')
                .slice(0, 3)
                .join('/')

              if (urlRepo !== submoduleRepo) {
                type = 'submodule'
              }
            }

            return {
              path,
              name,
              type,
              sha,
              html_url,
            }
          })
        )
      }

      return null
    })

export const getFileContent = (
  { queryKey: [_type, { user, repo, path, branch }] },
  prefetch = false
) =>
  limiter
    .schedule(
      { priority: prefetch ? 1 : 9 },
      githubFetch,
      `repos/${user}/${repo}/contents/${encodeURIComponent(
        path
      )}?ref=${branch}`,
      { importance: prefetch ? 'low' : 'auto' }
    )
    .then(response => response.json())
    .then(json => betterAtob(json.content))

export const getMarkdown = ({ queryKey: [_type, { user, repo, text }] }) =>
  limiter
    .schedule(githubFetch, 'markdown', {
      method: 'POST',
      body: JSON.stringify({
        text,
        context: `${user}/${repo}`,
        mode: 'gfm',
      }),
    })
    .then(response => response.text())

export const getLastCommitForNode = (
  { queryKey: [_type, { user, repo, path, branch }] },
  prefetch = false
) =>
  limiter
    .schedule(
      { priority: prefetch ? 1 : 9 },
      githubFetch,
      `repos/${user}/${repo}/commits?page=1&per_page=1&sha=${branch}&path=${encodeURIComponent(
        path
      )}`,
      { importance: prefetch ? 'low' : 'auto' }
    )
    .then(response => response.json())
    .then(json => {
      if (json.length === 0) {
        return null
      }

      const [
        {
          html_url,
          commit: {
            committer: { date },
            message,
          },
        },
      ] = json

      return {
        url: html_url,
        date: new RelativeTime(
          new Date(date),
          document.querySelector('[lang]')?.lang
        ).timeAgo(),
        message: message.split('\n')[0],
      }
    })
