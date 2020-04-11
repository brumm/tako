import React from 'react'

import { MOUNT_SELECTOR } from '@/constants'
import PrependPortal from '@/components/PrependPortal'
import ReEnterOnInvalidToken from '@/components/ReEnterOnInvalidToken'

class InvalidTokenErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    if (error.status === 401) {
      return { error }
    }
  }

  render() {
    const { children } = this.props
    const { error } = this.state

    if (error === null) {
      return children
    }

    return (
      <PrependPortal targetSelector={MOUNT_SELECTOR}>
        <ReEnterOnInvalidToken />
      </PrependPortal>
    )
  }
}

export default InvalidTokenErrorBoundary
