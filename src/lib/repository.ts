import { Octokit } from '@octokit/rest'
import { utils } from 'github-url-detection'
import invariant from 'tiny-invariant'
import type { RepositoryInfo } from '../types'

export const getRepository = async (
  octokit: Octokit,
): Promise<RepositoryInfo> => {
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
  branch = decodeURIComponent(branch)
  return { owner, repo, ref: branch }
}
