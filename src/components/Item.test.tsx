import { Octokit } from '@octokit/rest'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import browser from 'webextension-polyfill'
import { queryClient } from '../queryClient'
import { useTakoStore } from '../store'
import { mockRepoObjects } from '../test/mocks/github'
import { Contents } from './Contents'
import { TakoProvider } from './Tako'

const tree = (path: string, entries: Array<[string, string, number]>) => {
  mockRepoObjects[path] = {
    __typename: 'Tree',
    oid: `${path}-oid`,
    entries: entries.map(([name, type, mode]) => ({
      name,
      path: path ? `${path}/${name}` : name,
      type,
      mode,
      oid: `${name}-oid`,
      submodule:
        type === 'commit' ? { gitUrl: 'git@github.com:other/sub.git' } : null,
    })),
  }
}

const renderTree = (path: string) =>
  render(
    <QueryClientProvider client={queryClient}>
      <TakoProvider
        client={new Octokit()}
        repository={{ owner: 'brumm', repo: 'tako', ref: 'main' }}
      >
        <div role="grid">
          <Contents path={path} virtualPath={path} />
        </div>
      </TakoProvider>
    </QueryClientProvider>,
  )

const clickRow = async (name: string | RegExp) =>
  fireEvent.click(await screen.findByText(name))

afterEach(async () => {
  useTakoStore.setState(useTakoStore.getInitialState())
  await browser.storage.sync.set({ collapseDirs: false })
})

describe('tree items', () => {
  it('expands and collapses directories', async () => {
    renderTree('')

    await clickRow('src')
    expect(await screen.findByText('index.ts')).toBeInTheDocument()

    await clickRow('src')
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument()
  })

  it('toggles file preview', async () => {
    renderTree('')

    await clickRow('README.md')
    expect(useTakoStore.getState().previewedFile).toMatchObject({
      path: 'README.md',
      sha: 'README.md-oid',
      virtualPath: 'README.md',
    })

    await clickRow('README.md')
    expect(useTakoStore.getState().previewedFile).toBeNull()
  })

  it('collapses single-child directory chains when enabled', async () => {
    await browser.storage.sync.set({ collapseDirs: true })
    tree('chain', [['a', 'tree', 16384]])
    tree('chain/a', [['b', 'tree', 16384]])
    tree('chain/a/b', [['leaf.txt', 'blob', 33188]])
    renderTree('chain')

    await clickRow('a')
    expect(await screen.findByText('a/b')).toBeInTheDocument()
    expect(await screen.findByText('leaf.txt')).toBeInTheDocument()
  })

  it('opens submodules in their own repository', async () => {
    tree('with-sub', [['sub', 'commit', 57344]])
    renderTree('with-sub')

    await clickRow('sub @ sub-oid')
    expect(await screen.findByText('README.md')).toBeInTheDocument()
  })

  it('renders symlinks as their target', async () => {
    tree('links', [
      ['link-to-file', 'blob', 40960],
      ['link-to-dir', 'blob', 40960],
    ])
    mockRepoObjects['links/link-to-file'] = {
      __typename: 'Blob',
      oid: 'l1',
      text: '../README.md',
    }
    mockRepoObjects['links/link-to-dir'] = {
      __typename: 'Blob',
      oid: 'l2',
      text: '../src',
    }
    renderTree('links')

    expect(
      await screen.findByTitle('link-to-file → README.md'),
    ).toBeInTheDocument()

    await screen.findByTitle('link-to-dir → src')
    await clickRow('link-to-dir')
    expect(await screen.findByText('index.ts')).toBeInTheDocument()

    await clickRow('link-to-file')
    expect(useTakoStore.getState().previewedFile).toMatchObject({
      path: 'README.md',
      virtualPath: 'links/link-to-file',
    })
  })

  it('marks broken symlinks', async () => {
    tree('broken', [['broken-link', 'blob', 40960]])
    mockRepoObjects['broken/broken-link'] = {
      __typename: 'Blob',
      oid: 'l3',
      text: 'nowhere',
    }
    renderTree('broken')

    expect(
      await screen.findByText('broken-link (broken symlink)'),
    ).toBeInTheDocument()
  })
})
