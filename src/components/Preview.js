import React, { Fragment } from 'react'
import { useQuery } from 'react-query'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism, darcula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useStore } from '@/storage'
import langMap from 'lang-map'
import isBinaryPath from 'is-binary-path'
import unified from 'unified'
import parse from 'rehype-dom-parse'
import stringify from 'rehype-dom-stringify'
import visit from 'unist-util-visit'

import { getFileContent, getMarkdown } from '@/api'
import {
  IMAGE_FILE_EXTENSIONS,
  TOOLBAR_MOUNT_SELECTOR,
  REPOSITORY_INFO,
  FILE_LIST_LAYOUT_CONTAINER,
} from '@/constants'
import { FullScreenCenter } from '@/components/styled'
import Loading from '@/components/Loading'
import CheckerPattern from '@/components/CheckerPattern'
import { useHideElementWhileMounted } from '@/hooks'
import PrependPortal from '@/components/PrependPortal'

const LoadingComponent = () => (
  <FullScreenCenter>
    <Loading />
  </FullScreenCenter>
)

const MarkdownPreview = ({ path }) => {
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const { data: text } = useQuery(
    ['file', { user, repo, branch, path }],
    getFileContent
  )
  const { status, data: renderedMarkdown } = useQuery(
    text && ['markdown', { user, repo, text }],
    getMarkdown
  )

  if (status === 'loading') {
    return <LoadingComponent />
  }

  const processor = unified()
    .use(parse)
    .use(() => tree =>
      visit(tree, [{ tagName: 'img' }, { tagName: 'a' }], node => {
        switch (node.tagName) {
          case 'img': {
            if (!node.properties.src.match(/https?:\/\//)) {
              node.properties.src = `https://raw.githubusercontent.com/${user}/${repo}/master/${node.properties.src}`
            }

            break
          }

          case 'a': {
            // TODO handle these by scrolling the preview container
            if (node.properties.href.startsWith('#')) {
              break
            }

            if (!node.properties.href.match(/https?:\/\//)) {
              node.properties.href = `https://github.com/${user}/${repo}/blob/master/${node.properties.href}`
            }

            break
          }

          // no default
        }

        return node
      })
    )
    .use(stringify)

  const renderedAndProcessedMarkdown = processor
    .processSync(renderedMarkdown)
    .toString()

  return (
    <div
      className="markdown-body entry-content"
      css={{
        padding: '12px 16px',
      }}
      dangerouslySetInnerHTML={{
        __html: renderedAndProcessedMarkdown,
      }}
    />
  )
}

const getSyntaxTheme = () => {
  switch (document.querySelector('[data-color-mode]')?.dataset.colorMode) {
    case 'dark': {
      return darcula
      break
    }

    case 'auto': {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return darcula
        break
      }
    }

    case 'light':
    default: {
      return prism
    }
  }
}

const CodePreview = ({ path, fileExtension }) => {
  const [syntaxTheme, setSyntaxTheme] = React.useState(getSyntaxTheme)
  const [overrideLanguage, setOverrideLanguage] = React.useState()
  const [language] = langMap.languages(fileExtension)
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const { status, data } = useQuery(
    ['file', { user, repo, branch, path }],
    getFileContent
  )

  React.useEffect(() => {
    const foo = () => {
      setSyntaxTheme(getSyntaxTheme)
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', foo)

    return () =>
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', foo)
  }, [])

  React.useEffect(() => {
    setOverrideLanguage()
  }, [fileExtension])

  if (status === 'loading') {
    return <LoadingComponent />
  }

  return (
    <SyntaxHighlighter
      language={overrideLanguage || language}
      style={syntaxTheme}
      customStyle={{
        display: 'flex',
        margin: 0,
        padding: '12px 16px',
        textShadow: 'none',
        background: 'none',
        fontSize: null,
        fontFamily: null,
      }}
      codeTagProps={{
        style: {
          fontSize: null,
          fontFamily: null,
          paddingRight: 16,
        },
      }}
      showLineNumbers
      lineNumberContainerProps={{
        style: {
          textAlign: 'right',
          userSelect: 'none',
          paddingRight: 8,
        },
      }}
      lineNumberProps={{
        style: {
          fontSize: null,
          fontFamily: null,
          color: 'rgba(27, 31, 35, 0.3)',
        },
      }}
    >
      {data}
    </SyntaxHighlighter>
  )
}

const ImagePreview = ({ path, fileExtension }) => {
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const rawUrl = `https://github.com/${user}/${repo}/blob/${branch}/${path}?raw=true`

  if (IMAGE_FILE_EXTENSIONS.includes(fileExtension)) {
    return (
      <FullScreenCenter css={{ position: 'relative', padding: '12px 16px' }}>
        <svg
          css={{
            position: 'absolute',
            zIndex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <CheckerPattern color="#F6F8FA" />
        </svg>
        <img
          css={{
            maxWidth: '100%',
            display: 'block',
            position: 'relative',
            zIndex: 2,
          }}
          src={rawUrl}
          alt=""
        />
      </FullScreenCenter>
    )
  }

  return (
    <FullScreenCenter>
      <a href={rawUrl}>View raw</a>
    </FullScreenCenter>
  )
}

const Preview = ({ path }) => {
  const setSelectedFilePath = useStore(state => state.setSelectedFilePath)
  const { user, repo, branch } = useStore(state => state.repoDetails)

  useHideElementWhileMounted(document.querySelector(TOOLBAR_MOUNT_SELECTOR))
  useHideElementWhileMounted(document.querySelector(REPOSITORY_INFO))
  const element = document.querySelector(FILE_LIST_LAYOUT_CONTAINER)
  React.useEffect(() => {
    if (element) {
      element.classList.remove('col-md-9')
    }

    return () => {
      if (element) {
        element.classList.add('col-md-9')
      }
    }
  }, [element])

  const fileExtension = path.split('.').slice(-1)[0].toLowerCase()

  let preview = <CodePreview path={path} fileExtension={fileExtension} />

  if (isBinaryPath(path)) {
    preview = <ImagePreview path={path} fileExtension={fileExtension} />
  }

  if (fileExtension === 'md') {
    preview = <MarkdownPreview path={path} />
  }

  return (
    <Fragment>
      <PrependPortal targetSelector={TOOLBAR_MOUNT_SELECTOR}>
        <div style={{ display: 'flex', marginLeft: 16 }}>
          <a
            style={{
              background: 'none',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            className="mr-3 message text-inherit"
            title="Open"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/${user}/${repo}/blob/${branch}/${path}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"
              ></path>
            </svg>
            <span className="ml-1">Open on Github</span>
          </a>

          <button
            style={{
              background: 'none',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            className="message text-inherit"
            onClick={() => {
              setSelectedFilePath(null)
            }}
          >
            <svg height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.036 7.976a.75.75 0 00-1.06 1.06L10.939 12l-2.963 2.963a.75.75 0 101.06 1.06L12 13.06l2.963 2.964a.75.75 0 001.061-1.06L13.061 12l2.963-2.964a.75.75 0 10-1.06-1.06L12 10.939 9.036 7.976z"></path>
              <path
                fillRule="evenodd"
                d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z"
              />
            </svg>
            <span className="ml-1">Close Preview</span>
          </button>
        </div>
      </PrependPortal>

      {preview}
    </Fragment>
  )
}

export default Preview
