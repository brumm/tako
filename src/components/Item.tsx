import clsx from 'clsx'
import { JSX, ReactNode, createElement, useEffect, useState } from 'react'

import { useRepoContentsQuery } from '../hooks/useRepoContentsQuery'
import { useStore } from '../store'
import { Contents } from './Contents'
import { LatestCommitInfo } from './LatestCommitInfo'
import { useRawFile } from './Preview'
import { useTako } from './Tako'

type ItemProps = {
  level: number
  name: string
  path: string
}

export const DirItem = ({ level, name, path }: ItemProps) => {
  const tako = useTako()
  const onHoverFile = useStore((state) => state.onHoverFile)
  const isHovering = useStore(
    (state) =>
      state.hoveredFile?.path === path &&
      state.hoveredFile.repository === tako.repository,
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const dirContentsQuery = useRepoContentsQuery(path, {
    enabled: isHovering,
  })
  const isLoadingDirContents = useDeferredLoading(dirContentsQuery.isLoading)

  return (
    <>
      <Row
        level={level}
        active={isHovering}
        onPointerEnter={() =>
          onHoverFile({ path, repository: tako.repository })
        }
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          role="gridcell"
          className="mr-1 flex-shrink-0 d-flex flex-items-center"
          style={{ width: 16 }}
        >
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </div>
        <div
          role="gridcell"
          className="mr-3 flex-shrink-0 d-flex flex-items-center"
          style={{ width: 16 }}
        >
          {isExpanded ? (
            isLoadingDirContents ? (
              <LoadingSpinnerIcon />
            ) : (
              <DirectoryOpenIcon />
            )
          ) : (
            <DirectoryClosedIcon />
          )}
        </div>
        <div role="rowheader" className="flex-auto min-width-0 col-md-2 mr-3">
          <span className="css-truncate css-truncate-target d-block width-fit">
            <Link
              path={path}
              type="tree"
              className="Link--primary cursor-pointer"
              title={name}
            >
              {name}
            </Link>
          </span>
        </div>

        <LatestCommitInfo path={path} />
      </Row>

      {isExpanded && <Contents path={path} level={level + 1} />}
    </>
  )
}

export const FileItem = ({
  level,
  name,
  path,
  sha,
}: ItemProps & { sha: string }) => {
  const tako = useTako()
  const onHover = useStore((state) => state.onHoverFile)
  const onPreviewFile = useStore((state) => state.onPreviewFile)
  const isPreviewedFile = useStore(
    (state) => state.previewedFile?.path === path,
  )
  const isHovering = useStore(
    (state) =>
      state.hoveredFile?.path === path &&
      state.hoveredFile.repository === tako.repository,
  )
  const previewFile = { path, sha, repository: tako.repository }
  useRawFile(
    { file: previewFile },
    {
      enabled: isHovering,
    },
  )
  return (
    <Row
      level={level}
      active={isHovering || isPreviewedFile}
      onPointerEnter={() => onHover({ path, repository: tako.repository })}
      onClick={() => {
        if (isPreviewedFile) {
          onPreviewFile(null)
        } else {
          onPreviewFile(previewFile)
        }
      }}
    >
      <div
        role="gridcell"
        className="mr-1 flex-shrink-0 d-flex flex-items-center"
        style={{ width: 16 }}
      />

      <div
        role="gridcell"
        className="mr-3 flex-shrink-0 d-flex flex-items-center"
        style={{ width: 16 }}
      >
        <FileIcon />
      </div>

      <div role="rowheader" className="flex-auto min-width-0 col-md-2 mr-3">
        <span className="css-truncate css-truncate-target d-block width-fit">
          <Link
            path={path}
            type="blob"
            className={clsx('cursor-pointer', {
              'Link--primary': !isPreviewedFile,
            })}
            title={name}
          >
            {name}
          </Link>
        </span>
      </div>

      <LatestCommitInfo path={path} />
    </Row>
  )
}

export const SubmoduleItem = ({ level, name, path }: ItemProps) => {
  const tako = useTako()
  const onHoverFile = useStore((state) => state.onHoverFile)
  const isHovering = useStore(
    (state) =>
      state.hoveredFile?.path === path &&
      state.hoveredFile.repository === tako.repository,
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const query = useRepoContentsQuery(path, {
    enabled: isHovering,
  })
  const isLoading = useDeferredLoading(query.isLoading)
  return (
    <>
      <Row
        level={level}
        active={isHovering}
        onPointerEnter={() =>
          onHoverFile({ path, repository: tako.repository })
        }
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          role="gridcell"
          className="mr-1 flex-shrink-0 d-flex flex-items-center"
          style={{ width: 16 }}
        >
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
        </div>
        <div
          role="gridcell"
          className="mr-3 flex-shrink-0 d-flex flex-items-center"
          style={{ width: 16 }}
        >
          {isExpanded ? (
            isLoading ? (
              <LoadingSpinnerIcon />
            ) : (
              <SubmoduleIcon />
            )
          ) : (
            <SubmoduleIcon />
          )}
        </div>
        <div role="rowheader" className="flex-auto min-width-0 col-md-2 mr-3">
          <span className="css-truncate css-truncate-target d-block width-fit">
            <Link
              path={path}
              type="tree"
              className="cursor-pointer"
              title={name}
            >
              {name}
            </Link>
          </span>
        </div>

        <LatestCommitInfo path={path} />
      </Row>

      {isExpanded && <Contents path={path} level={level + 1} />}
    </>
  )
}

export const SymlinkItem = (_props: ItemProps) => {
  return 'SymlinkItem'
}

const Row = ({
  level,
  active: isActive,
  children,
  ...props
}: {
  level: number
  active: boolean
  children: ReactNode
} & JSX.IntrinsicElements['div']) => {
  return (
    <div
      role="row"
      className={clsx(
        'Box-row Box-row--focus-gray py-2 d-flex position-relative',
        {
          'navigation-focus': isActive,
        },
      )}
      style={{
        paddingLeft: `calc(${level} * var(--primer-stack-padding-normal, 16px))`,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

const FileIcon = () => (
  <svg
    aria-label="File"
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    className="octicon octicon-file color-fg-muted"
  >
    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path>
  </svg>
)

const DirectoryOpenIcon = () => (
  <svg
    aria-label="Directory"
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    className="octicon octicon-file-directory-open-fill hx_color-icon-directory"
  >
    <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 0 0 .2.1H13a1 1 0 0 1 1 1v.5H2.75a.75.75 0 0 0 0 1.5h11.978a1 1 0 0 1 .994 1.117L15 13.25A1.75 1.75 0 0 1 13.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75c0-.464.184-.91.513-1.237Z"></path>
  </svg>
)

const DirectoryClosedIcon = () => (
  <svg
    aria-label="Directory"
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    className="octicon octicon-file-directory-fill hx_color-icon-directory"
  >
    <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"></path>
  </svg>
)

const SubmoduleIcon = () => (
  <svg
    aria-label="Submodule"
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    data-view-component="true"
    className="octicon octicon-file-submodule hx_color-icon-directory"
  >
    <path d="M0 2.75C0 1.784.784 1 1.75 1H5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 0 0 .2.1h6.75c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm9.42 9.36 2.883-2.677a.25.25 0 0 0 0-.366L9.42 6.39a.249.249 0 0 0-.42.183V8.5H4.75a.75.75 0 0 0 0 1.5H9v1.927c0 .218.26.331.42.183Z"></path>
  </svg>
)

const ChevronRightIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="img"
    className="octicon octicon-chevron-right"
    viewBox="0 0 12 12"
    width="12"
    height="12"
    fill="currentColor"
  >
    <path d="M4.7 10c-.2 0-.4-.1-.5-.2-.3-.3-.3-.8 0-1.1L6.9 6 4.2 3.3c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0l3.3 3.2c.3.3.3.8 0 1.1L5.3 9.7c-.2.2-.4.3-.6.3Z"></path>
  </svg>
)

const ChevronDownIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="img"
    className="octicon octicon-chevron-down"
    viewBox="0 0 12 12"
    width="12"
    height="12"
    fill="currentColor"
  >
    <path d="M6 8.825c-.2 0-.4-.1-.5-.2l-3.3-3.3c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0l2.7 2.7 2.7-2.7c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1l-3.2 3.2c-.2.2-.4.3-.6.3Z"></path>
  </svg>
)

const LoadingSpinnerIcon = () => (
  <svg
    // style="box-sizing: content-box; color: var(--color-icon-primary);"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    data-view-component="true"
    className="anim-rotate"
  >
    <circle
      cx="8"
      cy="8"
      r="7"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    ></circle>
    <path
      d="M15 8a7.002 7.002 0 00-7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    ></path>
  </svg>
)

const Link = ({
  path,
  type,
  ...props
}: {
  type: 'blob' | 'tree'
  path: string
} & JSX.IntrinsicElements['a']) => {
  const tako = useTako()
  const href = `/${tako.repository.owner}/${tako.repository.repo}/${type}/${tako.repository.ref}/${path}`
  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const shouldStopPropagation =
      event.nativeEvent.metaKey || event.nativeEvent.ctrlKey
    if (shouldStopPropagation) {
      event.stopPropagation()
    } else {
      event.preventDefault()
    }
  }
  return createElement('a', { ...props, href, onClick })
}

const useDeferredLoading = (isLoading: boolean, delay = 500) => {
  const [deferredIsLoading, setDeferredIsLoading] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      return setDeferredIsLoading(false)
    }

    const timeoutId = setTimeout(() => setDeferredIsLoading(true), delay)
    return () => clearTimeout(timeoutId)
  }, [isLoading, delay])

  return deferredIsLoading
}
