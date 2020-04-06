import React, { Fragment } from 'react'

const CheckerPattern = ({ size = 10, color = '#cccccc' }) => (
  <Fragment>
    <defs>
      <pattern
        id="pattern-checkers"
        x="0"
        y="0"
        width={size * 2}
        height={size * 2}
        patternUnits="userSpaceOnUse"
      >
        <rect x="0" width={size} height={size} y="0" fill={color} />
        <rect x={size} width={size} height={size} y={size} fill={color} />
      </pattern>
    </defs>

    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="url(#pattern-checkers)"
    />
  </Fragment>
)

export default CheckerPattern
