import { ReactNode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import invariant from 'tiny-invariant'

import { useTakoStore } from '../store'
import { waitForElement } from '../waitForElement'

const SELECTORS = {
  fileTree: '[data-hpc]:has([aria-labelledby=folders-and-files])',
  sidebar: '[class^=prc-PageLayout-Pane-]',
  contentWrapper:
    '[class^=prc-PageLayout-Content-] > :has([aria-labelledby=folders-and-files]):not(:has([class^=prc-PageLayout-Content-]))',
}

let mounted: {
  root: Root
  container: HTMLElement
  unsubscribe: () => void
} | null = null

export const isTakoMounted = () => {
  if (mounted && !mounted.container.isConnected) {
    unmountTako()
  }
  return mounted !== null
}

export const mountTako = async (children: ReactNode) => {
  if (isTakoMounted()) {
    return
  }

  const fileTree = await waitForElement(SELECTORS.fileTree)
  fileTree.classList.add('d-none')

  const container = createContainer()
  fileTree.after(container)

  render(container, children, () =>
    useTakoStore.subscribe((state) =>
      setWideLayout(state.previewedFile !== null),
    ),
  )
}

export const mountTokenPrompt = async (children: ReactNode) => {
  if (isTakoMounted()) {
    return
  }

  const body = await waitForElement('body')
  const container = createContainer()
  body.prepend(container)

  render(container, children)
}

export const unmountTako = () => {
  if (mounted) {
    mounted.unsubscribe()
    mounted.root.unmount()
    mounted.container.remove()
    mounted = null
  }

  document.querySelector(SELECTORS.fileTree)?.classList.remove('d-none')
  setWideLayout(false)
  useTakoStore.setState(useTakoStore.getInitialState())
}

const createContainer = () => {
  const container = document.createElement('div')
  container.classList.add('tako-container')
  return container
}

const render = (
  container: HTMLElement,
  children: ReactNode,
  subscribe = () => () => {},
) => {
  const root = createRoot(container)
  root.render(children)
  mounted = { root, container, unsubscribe: subscribe() }
}

const setWideLayout = (isWideLayoutEnabled: boolean) => {
  const sideBarElement = document.querySelector<HTMLElement>(SELECTORS.sidebar)
  const wrapperElement = document.querySelector<HTMLElement>(
    SELECTORS.contentWrapper,
  )
  const layoutElement = wrapperElement?.parentElement

  if (!isWideLayoutEnabled && !(sideBarElement && layoutElement)) {
    return
  }
  invariant(sideBarElement && wrapperElement && layoutElement)

  sideBarElement.classList.toggle('d-none', isWideLayoutEnabled)
  wrapperElement.classList.toggle('tmp-pr-lg-3', isWideLayoutEnabled)
  const { dataset } = layoutElement
  if (isWideLayoutEnabled) {
    dataset.takoOriginalWidth ??= dataset.width ?? ''
    dataset.width = 'full'
  } else if (dataset.takoOriginalWidth !== undefined) {
    if (dataset.takoOriginalWidth) {
      dataset.width = dataset.takoOriginalWidth
    } else {
      delete dataset.width
    }
    delete dataset.takoOriginalWidth
  }
}
