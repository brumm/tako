import '@/import-extension-assets'
import React from 'react'
import { render } from 'react-dom'

import { setState } from '@/storage'
import { getRepoDetails } from '@/utils'
import { APP_MOUNT_SELECTOR, APP_CONTAINER_SELECTOR } from '@/constants'
import Root from '@/components/Root'
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'
import InvalidTokenErrorBoundary from '@/components/InvalidTokenErrorBoundary'

const mountExtension = () =>
  setTimeout(() => {
    const mount = document.querySelector(APP_MOUNT_SELECTOR)
    if (!mount) {
      return
    }

    const previousAppContainer = document.querySelector(APP_CONTAINER_SELECTOR)
    if (previousAppContainer) {
      console.log('removing!')
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
  }, 500)

mountExtension()
document.addEventListener('pjax:end', mountExtension)
