import React from 'react'
import { ReactQueryCacheProvider } from 'react-query'

import { useStore } from '@/storage'
import { APP_MOUNT_SELECTOR, QUERY_CONFIG } from '@/constants'
import { useHideElementWhileMounted } from '@/hooks'
import RepoFileTree from '@/components/RepoFileTree'
import Preview from '@/components/Preview'
import cache from '@/cache'

const App = () => {
  const selectedFilePath = useStore(state => state.selectedFilePath)
  const initialTableHeight = useStore(state => state.initialTableHeight)
  const hasSelectedFilePath = selectedFilePath !== null
  useHideElementWhileMounted(document.querySelector(APP_MOUNT_SELECTOR))

  return (
    <ReactQueryCacheProvider queryCache={cache}>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: hasSelectedFilePath ? 'auto 1fr' : '1fr',
          gridTemplateAreas: hasSelectedFilePath ? '"tree preview"' : '"tree"',
          minHeight: Math.min(initialTableHeight, window.innerHeight * 0.8),
        }}
      >
        <div css={{ gridArea: 'tree', overflowY: 'auto', maxHeight: '85vh' }}>
          <RepoFileTree />
        </div>

        {hasSelectedFilePath && (
          <div
            css={{
              gridArea: 'preview',
              borderLeft: '1px solid #EAECEF',
              overflowY: 'auto',
              maxHeight: '85vh',
              backgroundColor: '#fff',
            }}
          >
            <Preview path={selectedFilePath} />
          </div>
        )}
      </div>
    </ReactQueryCacheProvider>
  )
}

export default App
