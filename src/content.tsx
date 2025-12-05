import { isRepoTree } from 'github-url-detection'
import { createRoot } from 'react-dom/client'

import { Octokit } from '@octokit/rest'
import browser from 'webextension-polyfill'
import { Tako, TakoProvider } from './components/Tako'
import { TokenPrompt } from './components/TokenPrompt'
import { mostRecentRepoCommitQueryConfig } from './hooks/useMostRecentRepoCommitQuery'
import { repoContentsQueryConfig } from './hooks/useRepoContentsQuery'
import {
  disableTakoLayout,
  enableTakoLayout,
  showGithubFileTree,
} from './lib/github-layout'
import { getRepository } from './lib/repository'
import { queryClient } from './queryClient'
import { useStore } from './store'
import { onElementRemoval, waitForElement } from './waitForElement'

const startTako = async () => {
  if (!isRepoTree() || document.querySelector('.tako')) {
    return
  }
  const { takoEnabled } = await browser.storage.sync.get('takoEnabled')
  if (takoEnabled === false) {
    return
  }

  onElementRemoval('.tako', startTako)

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

  const sourceTreeElement = await waitForElement(
    '[data-hpc]:has([aria-labelledby=folders-and-files])',
  )

  queryClient.fetchQuery(
    repoContentsQueryConfig({ client: octokit, repository }, ''),
  )
  queryClient.fetchQuery(
    mostRecentRepoCommitQueryConfig({ client: octokit, repository }),
  )

  sourceTreeElement.style.display = 'none'

  const takoContainer = document.createElement('div')
  takoContainer.classList.add('tako')
  sourceTreeElement.parentElement?.insertBefore(
    takoContainer,
    sourceTreeElement.nextSibling,
  )

  useStore.subscribe((state) => {
    const hasPreviewedFile = state.previewedFile !== null
    if (hasPreviewedFile) {
      enableTakoLayout()
    } else {
      disableTakoLayout()
    }
  })

  createRoot(takoContainer).render(
    <TakoProvider client={octokit} repository={repository}>
      <Tako />
    </TakoProvider>,
  )
}

const renderTokenPrompt = async ({ invalidToken = false } = {}) => {
  const containerElement = await waitForElement('body')
  const rootElement = document.createElement('div')
  rootElement.classList.add('tako')
  containerElement.prepend(rootElement)
  createRoot(rootElement).render(<TokenPrompt invalidToken={invalidToken} />)
}

const stopTako = () => {
  const takoElement = document.querySelector('.tako')
  if (takoElement) {
    takoElement.remove()
  }
  showGithubFileTree()
  disableTakoLayout()
}

document.addEventListener('DOMContentLoaded', startTako)
document.addEventListener('turbo:render', startTako)

startTako()

browser.runtime.onMessage.addListener(
  (message: { action: string }, _sender, sendResponse) => {
    switch (message.action) {
      case 'checkRunning': {
        const isRunning = !!document.querySelector('.tako')
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
