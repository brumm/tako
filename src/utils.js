import arraySort from 'array-sort'

import { setState } from '@/storage'
import { SORT_ORDER } from '@/constants'

export const sortContents = contents =>
  arraySort(
    contents,
    (a, b) => SORT_ORDER.indexOf(a.type) - SORT_ORDER.indexOf(b.type),
    (a, b) => a.name.localeCompare(b.name)
  )

export const getRepoDetails = () => {
  const [, user, repo, branch] = document
    .querySelector('link[type="application/atom+xml"]')
    ?.href.replace('https://github.com/', '')
    .replace('.atom', '')
    .replace(/\?token=.*/, '')
    .match(
      /([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z0-9]+(?:[._-][a-z0-9]+)*)\/commits\/(.*)/i
    )

  const [, path] = window.location.href
    .replace('https://github.com/', '')
    .replace(`${user}/`, '')
    .replace(`${repo}/`, '')
    .replace(branch, '')
    .match(/\/(?!tree|blob)\/(.*)$/) ?? [undefined, '']

  return { user, repo, branch, path }
}

export const betterAtob = str =>
  decodeURIComponent(
    atob(str)
      .split('')
      .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  )

export const removeToken = () =>
  new Promise((resolve, reject) =>
    process.env.BROWSER === 'chrome'
      ? chrome.storage.sync.remove('token', () => {
          setState(state => ({ ...state, token: undefined }))
          return resolve()
        })
      : process.env.BROWSER === 'firefox'
      ? browser.storage.sync
          .remove('token')
          .then(() => {
            setState(state => ({ ...state, token: undefined }))
            return resolve()
          })
          .catch(e => reject(e))
      : reject()
  )

export const setToken = token =>
  process.env.BROWSER === 'chrome'
    ? chrome.storage.sync.set({ token: token || null })
    : process.env.BROWSER === 'firefox'
    ? // In Firefox, I had a better user experience by reloading here
      browser.storage.sync.set({ token: token || null }) &&
      window.location.reload()
    : null
