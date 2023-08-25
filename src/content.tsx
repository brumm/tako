import { isRepoRoot, isRepoTree, utils } from 'github-url-detection'
import { createRoot } from 'react-dom/client'

import { Octokit } from '@octokit/rest'
import invariant from 'tiny-invariant'
import { storage } from 'webextension-polyfill'
import { Tako, TakoProvider } from './components/Tako'
import { TokenPrompt } from './components/TokenPrompt'
import { queryClient } from './queryClient'
import { useStore } from './store'
import { onElementRemoval, waitForElement } from './waitForElement'

const start = async () => {
  if (!isRepoRoot() || !isRepoTree() || document.querySelector('.tako')) {
    return
  }

  onElementRemoval('.tako', () => {
    start()
  })

  const { token } = await storage.sync.get('token')
  if (token) {
    renderTako(token)
  } else {
    renderTokenPrompt()
  }
}

const renderTako = async (token: string) => {
  const octokit = new Octokit({ auth: token })

  const info = utils.getRepositoryInfo()
  invariant(info)
  const { owner, name: repo, path } = info

  let branch: string
  if (path?.startsWith('tree/')) {
    branch = path.replace('tree/', '')
  } else {
    const repoResponse = await octokit.repos.get({ owner, repo })
    branch = repoResponse.data.default_branch
  }
  const repository = { owner, repo, ref: branch }

  queryClient.setQueryData(
    ['contents', repository, path],
    await octokit.repos.getContent({ ...repository, path: '' }),
  )

  const sourceTreeElement = await waitForElement('[data-hpc]')
  const layoutElement = document.querySelector('[data-view-component].Layout')
  const sidebarElement = document.querySelector('.Layout-sidebar')

  useStore.subscribe((state) => {
    const hasPreviewedFile = state.previewedFile !== null
    layoutElement?.classList.toggle('Layout', !hasPreviewedFile)
    sidebarElement?.classList.toggle('d-none', hasPreviewedFile)
  })

  createRoot(sourceTreeElement).render(
    <TakoProvider client={octokit} repository={repository}>
      <Tako />
    </TakoProvider>,
  )
}

const renderTokenPrompt = async () => {
  const containerElement = await waitForElement('[data-hpc]')
  const rootElement = document.createElement('div')
  rootElement.classList.add('tako')
  containerElement.prepend(rootElement)
  createRoot(rootElement).render(<TokenPrompt />)
}

document.addEventListener('DOMContentLoaded', start)
document.addEventListener('turbo:render', start)
