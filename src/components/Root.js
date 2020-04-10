import React from 'react'

import { MOUNT_SELECTOR } from '@/constants'
import { useStore } from '@/storage'
import App from '@/components/App'
import PrependPortal from '@/components/PrependPortal'
import AskForToken from '@/components/AskForToken'

const Root = () => {
  const token = useStore(state => state.token)

  return (
    <PrependPortal targetSelector={MOUNT_SELECTOR}>
      {token ? <App /> : <AskForToken />}
    </PrependPortal>
  )
}

export default Root
