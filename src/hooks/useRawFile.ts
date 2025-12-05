import { useQuery } from '@tanstack/react-query'
import { useTako } from '../components/Tako'
import { PreviewFile } from '../types'

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

export const useRawFile = ({ file }: { file: PreviewFile }, config = {}) => {
  const tako = useTako()
  return useQuery({
    queryKey: ['file', file],
    queryFn: async () => {
      const blob = await tako.client.repos.getContent({
        ...file.repository,
        path: file.path,
      })

      if (Array.isArray(blob.data) === false && blob.data.type === 'file') {
        return betterAtob(blob.data.content)
      } else if (typeof blob.data === 'string') {
        return blob.data
      } else {
        throw new Error('Unknown file content type')
      }
    },
    ...config,
  })
}
