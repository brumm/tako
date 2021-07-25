import React from 'react'
import { QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { useStore } from '@/storage'
import { APP_MOUNT_SELECTOR } from '@/constants'
import { useHideElementWhileMounted } from '@/hooks'
import RepoFileTree from '@/components/RepoFileTree'
import Preview from '@/components/Preview'
import queryClient from '@/queryClient'

const App = () => {
  const selectedFilePath = useStore(state => state.selectedFilePath)
  const initialTableHeight = useStore(state => state.initialTableHeight)
  const hasSelectedFilePath = selectedFilePath !== null
  const element = React.useMemo(
    () => document.querySelector(APP_MOUNT_SELECTOR),
    []
  )
  useHideElementWhileMounted(element)

  return (
    <QueryClientProvider client={queryClient}>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: hasSelectedFilePath ? 'auto 1fr' : '1fr',
          gridTemplateAreas: hasSelectedFilePath ? '"tree preview"' : '"tree"',
          minHeight: Math.min(initialTableHeight, window.innerHeight * 0.8),
        }}
      >
        <div
          css={{
            gridArea: 'tree',
            overflowY: 'auto',
            overflowBehavior: 'contain',
            maxHeight: '85vh',
          }}
        >
          <RepoFileTree />
        </div>

        {hasSelectedFilePath && (
          <div
            ref={element => {
              if (element) {
                element.scrollTop = 0
              }
            }}
            css={{
              gridArea: 'preview',
              borderLeft: '1px solid var(--color-border-primary)',
              overflowY: 'auto',
              overflowBehavior: 'contain',
              maxHeight: '85vh',
            }}
          >
            <Preview path={selectedFilePath} />
          </div>
        )}
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
