import React from 'react'
import { useQuery } from 'react-query'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useStore } from '@/storage'
import langMap from 'lang-map'
import isBinaryPath from 'is-binary-path'
import unified from 'unified'
import parse from 'rehype-dom-parse'
import stringify from 'rehype-dom-stringify'
import visit from 'unist-util-visit'

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
