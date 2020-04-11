import React from 'react'

export const FolderIcon = props => (
  <svg viewBox="0 0 14 16" width="100%" height="16" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z"
    />
  </svg>
)

export const FileIcon = props => (
  <svg viewBox="0 0 12 16" width="100%" height="16" {...props}>
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"
    />
  </svg>
)

export const ChevronIcon = props => (
  <svg viewBox="0 0 10 16" width="100%" height="16" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10 10l-1.5 1.5L5 7.75 1.5 11.5 0 10l5-5z"
    />
  </svg>
)
