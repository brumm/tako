import './polyfills'
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { githubHandlers } from './mocks/github'
import { queryClient } from '../queryClient'

const server = setupServer(...githubHandlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })

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
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => server.close())
