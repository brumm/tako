import Bottleneck from 'bottleneck'
import arraySort from 'array-sort'

import { SORT_ORDER } from '@/constants'
import { betterAtob } from '@/utils'
import RelativeTime from '@/github-relative-time'
import { getState } from '@/storage'

const MAX_REQUESTS = 10

const limiter = new Bottleneck({
  maxConcurrent: MAX_REQUESTS,
})

const githubFetch = limiter.wrap((fragment, { importance, ...options } = {}) =>
  fetch(`https://api.github.com/${fragment}`, {
    ...options,
    importance,
    headers: {
      Authorization: `token ${getState().token}`,
    },
  }).then(response => {
    if (response.status < 200 || response.status > 299) {
      throw new Error('Something went boom')
    }

    return response
  })
)

export const getNode = (
  type,
  { user, repo, path, branch },
  { isPrefetch = false } = {}
) =>
  githubFetch(`repos/${user}/${repo}/contents/${path}?ref=${branch}`, {
    importance: isPrefetch ? 'low' : 'auto',
  })
    .then(response => response.json())
    .then(json => {
      json = [].concat(json)

      return arraySort(
        json,
        (a, b) => SORT_ORDER.indexOf(a.type) - SORT_ORDER.indexOf(b.type),
        (a, b) => a.name.localeCompare(b.name)
      )
    })

export const getFileContent = (
  type,
  { user, repo, path, branch },
  { isPrefetch = false } = {}
) =>
  githubFetch(`repos/${user}/${repo}/contents/${path}?ref=${branch}`, {
    importance: isPrefetch ? 'low' : 'auto',
  })
    .then(response => response.json())
    .then(json => betterAtob(json.content))

export const getMarkdown = (type, { user, repo, text }) =>
  githubFetch('markdown', {
    method: 'POST',
    body: JSON.stringify({
      text,
      context: `${user}/${repo}`,
      mode: 'gfm',
    }),
  }).then(response => response.text())

export const getLastCommitForNode = (
  type,
  { user, repo, path, branch },
  { isPrefetch = false } = {}
) =>
  githubFetch(
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
