import invariant from 'tiny-invariant'

export function showGithubFileTree(isFileTreeVisible: boolean) {
  const sourceTreeElement = document.querySelector<HTMLElement>(
    '[data-hpc]:has([aria-labelledby=folders-and-files])',
  )
  invariant(sourceTreeElement)
  sourceTreeElement.classList.toggle('d-none', !isFileTreeVisible)
}

export function showWideLayout(isWideLayoutEnabled: boolean) {
  const layoutElement = document.querySelector<HTMLDivElement>(
    'turbo-frame .react-repos-overview-margin',
  )
  invariant(layoutElement)
  layoutElement.classList.toggle('Layout', isWideLayoutEnabled)
}
