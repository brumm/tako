import { Octokit } from '@octokit/rest'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { queryClient } from '../queryClient'
import { server } from '../test/setup'
import { TakoProvider } from './Tako'
import { SymlinkItem } from './Item'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const octokit = new Octokit()
  return (
    <QueryClientProvider client={queryClient}>
      <TakoProvider
        client={octokit}
        repository={{ owner: 'brumm', repo: 'tako', ref: 'main' }}
      >
        <div role="grid">{children}</div>
      </TakoProvider>
    </QueryClientProvider>
  )
}

describe('SymlinkItem', () => {
  it('renders loading state initially', () => {
    // Mock symlink response
    server.use(
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/link-to-file',
        () => {
          return new Promise(() => {}) // Never resolve
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="link-to-file" path="link-to-file" />
      </TestWrapper>,
    )

    expect(screen.getByText('link-to-file')).toBeInTheDocument()
  })

  it('resolves and renders symlink pointing to file', async () => {
    // Mock symlink response
    server.use(
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/link-to-file',
        () => {
          return HttpResponse.json({
            name: 'link-to-file',
            path: 'link-to-file',
            type: 'symlink',
            target: 'README.md',
            sha: 'symlink123',
          })
        },
      ),
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/README.md',
        () => {
          return HttpResponse.json({
            name: 'README.md',
            path: 'README.md',
            sha: 'abc123',
            size: 100,
            type: 'file',
          })
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="link-to-file" path="link-to-file" />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('link-to-file')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('link-to-file → README.md')
    })
  })

  it('resolves and renders symlink pointing to directory', async () => {
    // Mock symlink response
    server.use(
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/link-to-dir',
        () => {
          return HttpResponse.json({
            name: 'link-to-dir',
            path: 'link-to-dir',
            type: 'symlink',
            target: 'src',
            sha: 'symlink456',
          })
        },
      ),
      http.get('https://api.github.com/repos/brumm/tako/contents/src', () => {
        return HttpResponse.json([
          {
            name: 'index.ts',
            path: 'src/index.ts',
            type: 'file',
            sha: 'file123',
          },
        ])
      }),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="link-to-dir" path="link-to-dir" />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('link-to-dir')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('link-to-dir → src')
    })

    // Should render chevron for expandable directory
    const chevron = document.querySelector('.octicon-chevron-right')
    expect(chevron).toBeInTheDocument()
  })

  it('handles broken symlink with error state', async () => {
    // Mock symlink response pointing to non-existent target
    server.use(
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/broken-link',
        () => {
          return HttpResponse.json({
            name: 'broken-link',
            path: 'broken-link',
            type: 'symlink',
            target: 'non-existent-file',
            sha: 'symlink789',
          })
        },
      ),
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/non-existent-file',
        () => {
          return HttpResponse.json(
            { message: 'Not Found' },
            { status: 404 },
          )
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="broken-link" path="broken-link" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/broken-link \(broken symlink\)/),
      ).toBeInTheDocument()
    })
  })

  it('resolves relative paths with ../', async () => {
    // Mock symlink in subdirectory pointing to parent directory file
    server.use(
      http.get('https://api.github.com/repos/brumm/tako/contents/src/link*', () => {
        return HttpResponse.json({
          name: 'link',
          path: 'src/link',
          type: 'symlink',
          target: '../README.md',
          sha: 'symlink101',
        })
      }),
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/README.md*',
        () => {
          return HttpResponse.json({
            name: 'README.md',
            path: 'README.md',
            sha: 'abc123',
            size: 100,
            type: 'file',
          })
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="link" path="src/link" />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('link')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('link → README.md')
    })
  })

  it('resolves nested relative paths', async () => {
    // Mock symlink with complex relative path
    server.use(
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/foo/bar/link*',
        () => {
          return HttpResponse.json({
            name: 'link',
            path: 'foo/bar/link',
            type: 'symlink',
            target: '../../src/utils/helper.ts',
            sha: 'symlink202',
          })
        },
      ),
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/src/utils/helper.ts*',
        () => {
          return HttpResponse.json({
            name: 'helper.ts',
            path: 'src/utils/helper.ts',
            sha: 'file456',
            size: 200,
            type: 'file',
          })
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="link" path="foo/bar/link" />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('link')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('link → src/utils/helper.ts')
    })
  })

  it('handles symlink without target property', async () => {
    // Mock symlink response without target
    server.use(
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/invalid-link',
        () => {
          return HttpResponse.json({
            name: 'invalid-link',
            path: 'invalid-link',
            type: 'symlink',
            sha: 'symlink303',
            // No target property
          })
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="invalid-link" path="invalid-link" />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/invalid-link \(broken symlink\)/),
      ).toBeInTheDocument()
    })
  })

  it('ignores . in relative paths', async () => {
    // Mock symlink with ./ in path
    server.use(
      http.get('https://api.github.com/repos/brumm/tako/contents/src/link*', () => {
        return HttpResponse.json({
          name: 'link',
          path: 'src/link',
          type: 'symlink',
          target: './file.ts',
          sha: 'symlink404',
        })
      }),
      http.get(
        'https://api.github.com/repos/brumm/tako/contents/src/file.ts*',
        () => {
          return HttpResponse.json({
            name: 'file.ts',
            path: 'src/file.ts',
            sha: 'file789',
            size: 50,
            type: 'file',
          })
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem level={1} name="link" path="src/link" />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('link')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('link → src/file.ts')
    })
  })
})
