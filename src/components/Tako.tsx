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

export type TakoContextProps = {
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
  children: React.ReactNode
}) => {
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
  const onClosePreviewFile = useStore(
    (state) => () => state.onPreviewFile(null),
  )

  return (
    <div className="overflow-hidden tako border rounded">
      <QueryClientProvider client={queryClient}>
        <MostRecentRepoCommit />

        <div className="d-flex position-relative" style={{ maxHeight: '80vh' }}>
          <div
            role="grid"
            className={clsx('min-width-0 d-md-block overflow-y-auto', {
              'flex-auto': !hasPreviewedFile,
              'flex-shrink-0': hasPreviewedFile,
            })}
          >
            <Contents />
          </div>

          {hasPreviewedFile && (
            <>
              <Preview />
              <div
                className="position-absolute top-0 right-0 p-2 cursor-pointer"
                onClick={() => onClosePreviewFile()}
              >
                <XCircleIcon />
              </div>
            </>
          )}
        </div>

        <ReactQueryDevtools />
      </QueryClientProvider>
    </div>
  )
}

const XCircleIcon = () => (
  <svg
    className="color-fg-subtle"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M2.343 13.657A8 8 0 1 1 13.658 2.343 8 8 0 0 1 2.343 13.657ZM6.03 4.97a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042L6.94 8 4.97 9.97a.749.749 0 0 0 .326 1.275.749.749 0 0 0 .734-.215L8 9.06l1.97 1.97a.749.749 0 0 0 1.275-.326.749.749 0 0 0-.215-.734L9.06 8l1.97-1.97a.749.749 0 0 0-.326-1.275.749.749 0 0 0-.734.215L8 6.94Z"></path>
  </svg>
)
