import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/setup'
import { fetchTreeCommitInfo } from './tree-commit-info'

const repository = { owner: 'brumm', repo: 'tako', ref: 'main' }

describe('fetchTreeCommitInfo', () => {
  it('maps entry names to their latest commit', async () => {
    expect(await fetchTreeCommitInfo(repository, '')).toEqual({
      'README.md': {
        title: 'test commit',
        message: 'test commit\n\nbody',
        date: '2025-01-01T00:00:00.000Z',
        url: '/brumm/tako/commit/abc123def456',
      },
      src: expect.objectContaining({ title: 'test commit' }),
    })
  })

  it('requests json for refs and paths with special characters', async () => {
    let url = ''
    let accept = ''
    server.use(
      http.get('https://github.com/*', ({ request }) => {
        url = request.url
        accept = request.headers.get('accept') ?? ''
        return HttpResponse.json({ entries: {} })
      }),
    )

    await fetchTreeCommitInfo(
      { ...repository, ref: 'feature/a#b' },
      'dir with space/c%d',
    )

    expect(url).toBe(
      'https://github.com/brumm/tako/tree-commit-info/feature/a%23b/dir%20with%20space/c%25d',
    )
    expect(accept).toBe('application/json')
  })

  it('fails on error responses', async () => {
    await expect(fetchTreeCommitInfo(repository, 'nope')).rejects.toThrow()
  })
})
