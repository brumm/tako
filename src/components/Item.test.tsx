import { Octokit } from '@octokit/rest'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { queryClient } from '../queryClient'
import { server } from '../test/setup'
import { SymlinkItem } from './Item'
import { TakoProvider } from './Tako'

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
        <SymlinkItem
          level={1}
          name="link-to-file"
          path="link-to-file"
          virtualPath="link-to-file"
        />
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
        <SymlinkItem
          level={1}
          name="link-to-file"
          path="link-to-file"
          virtualPath="link-to-file"
        />
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
        <SymlinkItem
          level={1}
          name="link-to-dir"
          path="link-to-dir"
          virtualPath="link-to-dir"
        />
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
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
        },
      ),
    )

    render(
      <TestWrapper>
        <SymlinkItem
          level={1}
          name="broken-link"
          path="broken-link"
          virtualPath="broken-link"
        />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/broken-link \(broken symlink\)/),
      ).toBeInTheDocument()
    })
  })

  it('resolves relative paths with ../', async () => {
    render(
      <TestWrapper>
        <SymlinkItem
          level={1}
          name="link-with-dotdot"
          path="src/link-with-dotdot"
          virtualPath="src/link-with-dotdot"
        />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('link-with-dotdot')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('link-with-dotdot → README.md')
    })
  })

  it('resolves nested relative paths', async () => {
    render(
      <TestWrapper>
        <SymlinkItem
          level={1}
          name="nested/link"
          path="nested/link"
          virtualPath="nested/link"
        />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('nested/link')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('nested/link → README.md')
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
        <SymlinkItem
          level={1}
          name="invalid-link"
          path="invalid-link"
          virtualPath="invalid-link"
        />
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/invalid-link \(broken symlink\)/),
      ).toBeInTheDocument()
    })
  })

  it('ignores . in relative paths', async () => {
    render(
      <TestWrapper>
        <SymlinkItem
          level={1}
          name="link-with-dot"
          path="link-with-dot"
          virtualPath="link-with-dot"
        />
      </TestWrapper>,
    )

    await waitFor(() => {
      const link = screen.getByText('link-with-dot')
      expect(link).toBeInTheDocument()
      expect(link.getAttribute('title')).toBe('link-with-dot → README.md')
    })
  })
})
