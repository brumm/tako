import { Octokit } from '@octokit/rest'
import invariant from 'tiny-invariant'
import type { RepositoryInfo } from '../types'

export type TreeEntry =
  | { kind: 'dir'; name: string; path: string }
  | { kind: 'file'; name: string; path: string; sha: string }
  | { kind: 'symlink'; name: string; path: string }
  | {
      kind: 'submodule'
      name: string
      path: string
      repository: RepositoryInfo
    }

export type SymlinkTarget =
  | { kind: 'dir'; path: string }
  | { kind: 'file'; path: string; sha: string }

// GitHub file modes (decimal)
const SYMLINK_MODE = 40960
const SORT_ORDER = ['submodule', 'dir', 'file', 'symlink']

type RawTreeEntry = {
  name: string
  path: string
  type: 'blob' | 'tree' | 'commit'
  mode: number
  oid: string
  submodule: { gitUrl: string } | null
}

export const fetchTreeEntries = async (
  client: Octokit,
  repository: RepositoryInfo,
  path: string,
) => {
  const response = await client.graphql<{
    repository: { object: { entries: RawTreeEntry[] } | null }
  }>(
    `
      query ($owner: String!, $repo: String!, $expression: String!) {
        repository(owner: $owner, name: $repo) {
          object(expression: $expression) {
            ... on Tree {
              entries {
                name
                path
                type
                mode
                oid
                submodule {
                  gitUrl
                }
              }
            }
          }
        }
      }
    `,
    {
      owner: repository.owner,
      repo: repository.repo,
      expression: `${repository.ref}:${path}`,
    },
  )

  const entries = response.repository.object?.entries
  invariant(entries, `Tree not found: ${path}`)

  return entries
    .map((entry) => toTreeEntry(repository, entry))
    .sort(
      (a, b) =>
        SORT_ORDER.indexOf(a.kind) - SORT_ORDER.indexOf(b.kind) ||
        a.name.localeCompare(b.name),
    )
}

export const resolveSymlink = async (
  client: Octokit,
  repository: RepositoryInfo,
  path: string,
): Promise<SymlinkTarget> => {
  const symlink = await fetchObject<{ text: string | null }>(
    client,
    repository,
    path,
    '... on Blob { text }',
  )
  invariant(symlink?.text, `Symlink target not found: ${path}`)

  const targetPath = resolveRelativePath(path, symlink.text)
  const target = await fetchObject<{
    __typename: 'Tree' | 'Blob' | 'Commit'
    oid: string
  }>(client, repository, targetPath, '__typename oid')

  invariant(target, `Broken symlink: ${path} → ${targetPath}`)
  invariant(target.__typename !== 'Commit', 'Symlink to submodule')

  return target.__typename === 'Tree'
    ? { kind: 'dir', path: targetPath }
    : { kind: 'file', path: targetPath, sha: target.oid }
}

const fetchObject = async <T>(
  client: Octokit,
  repository: RepositoryInfo,
  path: string,
  fields: string,
) => {
  const response = await client.graphql<{
    repository: { object: T | null }
  }>(
    `
      query ($owner: String!, $repo: String!, $expression: String!) {
        repository(owner: $owner, name: $repo) {
          object(expression: $expression) {
            ${fields}
          }
        }
      }
    `,
    {
      owner: repository.owner,
      repo: repository.repo,
      expression: `${repository.ref}:${path}`,
    },
  )
  return response.repository.object
}

const toTreeEntry = (
  repository: RepositoryInfo,
  { name, path, type, mode, oid, submodule }: RawTreeEntry,
): TreeEntry => {
  if (type === 'tree') {
    return { kind: 'dir', name, path }
  }
  if (type === 'commit') {
    invariant(submodule, `Submodule without url: ${path}`)
    return {
      kind: 'submodule',
      name,
      path,
      repository: getSubmoduleRepository(repository, submodule.gitUrl, oid),
    }
  }
  if (mode === SYMLINK_MODE) {
    return { kind: 'symlink', name, path }
  }
  return { kind: 'file', name, path, sha: oid }
}

// gitUrl can be ssh, https or relative to the parent repository
const getSubmoduleRepository = (
  { owner, repo }: RepositoryInfo,
  gitUrl: string,
  oid: string,
): RepositoryInfo => {
  const { pathname } = new URL(
    gitUrl.replace(/^git@github\.com:/, 'https://github.com/'),
    `https://github.com/${owner}/${repo}/`,
  )
  const [submoduleOwner, submoduleRepo] = pathname
    .slice(1)
    .replace(/\.git$/, '')
    .split('/')
  return { owner: submoduleOwner, repo: submoduleRepo, ref: oid }
}

const resolveRelativePath = (symlinkPath: string, target: string) => {
  const parts = symlinkPath.split('/').slice(0, -1)
  for (const part of target.split('/')) {
    if (part === '..') {
      parts.pop()
    } else if (part !== '.') {
      parts.push(part)
    }
  }
  return parts.join('/')
}
