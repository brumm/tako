import React, { Fragment } from 'react'

import { MOUNT_SELECTOR } from '@/constants'
import PrependPortal from '@/PrependPortal'
import { removeToken } from '@/utils'

const ErrorReport = ({ error, children }) => {
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
          {isExpanded ? 'Hide' : 'Show'} Details
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
        // In testing, some errors would flow off screen, allowing `overflowX: scroll` fixed this
        style={{ overflowX: 'scroll' }}
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
          {/**
           * Rendering `String(error)` helped make the error more clear. The stack alone
           * was not providing enough info in some cases (specifically http status 401 errors)
           */}
          {String(error)}
          <br />
          {error.stack}
        </pre>
        {children}
      </div>
    </Fragment>
  )
}

class PromptForNewToken extends React.Component {
  constructor(props) {
    super(props)
    this.error = props.error
    this.handleRemoveToken = this.handleRemoveToken.bind(this)
  }

  handleRemoveToken() {
    removeToken().then(() => window.location.reload())
  }

  render() {
    return this.error ? (
      <ErrorReport error={this.error}>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="btn btn-danger"
            type="button"
            onClick={this.handleRemoveToken}
          >
            Prompt For New Token
          </button>
        </div>
      </ErrorReport>
    ) : (
      <React.Fragment />
    )
  }
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
export { PromptForNewToken }
