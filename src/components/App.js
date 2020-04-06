import React from 'react'
import { ReactQueryConfigProvider } from 'react-query'

import { MOUNT_SELECTOR, QUERY_CONFIG } from '@/constants'
import { useHideElementWhileMounted } from '@/hooks'
import RepoFileTree from '@/components/RepoFileTree'

const App = () => {
  useHideElementWhileMounted(document.querySelector(MOUNT_SELECTOR))

  return (
    <ReactQueryConfigProvider config={QUERY_CONFIG}>
      <RepoFileTree />
    </ReactQueryConfigProvider>
  )
}

export default App
