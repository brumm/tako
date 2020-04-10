import React, { Fragment } from 'react'

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
        css={{
          maxHeight: 300,
          overflowY: 'auto',
        }}
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

export default ErrorReport
