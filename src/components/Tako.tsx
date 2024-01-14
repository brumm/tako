import { Octokit } from '@octokit/rest'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import clsx from 'clsx'
import { createContext, useContext, useMemo } from 'react'

import { queryClient } from '../queryClient'
import { useStore } from '../store'
import { RepositoryInfo } from '../types'
import { Contents } from './Contents'
import { MostRecentRepoCommit } from './MostRecentRepoCommit'
import { Preview } from './Preview'

type TakoContextProps = {
  repository: RepositoryInfo
  client: Octokit
}

const TakoContext = createContext<TakoContextProps>({} as TakoContextProps)

export const TakoProvider = ({
  repository,
  client: optionalClient,
  children,
}: {
  repository: RepositoryInfo
  client?: Octokit
} & { children: React.ReactNode }) => {
  const tako = useTako()
  const client = optionalClient || tako.client

  const contextValue = useMemo(
    () => ({ repository, client }),
    [repository, client],
  )
  return (
    <TakoContext.Provider value={contextValue}>{children}</TakoContext.Provider>
  )
}

export const useTako = () => {
  const context = useContext(TakoContext)
  return context
}

export const Tako = () => {
  const hasPreviewedFile = useStore((state) => !!state.previewedFile)

  return (
    <div className="overflow-hidden tako border rounded">
      <QueryClientProvider client={queryClient}>
        <MostRecentRepoCommit />

        <div className="d-flex" style={{ maxHeight: '80vh' }}>
          <div
            role="grid"
            className={clsx('min-width-0 d-md-block overflow-y-auto', {
              'flex-auto': !hasPreviewedFile,
              'flex-shrink-0': hasPreviewedFile,
            })}
          >
            <Contents />
          </div>
          {hasPreviewedFile && <Preview />}
        </div>

        <ReactQueryDevtools />
      </QueryClientProvider>
    </div>
  )
}
