import React from 'react'
import { useQuery } from 'react-query'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useStore } from '@/storage'
import langMap from 'lang-map'
import isBinaryPath from 'is-binary-path'

import { getFileContent, getMarkdown } from '@/api'
import { IMAGE_FILE_EXTENSIONS } from '@/constants'
import { FullScreenCenter } from '@/components/styled'
import Loading from '@/components/Loading'
import CheckerPattern from '@/components/CheckerPattern'

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

  return (
    <div
      className="markdown-body entry-content"
      css={{
        padding: '12px 16px',
      }}
      dangerouslySetInnerHTML={{
        __html: renderedMarkdown,
      }}
    />
  )
}

const CodePreview = ({ path, fileExtension }) => {
  const [overrideLanguage, setOverrideLanguage] = React.useState()
  const [language] = langMap.languages(fileExtension)
  const { user, repo, branch } = useStore(state => state.repoDetails)
  const { status, data } = useQuery(
    ['file', { user, repo, branch, path }],
    getFileContent
  )

  React.useEffect(() => {
    setOverrideLanguage()
  }, [fileExtension])

  if (status === 'loading') {
    return <LoadingComponent />
  }

  return (
    <SyntaxHighlighter
      language={overrideLanguage || language}
      style={prism}
      customStyle={{
        display: 'flex',
        margin: 0,
        padding: '12px 16px',
        textShadow: 'none',
        background: 'none',
      }}
      codeTagProps={{
        style: {
          fontFamily: 'inherit',
          fontSize: 'unset',
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
          fontFamily: 'monospace',
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
          style={{
            position: 'absolute',
            zIndex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <CheckerPattern color="#F6F8FA" />
        </svg>
        <img
          style={{
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
  const fileExtension = path
    .split('.')
    .slice(-1)[0]
    .toLowerCase()

  if (isBinaryPath(path)) {
    return <ImagePreview path={path} fileExtension={fileExtension} />
  }

  if (fileExtension === 'md') {
    return <MarkdownPreview path={path} />
  }

  return <CodePreview path={path} fileExtension={fileExtension} />
}

export default Preview
