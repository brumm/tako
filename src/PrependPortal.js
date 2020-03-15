import React from 'react'
import { createPortal } from 'react-dom'

const PrependPortal = ({ targetSelector, children }) => {
  const root = React.useRef(
    document.querySelector(targetSelector).closest('.Box.mb-3.Box--condensed')
  )
  const container = React.useRef(document.createElement('div'))

  React.useEffect(
    () => {
      const containerElement = container.current
      const rootElement = root.current

      try {
        rootElement.insertBefore(
          containerElement,
          document.querySelector(targetSelector)
        )
      } catch (error) {
        console.log(error)
        debugger
      }

      return () => {
        rootElement.removeChild(containerElement)
      }
    },
    [targetSelector]
  )

  return createPortal(children, container.current)
}

export default PrependPortal
