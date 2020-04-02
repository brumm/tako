import Bottleneck from 'bottleneck'

import { betterAtob, sortContents } from '@/utils'
import RelativeTime from '@/github-relative-time'
import { getState } from '@/storage'

const MAX_REQUESTS = 10

const limiter = new Bottleneck({
  maxConcurrent: MAX_REQUESTS,
})

const githubFetch = (fragment, { importance, ...options } = {}) =>
  fetch(`https://api.github.com/${fragment}`, {
    ...options,
    importance,
    headers: {
      Authorization: `token ${getState().token}`,
    },
  }).then(response => {
    if (response.status < 200 || response.status > 299) {
      throw new Error(`${response.status}: ${response.statusText}`)
    }

    return response
  })

export const getNode = (
  type,
  { user, repo, path, branch },
  { isPrefetch = false } = {}
) =>
  limiter
    .schedule(
      { priority: isPrefetch ? 1 : 9 },
      githubFetch,
      `repos/${user}/${repo}/contents/${path}?ref=${branch}`,
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
      `repos/${user}/${repo}/contents/${path}?ref=${branch}`,
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
      `repos/${user}/${repo}/commits?page=1&per_page=1&sha=${branch}&path=${path}`,
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
