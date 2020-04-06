import styled from 'styled-components'

export const Table = styled.div(
  ({ hasSelectedFilePath, initialTableHeight }) => ({
    flex: 1,
    display: 'grid',
    gridTemplateColumns: hasSelectedFilePath
      ? '1fr'
      : 'minmax(300px, auto) minmax(0, 1fr) 150px',
    gridAutoRows: 37,
    minHeight: Math.min(initialTableHeight, window.innerHeight * 0.8),
    maxHeight: '80vh',
    maxWidth: hasSelectedFilePath && 300,
    overflow: 'auto',
    color: '#6a737d',
    position: 'relative',
  })
)

export const Cell = styled.div({
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  ':nth-child(1)': {
    paddingLeft: 16,
    paddingRight: 4,
  },
  ':nth-child(2)': {
    paddingLeft: 10,
    paddingRight: 4,
  },
  ':nth-child(3)': {
    paddingLeft: 4,
    paddingRight: 16,
  },
})

export const Row = styled.div(({ highlighted }) => ({
  display: 'contents',
  [`&:hover ${Cell}`]: {
    backgroundColor: '#F6F8FA',
  },

  [`& + & ${Cell}`]: {
    borderTop: '1px solid #EAECEF',
  },

  [Cell]: highlighted && {
    backgroundColor: '#F1F8FF',
  },
}))

export const Truncateable = styled.span({
  display: 'inline-block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
})

export const MarkdownContainer = styled.article({
  width: '100%',
  maxHeight: '80vh',
  overflow: 'auto',
})

export const FullScreenCenter = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})
