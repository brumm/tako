import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import isBinaryPath from 'is-binary-path'

import clsx from 'clsx'
import { useStore } from '../store'
import { PreviewFile } from '../types'
import { useTako } from './Tako'

const useHighlightedFile = (
  { raw, extension }: { raw?: string; extension: string },
  options: UseQueryOptions = {},
) => {
  const tako = useTako()
  return useQuery(
    ['highlightedFile', tako.repository, raw],
    async () => {
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
    options,
  )
}

const useRawFile = ({ file }: { file: PreviewFile }) => {
  const tako = useTako()
  return useQuery(
    ['file', file],
    async () => {
      const blob = await tako.client.git.getBlob({
        ...file.repository,
        file_sha: file.sha!,
      })

      const raw = betterAtob(blob.data.content)
      return raw
    },
    {
      enabled: !!file,
    },
  )
}

export const Preview = () => {
  const previewedFile = useStore((state) => state.previewedFile)
  const hasPreviewedFile = previewedFile !== null

  if (!hasPreviewedFile) {
    return null
  }

  const isBinary = isBinaryPath(previewedFile.path)

  if (isBinary) {
    const couldBeAnImage = previewedFile.path.match(/\.(png|jpg|jpeg|gif)$/)
    if (couldBeAnImage) {
      return <ImagePreview file={previewedFile} />
    }

    return (
      <div className="border-left d-flex flex-items-center flex-justify-center width-full">
        Can't preview this file
      </div>
    )
  }

  return <TextPreview file={previewedFile} />
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
  let extension = file.path.split('.').pop()
  extension = file.path === extension ? '' : extension || ''

  const rawFileQuery = useRawFile({ file })
  const rawFileIsPresent =
    rawFileQuery.data !== undefined && rawFileQuery.data?.trim() !== ''

  const highlightedFileQuery = useHighlightedFile(
    { raw: rawFileQuery.data, extension },
    {
      enabled: rawFileIsPresent,
    },
  )

  const isMarkdown = extension === 'md'

  const rewriteSrcUrls = (ref: HTMLDivElement | null) => {
    if (!ref) {
      return
    }
    const elements = ref.querySelectorAll('[src]')
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
    return (
      <div
        ref={rewriteSrcUrls}
        dangerouslySetInnerHTML={{ __html: highlightedFileQuery.data ?? '' }}
        className={clsx('p-3 border-left overflow-x-auto', {
          'markdown-body': isMarkdown,
        })}
      />
    )
  }

  return (
    <div className="p-3 border-left overflow-x-auto">
      <pre>{rawFileQuery.data}</pre>
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
