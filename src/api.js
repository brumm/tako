import Bottleneck from 'bottleneck'

import { getState } from '@/storage'
import { betterAtob, sortContents, removeToken } from '@/utils'
import RelativeTime from '@/github-relative-time'

const MAX_REQUESTS = 10

const limiter = new Bottleneck({
  maxConcurrent: MAX_REQUESTS,
})

const githubFetch = (fragment, { importance, ...options } = {}) => {
  const { token } = getState()

  return fetch(`https://api.github.com/${fragment}`, {
    ...options,
    importance,
    headers: {
      Authorization: `token ${token}`,
    },
  }).then(response => {
    if (response.status < 200 || response.status > 299) {
      // A user may have manually removed token from GitHub account,
      // if they have, this should prompt them for a new token
      if (response.status === 401 && token) {
        removeToken().then(() => {
          throw new Error(
            `${response.status}: ([tako] It is possible the associated token has been revoked) ${response.statusText}`
          )
        })
      }

      throw new Error(`${response.status}: ${response.statusText}`)
    }

    return response
  })
}

export const getNode = (
  type,
  { user, repo, path, branch },
  { isPrefetch = false } = {}
) =>
  limiter
    .schedule(
      { priority: isPrefetch ? 1 : 9 },
      githubFetch,
      `repos/${user}/${repo}/contents/${encodeURIComponent(
        path
      )}?ref=${branch}`,
      {
        importance: isPrefetch ? 'low' : 'auto',
      }
    )
    .then(response => response.json())
    .then(contents => {
      if (Array.isArray(contents)) {
        return sortContents(contents).map(({ path, name, type, sha }) => ({
          path,
          name,
          type,
          sha,
        }))
      }

      return null
    })

export const getFileContent = (
  type,
  { user, repo, path, branch },
  { isPrefetch = false } = {}
) =>
  limiter
    .schedule(
      { priority: isPrefetch ? 1 : 9 },
      githubFetch,
      `repos/${user}/${repo}/contents/${encodeURIComponent(
        path
      )}?ref=${branch}`,
      {
        importance: isPrefetch ? 'low' : 'auto',
      }
    )
    .then(response => response.json())
    .then(json => betterAtob(json.content))

export const getMarkdown = (
  type,
  { user, repo, text },
  { isPrefetch = false } = {}
) =>
  limiter
    .schedule({ priority: isPrefetch ? 1 : 9 }, githubFetch, 'markdown', {
      method: 'POST',
      body: JSON.stringify({
        text,
        context: `${user}/${repo}`,
        mode: 'gfm',
      }),
    })
    .then(response => response.text())

export const getLastCommitForNode = (
  type,
  { user, repo, path, branch },
  { isPrefetch = false } = {}
) =>
  limiter
    .schedule(
      { priority: isPrefetch ? 1 : 9 },
      githubFetch,
      `repos/${user}/${repo}/commits?page=1&per_page=1&sha=${branch}&path=${encodeURIComponent(
        path
      )}`,
      {
        importance: isPrefetch ? 'low' : 'auto',
      }
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
