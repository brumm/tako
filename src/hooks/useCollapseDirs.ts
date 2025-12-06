import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useEffectEvent } from 'react'
import browser from 'webextension-polyfill'

export const useCollapseDirs = () => {
  const queryClient = useQueryClient()

  const { data: enabled = false } = useQuery({
    queryKey: ['collapseDirs'],
    queryFn: async () => {
      const result = await browser.storage.sync.get('collapseDirs')
      return result.collapseDirs || false
    },
  })

  const handleStorageChange = useEffectEvent(
    (
      changes: { [key: string]: browser.Storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === 'sync' && changes.collapseDirs) {
        queryClient.invalidateQueries({ queryKey: ['collapseDirs'] })
      }
    },
  )

  useEffect(() => {
    browser.storage.onChanged.addListener(handleStorageChange)
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [queryClient])

  return enabled
}
