import React, { Fragment } from 'react'

import { MOUNT_SELECTOR } from '@/constants'
import PrependPortal from '@/PrependPortal'

const ErrorReport = ({ error }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <Fragment>
      <div className="bg-red-light text-red p-2 d-flex flex-items-center">
        <div className="flex-auto">
          Something went wrong while tring to load {process.env.DISPLAY_NAME}
        </div>
        <button
          className="btn btn-sm"
          type="button"
          onClick={() => setIsExpanded(b => !b)}
        >
          Show Details
        </button>
        <button
          className="ml-2 btn btn-sm btn-primary"
          type="button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>

      <div
        hidden={!isExpanded}
        className="text-gray-dark p-2 bg-red-light border-top border-black-fade"
      >
        <pre
          css={{
            '::first-line': {
              fontWeight: 'bold',
              fontSize: 14,
              lineHeight: '30px',
            },
          }}
        >
          {error.stack}
        </pre>
      </div>
    </Fragment>
  )
}

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
        <PrependPortal targetSelector={MOUNT_SELECTOR}>
          <ErrorReport error={error} />
        </PrependPortal>
      )
    }

    return children
  }
}

export default GlobalErrorBoundary
