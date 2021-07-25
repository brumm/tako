import React from 'react'
import Spinner from 'react-svg-spinner'

import useTimeout from 'use-timeout'

const DelayLoadingSpinner = ({ wait = 1000, children }) => {
  const [showChildren, setShowChildren] = React.useState(false)
  useTimeout(() => setShowChildren(true), wait)
  return showChildren ? children : null
}

const Loading = () => (
  <DelayLoadingSpinner>
    <Spinner size="40px" color="var(--color-files-explorer-icon)" />
  </DelayLoadingSpinner>
)

export default Loading
