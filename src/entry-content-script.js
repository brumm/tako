import '@/import-extension-assets'
import React from 'react'
import { render } from 'react-dom'

import { setState } from '@/storage'
import { getRepoDetails } from '@/utils'
import { APP_MOUNT_SELECTOR, APP_CONTAINER_SELECTOR } from '@/constants'
import Root from '@/components/Root'
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import InvalidTokenErrorBoundary from '@/components/InvalidTokenErrorBoundary'

let retries = 0

const mountExtension = () => {
  console.log({ retries })

  const mount = document.querySelector(APP_MOUNT_SELECTOR)
  if (!mount) {
    if (retries < 10) {
      retries += 1
      setTimeout(mountExtension, 500)
      return
    }

    return
  }

  const previousAppContainer = document.querySelector(APP_CONTAINER_SELECTOR)
  if (previousAppContainer) {
    previousAppContainer.remove()
  }

  chrome.storage.sync.get('token', ({ token = null }) => {
    setState(state => {
      state.token = token
      state.repoDetails = getRepoDetails()
      state.initialTableHeight = mount.offsetHeight
    })

    render(
      <GlobalErrorBoundary>
        <InvalidTokenErrorBoundary>
          <Root />
        </InvalidTokenErrorBoundary>
      </GlobalErrorBoundary>,
      mount
    )
  })
}

mountExtension()

document.addEventListener('pjax:end', mountExtension)
