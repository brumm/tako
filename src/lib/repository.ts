import { Octokit } from '@octokit/rest'
import { utils } from 'github-url-detection'
import invariant from 'tiny-invariant'
import type { RepositoryInfo } from '../types'

// tree/{ref}/{path} is ambiguous when the ref contains slashes, so resolve
// every prefix and pick the longest one that exists
const resolveRef = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  refAndPath: string,
) => {
  const segments = refAndPath.split('/')
  const candidates = segments.map((_, index) =>
    segments.slice(0, index + 1).join('/'),
  )

  const response = await octokit.graphql<{
    repository: Record<string, { oid: string } | null>
  }>(`
    query {
      repository(owner: "${owner}", name: "${repo}") {
        ${candidates
          .map(
            (candidate, index) =>
              `ref${index}: object(expression: ${JSON.stringify(candidate)}) { oid }`,
          )
          .join('\n')}
      }
    }
  `)

  const ref = candidates.findLast(
    (_, index) => response.repository[`ref${index}`] !== null,
  )
  invariant(ref)
  return ref
}

export const getRepository = async (
  octokit: Octokit,
): Promise<{ repository: RepositoryInfo; path: string }> => {
  const info = utils.getRepositoryInfo()
  invariant(info)
  const { owner, name: repo, path } = info
  if (path?.startsWith('tree/')) {
    const refAndPath = decodeURIComponent(path.replace('tree/', ''))
    const ref = await resolveRef(octokit, owner, repo, refAndPath)
    return {
      repository: { owner, repo, ref },
      path: refAndPath.slice(ref.length + 1),
    }
  }

  const repoResponse = await octokit.repos.get({ owner, repo })
  return {
    repository: { owner, repo, ref: repoResponse.data.default_branch },
    path: '',
  }
}
