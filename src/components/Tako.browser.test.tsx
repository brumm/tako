import { Octokit } from '@octokit/rest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { Tako, TakoProvider } from './Tako'

describe('Tako (Browser)', () => {
  it('renders in real browser with working DOM APIs', async () => {
    const octokit = new Octokit()

    render(
      <TakoProvider
        client={octokit}
        repository={{ owner: 'brumm', repo: 'tako', ref: 'main' }}
      >
        <Tako />
      </TakoProvider>,
    )

    await screen.findByText('README.md')

    expect(window.innerWidth).toBeGreaterThan(0)
    expect(document.querySelector('.tako')).toBeTruthy()

    const readmeLink = screen.getByText('README.md')
    expect(readmeLink).toBeVisible()
  })

  it('handles user interactions in real browser', async () => {
    const octokit = new Octokit()

    const { unmount } = render(
      <TakoProvider
        client={octokit}
        repository={{ owner: 'brumm', repo: 'tako', ref: 'main' }}
      >
        <Tako />
      </TakoProvider>,
    )

    const readmeLink = await screen.findByText('README.md')

    expect(
      document.querySelector('.position-absolute.top-0.right-0'),
    ).not.toBeInTheDocument()

    await userEvent.click(readmeLink)

    expect(await screen.findByText('Tako')).toBeInTheDocument()
    expect(screen.getByText('Test README content')).toBeInTheDocument()

    const closeButton = document.querySelector(
      '.position-absolute.top-0.right-0',
    )
    expect(closeButton).toBeInTheDocument()

    unmount()
  })
})
