import { Octokit } from '@octokit/rest'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tako, TakoProvider } from './Tako'

describe('Tako', () => {
  it('renders TakoProvider with Tako', async () => {
    const octokit = new Octokit()

    render(
      <TakoProvider
        client={octokit}
        repository={{ owner: 'brumm', repo: 'tako', ref: 'main' }}
      >
        <Tako />
      </TakoProvider>,
    )

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    const takoContainer = document.querySelector('.tako')
    expect(takoContainer).toBeInTheDocument()
  })

  it('renders mocked repository contents', async () => {
    const octokit = new Octokit()

    render(
      <TakoProvider
        client={octokit}
        repository={{ owner: 'brumm', repo: 'tako', ref: 'main' }}
      >
        <Tako />
      </TakoProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('README.md')).toBeInTheDocument()
    })

    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getAllByText('test commit')[0]).toBeInTheDocument()
    expect(screen.getByText('brumm')).toBeInTheDocument()
  })
})
