import { useQuery } from '@tanstack/react-query'
import binaryExtensions from 'binary-extensions'

import { ReactNode } from 'react'
import { useStore } from '../store'
import { PreviewFile } from '../types'
import { useTako } from './Tako'

const useHighlightedFile = (
  { raw, extension }: { raw?: string; extension: string },
  options = {},
) => {
  const tako = useTako()
  return useQuery({
    queryKey: [
      'highlightedFile',
      tako.repository.owner,
      tako.repository.repo,
      raw,
      extension,
    ],
    queryFn: async () => {
      if (extension === 'md') {
        const html = await tako.client.markdown.render({
          text: raw || '',
        })
        return html.data
      }

      const html = await tako.client.markdown.render({
        text: `\`\`\`${extension}\n${raw}\n \`\`\``,
        context: `${tako.repository.owner}/${tako.repository.repo}`,
      })
      return html.data
    },
    ...options,
  })
}

export const useRawFile = ({ file }: { file: PreviewFile }, options = {}) => {
  const tako = useTako()
  return useQuery({
    queryKey: ['file', file],
    queryFn: async () => {
      const blob = await tako.client.git.getBlob({
        ...file.repository,
        file_sha: file.sha!,
      })

      const raw = betterAtob(blob.data.content)
      return raw
    },
    ...options,
  })
}

export const Preview = () => {
  const previewedFile = useStore((state) => state.previewedFile)!
  const fileType = getFileType(previewedFile.path)

  switch (fileType) {
    case 'image': {
      return <ImagePreview file={previewedFile} />
    }
    case 'text': {
      return <TextPreview file={previewedFile} />
    }
    case 'unknown': {
      return (
        <div className="border-left d-flex flex-items-center flex-justify-center width-full">
          Can&apos;t preview this file
        </div>
      )
    }
  }
}

const ImagePreview = ({ file }: { file: PreviewFile }) => {
  const tako = useTako()
  return (
    <div className="p-3 border-left width-full">
      <img
        src={`/${tako.repository.owner}/${tako.repository.repo}/blob/${tako.repository.ref}/${file.path}?raw=true`}
        alt={file.path}
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}

const TextPreview = ({ file }: { file: PreviewFile }) => {
  const tako = useTako()
  const pathSegments = file.path.split('.')
  let extension = ''
  if (pathSegments.length === 1) {
    extension = file.path.split('/').pop()!
  } else {
    extension = pathSegments.pop()!
  }

  const rawFileQuery = useRawFile(
    { file },
    {
      enabled: !!file,
    },
  )
  const rawFileIsPresent =
    rawFileQuery.data !== undefined && rawFileQuery.data?.trim() !== ''

  const highlightedFileQuery = useHighlightedFile(
    { raw: rawFileQuery.data, extension },
    {
      enabled: rawFileIsPresent,
    },
  )

  const isMarkdown = extension === 'md'

  const rewriteSrcUrls = (element: HTMLElement | null) => {
    if (!element) {
      return
    }
    const elements = element.querySelectorAll('[src]')
    for (const element of elements) {
      const src = element.getAttribute('src')
      if (src?.startsWith('http')) {
        continue
      }
      element.setAttribute(
        'src',
        `https://github.com/${tako.repository.owner}/${tako.repository.repo}/raw/${tako.repository.ref}/${src}`,
      )
    }
  }

  if (rawFileQuery.isSuccess && !rawFileIsPresent) {
    return (
      <div className="border-left d-flex flex-items-center flex-justify-center width-full">
        <div className="d-flex flex-column gap-1 flex-items-center color-fg-muted">
          <FileIcon />
          <div>Empty file</div>
        </div>
      </div>
    )
  }

  if (highlightedFileQuery.data) {
    if (isMarkdown) {
      return (
        <div
          ref={rewriteSrcUrls}
          dangerouslySetInnerHTML={{ __html: highlightedFileQuery.data ?? '' }}
          className="overflow-auto markdown-body border-left p-3 width-full"
        />
      )
    }

    return (
      <LineNumbers text={rawFileQuery.data}>
        <div
          ref={rewriteSrcUrls}
          dangerouslySetInnerHTML={{ __html: highlightedFileQuery.data ?? '' }}
        />
      </LineNumbers>
    )
  }

  if (!isMarkdown) {
    return (
      <LineNumbers text={rawFileQuery.data}>
        <pre>{rawFileQuery.data}</pre>
      </LineNumbers>
    )
  }

  return null
}

const LineNumbers = ({
  text = '',
  children,
}: {
  text?: string
  children: ReactNode
}) => {
  const lines = Array.from(
    { length: text.trim().split('\n').length || 0 },
    (_, i) => i + 1,
  )
  return (
    <div className="d-flex border-left p-3 gap-3 overflow-auto width-full">
      <pre className="color-fg-subtle text-right">
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </pre>
      {children}
    </div>
  )
}

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    className="octicon octicon-file"
  >
    <path d="M3 3a2 2 0 0 1 2-2h9.982a2 2 0 0 1 1.414.586l4.018 4.018A2 2 0 0 1 21 7.018V21a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm2-.5a.5.5 0 0 0-.5.5v18a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V8.5h-4a2 2 0 0 1-2-2v-4Zm10 0v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 0-.146-.336l-4.018-4.018A.5.5 0 0 0 15 2.5Z"></path>
  </svg>
)

const betterAtob = (string: string) => {
  try {
    return decodeURIComponent(
      atob(string)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
  } catch {
    return ''
  }
}

const getFileType = (path: string) => {
  // Extract extension using regex (matches last .extension)
  const match = path.match(/\.([^.]+)$/)
  const ext = match?.[1]?.toLowerCase()

  if (ext && binaryExtensions.includes(ext)) {
    if (/\.(png|jpg|jpeg|gif)$/i.test(path)) {
      return 'image' as const
    }
    return 'unknown' as const
  }
  return 'text' as const
}
