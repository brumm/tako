import React from 'react'

const Placeholder = ({ text, scale = 0.71, spacing = 0.65 }) => {
  const blocks = text
    .replace(/\W/gi, ' ')
    .replace(/\s+/gi, ' ')
    .trim()
    .split(' ')
    .map(({ length }) => length)

  return (
    <div css={{ display: 'flex' }}>
      {blocks.map((width, index) => (
        <div
          key={`${index}-${width}`}
          style={{
            flexShrink: 0,
            width: `calc(1ch * ${width} * ${scale})`,
            height: '1.5ch',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 1,
            marginRight: `${spacing}ch`,
          }}
        />
      ))}
    </div>
  )
}

export default Placeholder
