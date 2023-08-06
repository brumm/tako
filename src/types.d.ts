import { RestEndpointMethodTypes } from '@octokit/rest'

export type HoverFile = {
  path: string
  repository: RepositoryInfo
}

export type PreviewFile = HoverFile & {
  sha?: string
}

export type RepositoryInfo = {
  owner: string
  repo: string
  ref: string
}

export type RepoContentResponse =
  RestEndpointMethodTypes['repos']['getContent']['response']

export type RepoContentItem =
  RestEndpointMethodTypes['repos']['getContent']['response']['data']
