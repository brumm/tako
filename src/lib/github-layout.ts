export const hideGithubFileTree = () => {
  const sourceTreeElement = document.querySelector<HTMLElement>(
    '[data-hpc]:has([aria-labelledby=folders-and-files])',
  )
  if (sourceTreeElement) {
    sourceTreeElement.style.display = 'none'
  }
}

export const showGithubFileTree = () => {
  const sourceTreeElement = document.querySelector<HTMLElement>(
    '[data-hpc]:has([aria-labelledby=folders-and-files])',
  )
  if (sourceTreeElement) {
    sourceTreeElement.style.display = ''
  }
}

export const enableTakoLayout = () => {
  const layoutElement = document.querySelector<HTMLDivElement>('.Layout')
  const repoMainElement = document.querySelector<HTMLDivElement>(
    '[data-selector=repos-split-pane-content]',
  )
  const sidebarElement = document.querySelector('.Layout-sidebar')

  layoutElement?.classList.remove('Layout')
  repoMainElement?.style.setProperty('max-width', 'unset', 'important')
  sidebarElement?.classList.add('d-none')
}

export const disableTakoLayout = () => {
  const layoutElement = document.querySelector<HTMLDivElement>('.Layout')
  const repoMainElement = document.querySelector<HTMLDivElement>(
    '[data-selector=repos-split-pane-content]',
  )
  const sidebarElement = document.querySelector('.Layout-sidebar')

  layoutElement?.classList.add('Layout')
  repoMainElement?.style.removeProperty('max-width')
  sidebarElement?.classList.remove('d-none')
}
