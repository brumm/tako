import React, { Fragment } from 'react'

import { APP_MOUNT_SELECTOR } from '@/constants'
import PrependPortal from '@/components/PrependPortal'
import ErrorReport from '@/components/ErrorReport'

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { children } = this.props
    const { error } = this.state

    if (error !== null) {
      return (
        <PrependPortal targetSelector={APP_MOUNT_SELECTOR}>
          <ErrorReport error={error} />
        </PrependPortal>
      )
    }

    return children
  }
}

export default GlobalErrorBoundary
