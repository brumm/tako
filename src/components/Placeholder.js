import React from 'react'

const Placeholder = ({ text, scale = 0.85 }) => {
  const blocks = text
    .replace(/\W/gi, ' ')
    .replace(/\s+/gi, ' ')
    .trim()
    .split(' ')
    .map(({ length }) => length)

  return (
    <div style={{ display: 'flex' }}>
      {blocks.map((width, index) => (
        <div
          key={`${index}-${width}`}
          style={{
            flexShrink: 0,
            width: `calc(1ch * ${width} * ${scale})`,
            height: '1.5ch',
            backgroundColor: '#EAECEF',
            borderRadius: 1,
            marginRight: '0.7ch',
          }}
        />
      ))}
    </div>
  )
}

export default Placeholder
