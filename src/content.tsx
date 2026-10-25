import { isRepoTree as detectRepoTree } from 'github-url-detection'

import { Octokit } from '@octokit/rest'
import browser from 'webextension-polyfill'
import { Tako, TakoProvider } from './components/Tako'
import { TokenPrompt } from './components/TokenPrompt'
import { mostRecentRepoCommitQueryConfig } from './hooks/useMostRecentRepoCommitQuery'
import { repoContentsQueryConfig } from './hooks/useRepoContentsQuery'
import {
  isTakoMounted,
  mountTako,
  mountTokenPrompt,
  unmountTako,
} from './lib/github-page'
import { getRepository } from './lib/repository'
import { queryClient } from './queryClient'

let startingTako = false
const startTako = async () => {
  document.removeEventListener('visibilitychange', startTako)

  if (document.hidden) {
    document.addEventListener('visibilitychange', startTako, { once: true })
    return
  }

  if (startingTako) {
    return
  }
  startingTako = true

  try {
    const isRepoTree = detectRepoTree()

    browser.runtime.sendMessage({
      action: 'updateActionState',
      enabled: isRepoTree,
    })

    if (isRepoTree === false) {
      return
    }

    if (isTakoMounted()) {
      return
    }

    const { takoEnabled } = await browser.storage.sync.get('takoEnabled')
    if (takoEnabled === false) {
      return
    }

    const { token } = await browser.storage.sync.get('token')
    if (!token) {
      return await renderTokenPrompt()
    }

    const octokit = new Octokit({ auth: token })

    try {
      await octokit.users.getAuthenticated()
    } catch (error) {
      if (error.status === 401) {
        return await renderTokenPrompt({ invalidToken: true })
      }
    }

    return await renderTako(octokit)
  } finally {
    startingTako = false
  }
}

const renderTako = async (octokit: Octokit) => {
  const { repository, path } = await getRepository(octokit)

  await Promise.all([
    queryClient.fetchQuery(
      repoContentsQueryConfig({ client: octokit, repository }, path),
    ),
    queryClient.fetchQuery(
      mostRecentRepoCommitQueryConfig({ client: octokit, repository }),
    ),
  ])

  await mountTako(
    <TakoProvider client={octokit} repository={repository}>
      <Tako path={path} />
    </TakoProvider>,
  )

  browser.runtime.sendMessage({
    action: 'updateActionState',
    enabled: true,
  })
}

const renderTokenPrompt = async ({ invalidToken = false } = {}) => {
  await mountTokenPrompt(<TokenPrompt invalidToken={invalidToken} />)

  browser.runtime.sendMessage({
    action: 'updateActionState',
    enabled: true,
  })
}

document.addEventListener('DOMContentLoaded', startTako)
document.addEventListener('turbo:render', startTako)

startTako()

browser.runtime.onMessage.addListener(
  (message: { action: string }, _sender, sendResponse) => {
    switch (message.action) {
      case 'checkRunning': {
        sendResponse(isTakoMounted())
        break
      }
      case 'start': {
        startTako()
        sendResponse(true)
        break
      }
      case 'stop': {
        unmountTako()
        sendResponse(true)
        break
      }
    }
    return true
  },
)
