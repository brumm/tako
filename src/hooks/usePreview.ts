import { useQuery } from '@tanstack/react-query'
import binaryExtensions from 'binary-extensions'
import { useTako } from '../components/Tako'
import { PreviewFile, RepositoryInfo } from '../types'
import { useRawFile } from './useRawFile'

export type Preview =
  | { kind: 'loading' }
  | { kind: 'unknown' }
  | { kind: 'empty' }
  | { kind: 'image'; src: string }
  | { kind: 'markdown'; html: string }
  | { kind: 'code'; text: string; html?: string }

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']

export const usePreview = (file: PreviewFile): Preview => {
  const tako = useTako()
  const extension = getExtension(file.path)
  const isBinary = binaryExtensions.includes(extension.toLowerCase())
  const isMarkdown = extension === 'md'

  const rawFileQuery = useRawFile({ file }, { enabled: !isBinary })
  const text = rawFileQuery.data
  const hasText = text !== undefined && text.trim() !== ''

  const highlightQuery = useQuery({
    queryKey: ['highlightedFile', tako.repository, file.path, text],
    queryFn: async () => {
      if (isMarkdown) {
        const response = await tako.client.markdown.render({ text: text! })
        return rewriteRelativeSrcs(response.data, tako.repository, file.path)
      }
      const response = await tako.client.markdown.render({
        text: `\`\`\`${extension}\n${text}\n \`\`\``,
        context: `${tako.repository.owner}/${tako.repository.repo}`,
      })
      return response.data
    },
    enabled: hasText,
  })

  if (isBinary) {
    return IMAGE_EXTENSIONS.includes(extension.toLowerCase())
      ? {
          kind: 'image',
          src: `/${tako.repository.owner}/${tako.repository.repo}/blob/${tako.repository.ref}/${file.path}?raw=true`,
        }
      : { kind: 'unknown' }
  }
  if (text === undefined) {
    return { kind: 'loading' }
  }
  if (!hasText) {
    return { kind: 'empty' }
  }
  if (isMarkdown) {
    return highlightQuery.data
      ? { kind: 'markdown', html: highlightQuery.data }
      : { kind: 'loading' }
  }
  return { kind: 'code', text, html: highlightQuery.data }
}

// extensionless files (Makefile, Dockerfile) highlight by their name
const getExtension = (path: string) => {
  const fileName = path.split('/').pop()!
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex === -1 ? fileName : fileName.slice(dotIndex + 1)
}

const rawUrl = ({ owner, repo, ref }: RepositoryInfo, path: string) =>
  `https://github.com/${owner}/${repo}/raw/${ref}/${path}`

const rewriteRelativeSrcs = (
  html: string,
  repository: RepositoryInfo,
  path: string,
) => {
  const document = new DOMParser().parseFromString(html, 'text/html')
  const base = rawUrl(repository, path)
  for (const element of document.querySelectorAll('[src]')) {
    const src = element.getAttribute('src')!
    if (!/^[a-z]+:/i.test(src)) {
      element.setAttribute('src', new URL(src, base).href)
    }
  }
  return document.body.innerHTML
}
