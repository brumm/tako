import { useQuery } from '@tanstack/react-query'
import { TakoContextProps, useTako } from '../components/Tako'

export const highlightedFileQueryConfig = (
  tako: TakoContextProps,
  { raw, extension }: { raw?: string; extension: string },
) => ({
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
})

export const useHighlightedFile = (
  { raw, extension }: { raw?: string; extension: string },
  config = {},
) => {
  const tako = useTako()
  return useQuery({
    ...highlightedFileQueryConfig(tako, { raw, extension }),
    ...config,
  })
}
