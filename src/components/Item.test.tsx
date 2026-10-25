import { Octokit } from '@octokit/rest'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryClient } from '../queryClient'
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
          path="nested/deeper/link"
          virtualPath="nested/deeper/link"
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
