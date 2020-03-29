import React, { Fragment } from 'react'
import { useQuery, queryCache, ReactQueryConfigProvider } from 'react-query'
import Spinner from 'react-svg-spinner'
import useHover from 'react-use-hover'

import { useStore } from '@/storage'
import { MOUNT_SELECTOR, QUERY_CONFIG, INDENT_SIZE } from '@/constants'
import { useQueryState, useIdleCallback } from '@/hooks'
import {
  getNode,
  getLastCommitForNode,
  getFileContent,
  getMarkdown,
} from '@/api'
import { Table, Row, Cell, Truncateable } from '@/StyledComponents'
import Placeholder from '@/Placeholder'
import Loading from '@/Loading'
import Preview from '@/Preview'
import { FolderIcon, FileIcon, ChevronIcon } from '@/Icons'

const Listing = ({ path, parentCommitmessage, level = 0 }) => {
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const { status, data, error } = useQuery(
    ['listing', { user, repo, branch, path }],
    getNode
  )

  useIdleCallback(() => {
    if (data) {
      data.forEach(({ path, type }) => {
        if (type === 'dir') {
          queryCache.prefetchQuery(
            ['listing', { user, repo, branch, path }],
            [{ isPrefetch: true }],
            getNode
          )
        }
      })
    }
  }, [status, branch, data, user, repo])

  if (status === 'loading') {
    if (level === 0) {
      return (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Loading />
        </div>
      )
    }

    return null
  }

  if (status === 'error') {
    console.log(error)
    return error.message
  }

  if (!data) {
    debugger
  }

  return (
    <Fragment>
      {data &&
        data.map(node => (
          <Node
            key={node.path}
            {...node}
            level={level}
            parentCommitmessage={parentCommitmessage}
          />
        ))}
    </Fragment>
  )
}

const Node = ({ type, name, path, parentCommitmessage, level }) => {
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const { status: contentStatus } = useQueryState([
    'listing',
    { user, repo, branch, path },
  ])

  const { data: lastCommitData } = useQuery(
    ['last-commit', { user, repo, branch, path }],
    [{ isPrefetch: true }],
    getLastCommitForNode
  )

  const isExpanded = useStore(state => state.expandedNodes[path] === true)
  const toggleExpandNode = useStore(state => state.toggleExpandNode)
  const selectedFilePath = useStore(state => state.selectedFilePath)
  const setSelectedFilePath = useStore(state => state.setSelectedFilePath)

  const isSelected = path === selectedFilePath
  const isFolder = type === 'dir'
  const isLoadingContents = contentStatus === 'loading'

  let TypeIcon = isFolder ? FolderIcon : FileIcon
  TypeIcon = isLoadingContents && isExpanded ? Spinner : TypeIcon
  const ExpandoIcon = isFolder ? ChevronIcon : 'div'

  const [isHovering, hoverProps] = useHover()

  React.useEffect(
    () => {
      const handle = window.requestIdleCallback(() => {
        if (isHovering) {
          if (isFolder) {
            queryCache
              .prefetchQuery(
                ['listing', { user, repo, branch, path }],
                [{ isPrefetch: true }],
                getNode
              )
              .then(items => {
                items.forEach(({ path }) =>
                  queryCache.prefetchQuery(
                    ['last-commit', { user, repo, branch, path }],
                    [{ isPrefetch: true }],
                    getLastCommitForNode
                  )
                )
              })
          } else {
            const fileExtension = path
              .split('.')
              .slice(-1)[0]
              .toLowerCase()

            if (fileExtension === 'md') {
              queryCache
                .prefetchQuery(
                  ['file', { user, repo, branch, path }],
                  getFileContent
                )
                .then(text => {
                  queryCache.prefetchQuery(
                    text && ['markdown', { user, repo, text }],
                    getMarkdown
                  )
                })
            } else {
              queryCache.prefetchQuery(
                ['file', { user, repo, branch, path }],
                [{ isPrefetch: true }],
                getFileContent
              )
            }
          }
        }
      })

      return () => window.cancelIdleCallback(handle)
    },
    [isHovering, branch, isFolder, path, repo, user]
  )

  return (
    <Fragment>
      <Row highlighted={isSelected}>
        <Cell
          {...hoverProps}
          onClick={event => {
            event.stopPropagation()
            if (isFolder) {
              toggleExpandNode(path)
            } else {
              setSelectedFilePath(path)
            }
          }}
          style={{
            paddingLeft: INDENT_SIZE * level + 10,
            display: 'grid',
            gridTemplateColumns: '18px 18px 1fr',
            alignItems: 'center',
          }}
        >
          <ExpandoIcon
            style={{
              color: '#7D94AE',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(90deg)',
            }}
          />

          <TypeIcon
            style={{ color: '#7D94AE', position: 'relative', top: 1 }}
          />

          <Truncateable
            style={{
              marginLeft: 5,
              overflow: selectedFilePath && 'visible',
            }}
          >
            <a
              title={name}
              href={`https://github.com/${user}/${repo}/blob/${branch}/${path}`}
              onClick={event => {
                if (event.nativeEvent.which !== 2) {
                  event.preventDefault()
                }
              }}
            >
              {name}
            </a>
          </Truncateable>
        </Cell>

        {!selectedFilePath &&
          (lastCommitData ? (
            <Fragment>
              <Cell>
                <Truncateable>
                  <a className="link-gray" href={lastCommitData.url}>
                    {lastCommitData.message}
                  </a>
                </Truncateable>
              </Cell>

              <Cell style={{ justifyContent: 'flex-end' }}>
                <Truncateable>{lastCommitData.date}</Truncateable>
              </Cell>
            </Fragment>
          ) : (
            <Fragment>
              <Cell>
                <Truncateable>
                  <Placeholder
                    text={parentCommitmessage || 'did the foobar with the qux'}
                  />
                </Truncateable>
              </Cell>

              <Cell style={{ justifyContent: 'flex-end' }}>
                <Truncateable>
                  <Placeholder text="2 days ago" />
                </Truncateable>
              </Cell>
            </Fragment>
          ))}
      </Row>

      {isExpanded && (
        <Listing
          path={path}
          level={level + 1}
          parentCommitmessage={lastCommitData && lastCommitData.message}
        />
      )}
    </Fragment>
  )
}

const RepoExplorer = () => {
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

const App = () => {
  React.useEffect(() => {
    document.querySelector(MOUNT_SELECTOR).setAttribute('hidden', '')
    return () => {
      document.querySelector(MOUNT_SELECTOR).removeAttribute('hidden')
    }
  }, [])

  return (
    <ReactQueryConfigProvider config={QUERY_CONFIG}>
      <RepoExplorer />
    </ReactQueryConfigProvider>
  )
}

export default App
