import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useTakoStore } from '../store'
import {
  isTakoMounted,
  mountTako,
  mountTokenPrompt,
  unmountTako,
} from './github-page'

const githubRepoTreeMarkup = `
  <div class="prc-PageLayout-PageLayoutContent-abc">
    <div class="prc-PageLayout-Content-abc" data-width="large">
      <div class="repo-content">
        <div data-hpc>
          <table aria-labelledby="folders-and-files"></table>
        </div>
      </div>
    </div>
    <div class="prc-PageLayout-Pane-abc">sidebar</div>
  </div>
`

const getFileTree = () => document.querySelector('[data-hpc]')!
const getSidebar = () =>
  document.querySelector('[class^=prc-PageLayout-Pane-]')!
const getLayout = () =>
  document.querySelector<HTMLElement>('[class^=prc-PageLayout-Content-]')!

const previewFile = () =>
  useTakoStore.getState().onPreviewFile({
    path: 'README.md',
    virtualPath: 'README.md',
    repository: { owner: 'brumm', repo: 'tako', ref: 'main' },
  })

describe('github page', () => {
  beforeEach(() => {
    document.body.innerHTML = githubRepoTreeMarkup
  })

  afterEach(() => {
    act(() => unmountTako())
  })

  it('replaces the file tree with tako', async () => {
    await act(() => mountTako(<div className="tako">tako</div>))

    expect(isTakoMounted()).toBe(true)
    expect(getFileTree()).toHaveClass('d-none')
    expect(getFileTree().nextElementSibling).toHaveClass('tako-container')
    expect(document.querySelector('.tako')).toHaveTextContent('tako')
  })

  it('mounts only once', async () => {
    await act(() => mountTako(<div className="tako" />))
    await act(() => mountTako(<div className="tako" />))

    expect(document.querySelectorAll('.tako-container')).toHaveLength(1)
  })

  it('widens the layout while a file is previewed', async () => {
    await act(() => mountTako(<div className="tako" />))

    act(() => previewFile())
    expect(getSidebar()).toHaveClass('d-none')
    expect(getLayout().dataset.width).toBe('full')

    act(() => useTakoStore.getState().onPreviewFile(null))
    expect(getSidebar()).not.toHaveClass('d-none')
    expect(getLayout().dataset.width).toBe('large')
  })

  it('restores the github page on unmount', async () => {
    await act(() => mountTako(<div className="tako" />))
    act(() => previewFile())

    act(() => unmountTako())

    expect(isTakoMounted()).toBe(false)
    expect(document.querySelector('.tako-container')).toBeNull()
    expect(getFileTree()).not.toHaveClass('d-none')
    expect(getSidebar()).not.toHaveClass('d-none')
    expect(getLayout().dataset.width).toBe('large')
    expect(useTakoStore.getState().previewedFile).toBeNull()

    act(() => previewFile())
    expect(getSidebar()).not.toHaveClass('d-none')
  })

  it('can mount again after github replaces the page', async () => {
    await act(() => mountTako(<div className="tako" />))

    document.body.innerHTML = githubRepoTreeMarkup

    let isMounted = true
    act(() => {
      isMounted = isTakoMounted()
    })
    expect(isMounted).toBe(false)

    await act(() => mountTako(<div className="tako" />))
    expect(document.querySelectorAll('.tako-container')).toHaveLength(1)
  })

  it('unmounts the token prompt without touching the page', async () => {
    await act(() => mountTokenPrompt(<form className="tako" />))
    expect(document.body.firstElementChild).toHaveClass('tako-container')

    act(() => unmountTako())

    expect(document.body).toBeInTheDocument()
    expect(document.querySelector('.tako-container')).toBeNull()
    expect(getFileTree()).toBeInTheDocument()
  })
})
