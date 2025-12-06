import './polyfills.browser'
import '@testing-library/jest-dom'
import { setupWorker } from 'msw/browser'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { queryClient } from '../queryClient'
import { githubHandlers } from './mocks/github'

const worker = setupWorker(...githubHandlers)

// Filter act warnings - parallel React Query requests trigger these even though
// we're properly using findBy/waitFor. The warnings are false positives.
const originalError = console.error
beforeAll(async () => {
  console.error = (...args: unknown[]) => {
    if (String(args[0]).includes('not wrapped in act')) return
    originalError(...args)
  }

  await worker.start({
    quiet: true,
    onUnhandledRequest: 'warn',
  })

  // Configure queryClient for testing
  queryClient.setDefaultOptions({
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  })
})

afterEach(() => {
  worker.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  worker.stop()
  console.error = originalError
})
