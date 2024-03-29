import arraySort from 'array-sort'

import { SORT_ORDER } from '@/constants'

export const sortContents = contents =>
  arraySort(
    contents,
    (a, b) => SORT_ORDER.indexOf(a.type) - SORT_ORDER.indexOf(b.type),
    (a, b) => a.name.localeCompare(b.name)
  )

export const getRepoDetails = () => {
  const [, user, repo, branch] = document
    .querySelector('[data-open-app="link"]')
    ?.href.replace('https://github.com/', '')
    .match(
      /^([a-z\d](?:[a-z\d]|-(?=[a-z\d])?){0,38})\/([a-z0-9]+(?:[._-][a-z0-9]+)*)\/archive\/refs\/heads\/(.*)\.zip$/i
    )

  const [, path] = window.location.href
    .replace('https://github.com/', '')
    .replace(`${user}/`, '')
    .replace(`${repo}/`, '')
    .replace(branch, '')
    .match(/\/(?!tree|blob)\/(.*)$/) ?? [undefined, '']

  return { user, repo, branch, path }
}

export const betterAtob = str => {
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
  } catch {
    return null
  }
}

export const removeToken = () =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.remove('token', () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }

      resolve()
    })
  })

export const markAsPrefetch = fn => (...args) => fn(...args, true)
