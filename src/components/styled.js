import styled from 'styled-components'

export const Table = styled.div(({ singleColumn }) => ({
  display: 'grid',
  gridTemplateColumns: singleColumn
    ? '1fr'
    : 'minmax(300px, auto) minmax(0, 1fr) 150px',
  gridAutoRows: 37,
  width: singleColumn && 300,
  position: 'relative',
}))

export const Cell = styled.div(({ alignRight }) => ({
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  justifyContent: alignRight ? 'flex-end' : 'flex-start',

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
}))

export const Row = styled.div(({ highlighted }) => ({
  display: 'contents',
  [`&:hover ${Cell}`]: {
    backgroundColor: '#F6F8FA',
  },

  [`& + & ${Cell}`]: {
    borderTop: '1px solid #EAECEF',
  },

  [Cell]: highlighted && {
    backgroundColor: '#F1F8FF !important',
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

export const FullScreenCenter = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})
