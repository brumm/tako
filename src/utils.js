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
