import React, { Fragment } from 'react'
import useHover from 'react-use-hover'
import { useQuery } from 'react-query'
import Spinner from 'react-svg-spinner'

import { INDENT_SIZE } from '@/constants'
import { useStore } from '@/storage'
import { prefetchQuery } from '@/utils'
import { useOtherQuery, useIdleCallback } from '@/hooks'
import {
  getNode,
  getLastCommitForNode,
  getFileContent,
  getMarkdown,
} from '@/api'
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
  const { status: contentStatus } = useOtherQuery([
    'listing',
    { user, repo, branch, path },
  ])

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

  const { data: lastCommitData } = useQuery(
    selectedFilePath === null && ['last-commit', { user, repo, branch, path }],
    [{ isPrefetch: true }],
    getLastCommitForNode
  )

  useIdleCallback(() => {
    if (isHovering) {
      if (isFolder) {
        prefetchQuery(['listing', { user, repo, branch, path }], getNode).then(
          items => {
            items.forEach(({ path }) =>
              prefetchQuery(
                selectedFilePath === null && [
                  'last-commit',
                  { user, repo, branch, path },
                ],
                getLastCommitForNode
              )
            )
          }
        )
      } else {
        const fileExtension = path.split('.').slice(-1)[0].toLowerCase()

        if (fileExtension === 'md') {
          prefetchQuery(
            ['file', { user, repo, branch, path }],
            getFileContent
          ).then(text => {
            prefetchQuery(
              text && ['markdown', { user, repo, text }],
              getMarkdown
            )
          })
        } else {
          prefetchQuery(['file', { user, repo, branch, path }], getFileContent)
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
            css={{
              marginLeft: 5,
              overflow: selectedFilePath && 'visible',
            }}
          >
            <a
              title={name}
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

              <Cell alignRight style={{ color: '#6a737d' }}>
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
