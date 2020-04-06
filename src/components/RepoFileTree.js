import React, { Fragment } from 'react'

import { useStore } from '@/storage'
import { Table, Row, Cell } from '@/components/styled'
import Listing from '@/components/Listing'
import Preview from '@/components/Preview'

const RepoFileTree = () => {
  const { user, repo, branch, path } = useStore(state => state.repoDetails)
  const selectedFilePath = useStore(state => state.selectedFilePath)
  const initialTableHeight = useStore(state => state.initialTableHeight)
  const setPath = useStore(state => state.setPath)
  const hasSelectedFilePath = selectedFilePath !== null
  const pathIsAtRoot = path === ''
  const parentPath = path
    .split('/')
    .slice(0, -1)
    .join('/')

  return (
    <div style={{ display: 'flex', marginTop: 1 }}>
      <Table
        hasSelectedFilePath={hasSelectedFilePath}
        initialTableHeight={initialTableHeight}
      >
        {!pathIsAtRoot && (
          <Row>
            <Cell
              style={{
                display: 'inline-grid',
                gridTemplateColumns: '18px 18px 1fr',
                alignItems: 'center',
              }}
            >
              <div
                style={{ gridColumnStart: 3 }}
                onClick={() => setPath(parentPath)}
              >
                <span
                  css={{
                    padding: '3px 6px',
                    marginLeft: -3,
                    borderRadius: 3,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#0366d6',
                    ':hover': {
                      textDecoration: 'underline',
                      backgroundColor: '#dfe2e5',
                    },
                  }}
                >
                  ..
                </span>
              </div>
            </Cell>

            {!hasSelectedFilePath && (
              <Fragment>
                <Cell />
                <Cell />
              </Fragment>
            )}
          </Row>
        )}

        <Listing user={user} repo={repo} branch={branch} path={path} />
      </Table>

      {hasSelectedFilePath && <Preview path={selectedFilePath} />}
    </div>
  )
}

export default RepoFileTree