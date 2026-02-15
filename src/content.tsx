import { isRepoTree as detectRepoTree } from 'github-url-detection'
import { createRoot } from 'react-dom/client'

import { Octokit } from '@octokit/rest'
import browser from 'webextension-polyfill'
import { Tako, TakoProvider } from './components/Tako'
import { TokenPrompt } from './components/TokenPrompt'
import { mostRecentRepoCommitQueryConfig } from './hooks/useMostRecentRepoCommitQuery'
import { repoContentsQueryConfig } from './hooks/useRepoContentsQuery'
import { showGithubFileTree, showWideLayout } from './lib/github-layout'
import { getRepository } from './lib/repository'
import { queryClient } from './queryClient'
import { useTakoStore } from './store'
import { waitForElement } from './waitForElement'

const startTako = async () => {
  document.removeEventListener('visibilitychange', startTako)

  if (document.hidden) {
    document.addEventListener('visibilitychange', startTako, { once: true })
    return
  }

  const isRepoTree = detectRepoTree()

  browser.runtime.sendMessage({
    action: 'updateActionState',
    enabled: isRepoTree,
  })

  if (isRepoTree === false) {
    return
  }

  if (document.querySelector('.tako')) {
    return
  }

  const { takoEnabled } = await browser.storage.sync.get('takoEnabled')
  if (takoEnabled === false) {
    return
  }

  const { token } = await browser.storage.sync.get('token')
  if (!token) {
    return renderTokenPrompt()
  }

  const octokit = new Octokit({ auth: token })

  try {
    await octokit.users.getAuthenticated()
  } catch (error) {
    if (error.status === 401) {
      return renderTokenPrompt({ invalidToken: true })
    }
  }

  return renderTako(octokit)
}

const renderTako = async (octokit: Octokit) => {
  const repository = await getRepository(octokit)

  const [sourceTreeElement] = await Promise.all([
    waitForElement('[data-hpc]:has([aria-labelledby=folders-and-files])'),
    queryClient.fetchQuery(
      repoContentsQueryConfig({ client: octokit, repository }, ''),
    ),
    queryClient.fetchQuery(
      mostRecentRepoCommitQueryConfig({ client: octokit, repository }),
    ),
  ])

  showGithubFileTree(false)

  const takoContainer = document.createElement('div')
  takoContainer.classList.add('tako-container')
  sourceTreeElement.parentElement?.insertBefore(
    takoContainer,
    sourceTreeElement.nextSibling,
  )

  useTakoStore.subscribe((state) => {
    const hasPreviewedFile = state.previewedFile !== null
    showWideLayout(!hasPreviewedFile)
  })

  browser.runtime.sendMessage({
    action: 'updateActionState',
    enabled: true,
  })

  createRoot(takoContainer).render(
    <TakoProvider client={octokit} repository={repository}>
      <Tako />
    </TakoProvider>,
  )
}

const renderTokenPrompt = async ({ invalidToken = false } = {}) => {
  const takoContainer = await waitForElement('body')
  takoContainer.classList.add('tako-container')
  const rootElement = document.createElement('div')
  takoContainer.prepend(rootElement)

  browser.runtime.sendMessage({
    action: 'updateActionState',
    enabled: true,
  })

  createRoot(rootElement).render(<TokenPrompt invalidToken={invalidToken} />)
}

const stopTako = () => {
  const takoContainer = document.querySelector('.tako-container')
  if (takoContainer) {
    takoContainer.remove()
  }
  showGithubFileTree(true)
  showWideLayout(true)
  useTakoStore.setState(useTakoStore.getInitialState())
}

document.addEventListener('DOMContentLoaded', startTako)
document.addEventListener('turbo:render', startTako)

startTako()

browser.runtime.onMessage.addListener(
  (message: { action: string }, _sender, sendResponse) => {
    switch (message.action) {
      case 'checkRunning': {
        const isRunning = document.querySelector('.tako') !== null
        sendResponse(isRunning)
        break
      }
      case 'start': {
        startTako()
        sendResponse(true)
        break
      }
      case 'stop': {
        stopTako()
        sendResponse(true)
        break
      }
    }
    return true
  },
)
