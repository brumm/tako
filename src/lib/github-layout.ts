import invariant from 'tiny-invariant'

export function showGithubFileTree(isFileTreeVisible: boolean) {
  const sourceTreeElement = document.querySelector<HTMLElement>(
    '[data-hpc]:has([aria-labelledby=folders-and-files])',
  )
  invariant(sourceTreeElement)
  sourceTreeElement.classList.toggle('d-none', !isFileTreeVisible)
}

export function showWideLayout(isWideLayoutEnabled: boolean) {
  const sideBarElement = document.querySelector<HTMLDivElement>(
    '[class^=prc-PageLayout-Pane-]',
  )
  invariant(sideBarElement)
  sideBarElement.classList.toggle('d-none', isWideLayoutEnabled)

  const wrapperElement = document.querySelector<HTMLDivElement>(
    '[class^=OverviewContent-module__Box__]',
  )
  invariant(wrapperElement)
  wrapperElement.classList.toggle('tmp-pr-lg-3', isWideLayoutEnabled)

  const layoutElement = document.querySelector<HTMLDivElement>(
    '[class^=prc-PageLayout-Content-]:has(>[class^=OverviewContent-module__Box__])',
  )
  invariant(layoutElement)
  if (isWideLayoutEnabled) {
    layoutElement.dataset.width = 'full'
  } else {
    layoutElement.dataset.width = 'large'
  }
}
