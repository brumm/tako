import React, { Fragment } from 'react'
import { useQuery } from 'react-query'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useStore } from '@/storage'
import langMap from 'lang-map'
import isBinaryPath from 'is-binary-path'

import { getFileContent, getMarkdown } from '@/api'
import { IMAGE_FILE_EXTENSIONS } from '@/constants'
import { MarkdownContainer, FullScreenCenter } from '@/StyledComponents'
import languages from '@/available-languages-prism'
import Loading from '@/Loading'

const LoadingComponent = () => (
  <FullScreenCenter
    style={{
      flex: 1,
      overflow: 'auto',
      padding: '12px 16px',
      border: 'none',
      borderLeft: '1px solid #EAECEF',
      margin: 0,
      backgroundColor: '#fff',
      maxHeight: '80vh',
      height: 'unset',
    }}
  >
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
    <MarkdownContainer
      className="markdown-body entry-content"
      css={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px',
        border: 'none',
        borderLeft: '1px solid #EAECEF',
        margin: 0,
        backgroundColor: '#fff',
        maxHeight: '80vh',
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

  React.useEffect(
    () => {
      setOverrideLanguage()
    },
    [fileExtension]
  )

  if (status === 'loading') {
    return <LoadingComponent />
  }

  return (
    <SyntaxHighlighter
      language={overrideLanguage || language}
      style={prism}
      customStyle={{
        margin: 0,
        border: 'none',
        padding: '12px 16px',
        backgroundColor: '#fff',
        flex: 1,
        borderLeft: '1px solid #EAECEF',
        overflow: 'auto',
        maxHeight: '80vh',
      }}
      codeTagProps={{
        style: {
          fontFamily: 'monospace',
          fontSize: 'unset',
        },
      }}
      showLineNumbers
      lineNumberContainerProps={{
        style: {
          float: 'left',
          minWidth: 50,
          paddingLeft: 10,
          paddingRight: 10,
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
      <FullScreenCenter
        css={{
          flex: 1,
          overflow: 'auto',
          padding: '12px 16px',
          border: 'none',
          borderLeft: '1px solid #EAECEF',
          margin: 0,
          backgroundColor: '#fff',
          maxHeight: '80vh',
          height: 'unset',
        }}
      >
        <img
          style={{
            maxWidth: '100%',
            display: 'block',
          }}
          src={rawUrl}
          alt=""
        />
      </FullScreenCenter>
    )
  }

  return (
    <FullScreenCenter
      css={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px',
        border: 'none',
        borderLeft: '1px solid #EAECEF',
        margin: 0,
        backgroundColor: '#fff',
        maxHeight: '80vh',
        height: 'unset',
      }}
    >
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
