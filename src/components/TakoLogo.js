import React from 'react'

const TakoLogo = () => (
  <div
    css={{
      width: 60,
      height: 60,
      backgroundImage: `url(${chrome.runtime.getURL('tako.svg')})`,
      backgroundSize: '90%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundColor: '#fff',
      borderRadius: '50%',
      boxShadow: `
        0 0 0 5px white,
        0 0 0 6px rgba(0, 0, 0, 0.1)
      `,
    }}
  />
)

export default TakoLogo
