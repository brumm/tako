import React from 'react'
import { createPortal } from 'react-dom'

const PrependPortal = ({ targetSelector, children }) => {
  const container = React.useRef(document.createElement('div'))

  React.useEffect(() => {
    const containerElement = container.current

    try {
      document
        .querySelector(targetSelector)
        .insertAdjacentElement('beforebegin', containerElement)
    } catch (error) {
      console.log(error)
    }

    return () => {
      containerElement.remove()
    }
  }, [targetSelector])

  return createPortal(children, container.current)
}

export default PrependPortal
