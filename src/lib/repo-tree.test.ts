import { Octokit } from '@octokit/rest'
import { describe, expect, it } from 'vitest'
import { mockRepoObjects } from '../test/mocks/github'
import { fetchTreeEntries, resolveSymlink } from './repo-tree'

const client = new Octokit()
const repository = { owner: 'brumm', repo: 'tako', ref: 'main' }

const withTree = (path: string, entries: unknown[]) => {
  mockRepoObjects[path] = { __typename: 'Tree', oid: `${path}-oid`, entries }
}

describe('fetchTreeEntries', () => {
  it('normalises and sorts entries', async () => {
    withTree('mixed', [
      {
        name: 'b.txt',
        path: 'mixed/b.txt',
        type: 'blob',
        mode: 33188,
        oid: 'b',
        submodule: null,
      },
      {
        name: 'link',
        path: 'mixed/link',
        type: 'blob',
        mode: 40960,
        oid: 'l',
        submodule: null,
      },
      {
        name: 'run.sh',
        path: 'mixed/run.sh',
        type: 'blob',
        mode: 33261,
        oid: 'r',
        submodule: null,
      },
      {
        name: 'z',
        path: 'mixed/z',
        type: 'tree',
        mode: 16384,
        oid: 'z',
        submodule: null,
      },
      {
        name: 'a',
        path: 'mixed/a',
        type: 'tree',
        mode: 16384,
        oid: 'a',
        submodule: null,
      },
      {
        name: 'vendor',
        path: 'mixed/vendor',
        type: 'commit',
        mode: 57344,
        oid: 'deadbeef',
        submodule: { gitUrl: 'https://github.com/other/vendor.git' },
      },
    ])

    expect(await fetchTreeEntries(client, repository, 'mixed')).toEqual([
      {
        kind: 'submodule',
        name: 'vendor',
        path: 'mixed/vendor',
        repository: { owner: 'other', repo: 'vendor', ref: 'deadbeef' },
      },
      { kind: 'dir', name: 'a', path: 'mixed/a' },
      { kind: 'dir', name: 'z', path: 'mixed/z' },
      { kind: 'file', name: 'b.txt', path: 'mixed/b.txt', sha: 'b' },
      { kind: 'file', name: 'run.sh', path: 'mixed/run.sh', sha: 'r' },
      { kind: 'symlink', name: 'link', path: 'mixed/link' },
    ])
  })

  it.each([
    ['git@github.com:other/vendor.git', { owner: 'other', repo: 'vendor' }],
    ['https://github.com/other/vendor', { owner: 'other', repo: 'vendor' }],
    ['../sibling.git', { owner: 'brumm', repo: 'sibling' }],
  ])('resolves submodule url %s', async (gitUrl, expected) => {
    withTree('submodules', [
      {
        name: 'sub',
        path: 'sub',
        type: 'commit',
        mode: 57344,
        oid: 'abc',
        submodule: { gitUrl },
      },
    ])

    const [entry] = await fetchTreeEntries(client, repository, 'submodules')
    expect(entry).toMatchObject({ repository: { ...expected, ref: 'abc' } })
  })

  it('fails for a missing tree', async () => {
    await expect(fetchTreeEntries(client, repository, 'nope')).rejects.toThrow()
  })
})

describe('resolveSymlink', () => {
  it.each([
    ['link-to-file', { kind: 'file', path: 'README.md', sha: 'abc123' }],
    ['link-to-dir', { kind: 'dir', path: 'src' }],
    [
      'src/link-with-dotdot',
      { kind: 'file', path: 'README.md', sha: 'abc123' },
    ],
    ['nested/deeper/link', { kind: 'file', path: 'README.md', sha: 'abc123' }],
    ['link-with-dot', { kind: 'file', path: 'README.md', sha: 'abc123' }],
  ])('resolves %s', async (path, expected) => {
    expect(await resolveSymlink(client, repository, path)).toEqual(expected)
  })

  it.each(['broken-link', 'missing-link'])('fails for %s', async (path) => {
    await expect(resolveSymlink(client, repository, path)).rejects.toThrow()
  })
})
