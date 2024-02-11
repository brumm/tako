import { isRepoTree, utils } from 'github-url-detection'
import { createRoot } from 'react-dom/client'

import { Octokit } from '@octokit/rest'
import invariant from 'tiny-invariant'
import { storage } from 'webextension-polyfill'
import { Tako, TakoProvider } from './components/Tako'
import { TokenPrompt } from './components/TokenPrompt'
import { mostRecentRepoCommitQueryConfig } from './hooks/useMostRecentRepoCommitQuery'
import { repoContentsQueryConfig } from './hooks/useRepoContentsQuery'
import { queryClient } from './queryClient'
import { useStore } from './store'
import { onElementRemoval, waitForElement } from './waitForElement'

const start = async () => {
  if (!isRepoTree() || document.querySelector('.tako')) {
    return
  }

  onElementRemoval('.tako', start)

  const { token } = await storage.sync.get('token')

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

  const layoutElement = document.querySelector<HTMLDivElement>('.Layout')
  const repoMainElement = document.querySelector<HTMLDivElement>(
    '[data-selector=repos-split-pane-content]',
  )
  const sidebarElement = document.querySelector('.Layout-sidebar')
  useStore.subscribe((state) => {
    const hasPreviewedFile = state.previewedFile !== null
    if (hasPreviewedFile) {
      layoutElement?.classList.remove('Layout')
      repoMainElement?.style.setProperty('max-width', 'unset', 'important')
      sidebarElement?.classList.add('d-none')
    } else {
      layoutElement?.classList.add('Layout')
      repoMainElement?.style.removeProperty('max-width')
      sidebarElement?.classList.remove('d-none')
    }
  })

  createRoot(sourceTreeElement).render(
    <TakoProvider client={octokit} repository={repository}>
      <Tako />
    </TakoProvider>,
  )
}

const renderTokenPrompt = async ({ invalidToken = false } = {}) => {
  const containerElement = await waitForElement('[data-hpc]')
  const rootElement = document.createElement('div')
  rootElement.classList.add('tako')
  containerElement.prepend(rootElement)
  createRoot(rootElement).render(<TokenPrompt invalidToken={invalidToken} />)
}

document.addEventListener('DOMContentLoaded', start)
document.addEventListener('turbo:render', start)

const getRepository = async (octokit: Octokit) => {
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
  return repository
}
