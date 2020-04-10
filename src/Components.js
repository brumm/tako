import React from 'react'

export const TakoLogo = ({ style, ...rest }) => (
    <div
      {...rest}
      style={{
        width: 60,
        height: 60,
        backgroundImage: `url(${chrome.runtime.getURL('tako.svg')})`,
        backgroundSize: '90%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: '#fff',
        borderRadius: '50%',
        boxShadow: '0 0 0 5px white',
        ...style,
      }}
    />
  )
