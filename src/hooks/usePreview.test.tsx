import { Octokit } from '@octokit/rest'
import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { TakoProvider } from '../components/Tako'
import { queryClient } from '../queryClient'
import { mockRepoObjects } from '../test/mocks/github'
import { server } from '../test/setup'
import { usePreview } from './usePreview'

const repository = { owner: 'brumm', repo: 'tako', ref: 'main' }

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TakoProvider client={new Octokit()} repository={repository}>
      {children}
    </TakoProvider>
  </QueryClientProvider>
)

const preview = (path: string, text?: string) => {
  if (text !== undefined) {
    mockRepoObjects[path] = { __typename: 'Blob', oid: path, text }
  }
  return renderHook(() => usePreview({ path, repository, virtualPath: path }), {
    wrapper,
  })
}

const renderedMarkdown = (html: string) =>
  server.use(
    http.post('https://api.github.com/markdown', () => HttpResponse.text(html)),
  )

describe('usePreview', () => {
  it('previews images by url', () => {
    const { result } = preview('docs/logo.PNG')
    expect(result.current).toEqual({
      kind: 'image',
      src: '/brumm/tako/blob/main/docs/logo.PNG?raw=true',
    })
  })

  it('refuses other binary files', () => {
    expect(preview('app.zip').result.current).toEqual({ kind: 'unknown' })
  })

  it('detects empty files', async () => {
    const { result } = preview('empty.txt', '  \n')
    await waitFor(() => expect(result.current).toEqual({ kind: 'empty' }))
  })

  it('shows code before highlighting finishes', async () => {
    renderedMarkdown('<pre>highlighted</pre>')
    const { result } = preview('src/a.ts', 'const a = 1')

    await waitFor(() =>
      expect(result.current).toMatchObject({
        kind: 'code',
        text: 'const a = 1',
      }),
    )
    await waitFor(() =>
      expect(result.current).toEqual({
        kind: 'code',
        text: 'const a = 1',
        html: '<pre>highlighted</pre>',
      }),
    )
  })

  it('highlights extensionless files by name', async () => {
    let body = ''
    server.use(
      http.post('https://api.github.com/markdown', async ({ request }) => {
        body = ((await request.json()) as { text: string }).text
        return HttpResponse.text('<pre></pre>')
      }),
    )
    const { result } = preview('build.d/Makefile', 'all:')

    await waitFor(() =>
      expect(result.current).toMatchObject({ html: '<pre></pre>' }),
    )
    expect(body.startsWith('```Makefile\n')).toBe(true)
  })

  it('resolves relative markdown images against the file', async () => {
    renderedMarkdown(
      '<img src="img/a.png"><img src="../b.png"><img src="https://x.com/c.png">',
    )
    const { result } = preview('docs/README.md', '# Docs')

    await waitFor(() => expect(result.current.kind).toBe('markdown'))
    expect(result.current).toEqual({
      kind: 'markdown',
      html:
        '<img src="https://github.com/brumm/tako/raw/main/docs/img/a.png">' +
        '<img src="https://github.com/brumm/tako/raw/main/b.png">' +
        '<img src="https://x.com/c.png">',
    })
  })
})
