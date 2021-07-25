import React, { Fragment } from 'react'
import useHover from 'react-use-hover'
import { QueryObserver, useQuery } from 'react-query'
import Spinner from 'react-svg-spinner'

import queryClient from '@/queryClient'
import { INDENT_SIZE } from '@/constants'
import { useStore } from '@/storage'
import {
  getNode,
  getLastCommitForNode,
  getFileContent,
  getMarkdown,
} from '@/api'
import { useObserver } from '@/hooks'
import { markAsPrefetch } from '@/utils'
import { Row, Cell, Truncateable } from '@/components/styled'
import Listing from '@/components/Listing'
import Placeholder from '@/components/Placeholder'
import { FolderIcon, FileIcon, ChevronIcon } from '@/components/icons'

const maybeHijackClick = event => {
  // The macOS "command" key
  const macosCmdKey =
    window.navigator.platform.indexOf('Mac') > -1 && event.nativeEvent.metaKey

  if (
    macosCmdKey ||
    event.nativeEvent.ctrlKey ||
    event.nativeEvent.altKey ||
    // middle click
    event.nativeEvent.which === 2
  ) {
    // stop event from bubbling up, where it would otherwise cause expansion or preview
    event.stopPropagation()
  } else {
    // this is the default case, where we
    // prevent browser navigation so we can handle the click further up
    event.preventDefault()
  }
}

const Node = ({ type, name, path, parentCommitmessage, level }) => {
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const isExpanded = useStore(state => state.expandedNodes[path] === true)
  const toggleExpandNode = useStore(state => state.toggleExpandNode)
  const selectedFilePath = useStore(state => state.selectedFilePath)
  const setSelectedFilePath = useStore(state => state.setSelectedFilePath)
  const hasNoSelectedFilePath = selectedFilePath === null

  const isSelected = path === selectedFilePath
  const isFolder = type === 'dir'

  const childListingObserver = React.useMemo(
    () =>
      new QueryObserver(queryClient, {
        queryKey: ['listing', { user, repo, branch, path }],
      }),
    [branch, path, repo, user]
  )

  const isLoadingContents = useObserver(
    childListingObserver,
    ({ isLoading }) => isLoading
  )

  console.log({ isLoadingContents })

  let typeIcon = isFolder ? (
    <FolderIcon
      style={{
        color: 'var(--color-files-explorer-icon)',
        position: 'relative',
        top: 1,
      }}
    />
  ) : (
    <FileIcon
      style={{
        color: 'var(--color-text-tertiary)',
        position: 'relative',
        top: 1,
      }}
    />
  )
  typeIcon =
    isLoadingContents && isExpanded ? (
      <Spinner size="16px" color="var(--color-files-explorer-icon)" />
    ) : (
      typeIcon
    )

  const ExpandoIcon = isFolder ? ChevronIcon : 'div'

  const [isHovering, hoverProps] = useHover()

  const { data: lastCommitData } = useQuery(
    ['last-commit', { user, repo, branch, path }],
    getLastCommitForNode,
    { enabled: hasNoSelectedFilePath }
  )

  React.useEffect(() => {
    if (isHovering) {
      if (isFolder) {
        queryClient
          .prefetchQuery(
            ['listing', { user, repo, branch, path }],
            markAsPrefetch(getNode)
          )
          .then((items = []) => {
            items.forEach(({ path }) =>
              queryClient.prefetchQuery(
                ['last-commit', { user, repo, branch, path }],
                markAsPrefetch(getLastCommitForNode),
                { enabled: hasNoSelectedFilePath }
              )
            )
          })
      } else {
        const fileExtension = path.split('.').slice(-1)[0].toLowerCase()

        if (fileExtension === 'md') {
          queryClient
            .prefetchQuery(
              ['file', { user, repo, branch, path }],
              markAsPrefetch(getFileContent)
            )
            .then(text => {
              queryClient.prefetchQuery(
                ['markdown', { user, repo, text }],
                getMarkdown,
                { enabled: text }
              )
            })
        } else {
          queryClient.prefetchQuery(
            ['file', { user, repo, branch, path }],
            markAsPrefetch(getFileContent)
          )
        }
      }
    }
  }, [isHovering, branch, isFolder, path, repo, user])

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
            gridTemplateColumns: '16px 26px 1fr',
            alignItems: 'center',
          }}
        >
          <ExpandoIcon
            style={{
              color: 'var(--color-files-explorer-icon)',
              position: 'relative',
              left: isExpanded ? -4 : -3,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(90deg)',
            }}
          />

          {typeIcon}

          <Truncateable
            css={{
              marginLeft: 5,
              overflow: selectedFilePath && 'visible',
            }}
          >
            <a
              title={name}
              className="link-gray-dark"
              href={`https://github.com/${user}/${repo}/blob/${branch}/${path}`}
              onClick={maybeHijackClick}
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

              <Cell alignRight style={{ color: 'var(--color-text-tertiary)' }}>
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

              <Cell alignRight>
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

export default Node
