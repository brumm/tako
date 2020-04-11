import '@/import-extension-assets'
import React from 'react'
import { createRoot } from 'react-dom'

import { setState } from '@/storage'
import { getRepoDetails } from '@/utils'
import { MOUNT_SELECTOR } from '@/constants'
import Root from '@/components/Root'
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import InvalidTokenErrorBoundary from '@/components/InvalidTokenErrorBoundary'

const mountExtension = () => {
  const mount = document.querySelector(MOUNT_SELECTOR)

  if (!mount) {
    return
  }

  chrome.storage.sync.get('token', ({ token = null }) => {
    setState(state => {
      state.token = token
      state.repoDetails = getRepoDetails()
      state.initialTableHeight = mount.offsetHeight
    })

    createRoot(mount).render(
      <GlobalErrorBoundary>
        <InvalidTokenErrorBoundary>
          <Root />
        </InvalidTokenErrorBoundary>
      </GlobalErrorBoundary>
    )
  })
}

document.addEventListener('pjax:complete', () =>
  setTimeout(mountExtension, 500)
)
setTimeout(mountExtension, 500)
