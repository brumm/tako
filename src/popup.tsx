import { QueryClientProvider, useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'
import takoIcon from './assets/icon-32.png'
import { queryClient } from './queryClient'

type TokenValidation = {
  valid: boolean
  scopes: string[]
}

const LoadingSpinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="spinner"
  >
    <circle cx="8" cy="8" r="6" opacity="0.25" />
    <path d="M8 2 A6 6 0 0 1 14 8" />
  </svg>
)

const TokenSection = () => {
  const [editingToken, setEditingToken] = useState(false)

  const validateMutation = useMutation({
    mutationFn: async (tokenToValidate: string): Promise<TokenValidation> => {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
        },
      })

      if (!response.ok) {
        return { valid: false, scopes: [] }
      }

      const scopesHeader = response.headers.get('X-OAuth-Scopes')
      const scopes = scopesHeader ? scopesHeader.split(', ') : []
      const hasRequiredScopes =
        scopes.includes('repo') || scopes.includes('public_repo')

      return { valid: hasRequiredScopes, scopes }
    },
  })

  const loadTokenMutation = useMutation({
    mutationFn: async () => {
      const result = await browser.storage.sync.get('token')
      return result.token as string | undefined
    },
    onSuccess: (token) => {
      if (token) {
        validateMutation.mutate(token)
      }
    },
  })

  const saveTokenMutation = useMutation({
    mutationFn: async (newToken: string) => {
      await browser.storage.sync.set({ token: newToken })
      return newToken
    },
    onSuccess: async (newToken) => {
      loadTokenMutation.mutate()
      setEditingToken(false)

      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (tab.id) {
        await browser.tabs.reload(tab.id)
      }
    },
  })

  useEffect(() => {
    loadTokenMutation.mutate()
  }, [])

  const handleSubmitToken = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newToken = formData.get('token') as string
    const trimmedToken = newToken.trim()

    if (trimmedToken) {
      saveTokenMutation.mutate(trimmedToken)
    }
  }

  const maskToken = (token: string) => {
    if (token.length <= 8) return token
    return `${token.slice(0, 4)}...${token.slice(-4)}`
  }

  if (loadTokenMutation.isPending) {
    return null
  }

  const token = loadTokenMutation.data
  const tokenValidation = validateMutation.data

  if (!token) {
    return null
  }

  return (
    <div className="token-section">
      <div className="token-header">GitHub Token</div>
      {editingToken ? (
        <form onSubmit={handleSubmitToken} className="token-edit">
          <input
            type="text"
            name="token"
            defaultValue={token}
            placeholder="Enter new token"
            className="token-input"
            autoFocus
          />
          <div className="token-actions">
            <button type="submit" className="btn-save">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingToken(false)}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="token-display">
          <div className="token-info">
            <code className="token-value">{maskToken(token)}</code>
            <span className="token-status">
              {validateMutation.isPending ? (
                <LoadingSpinner />
              ) : tokenValidation ? (
                tokenValidation.valid ? (
                  <CheckIcon />
                ) : (
                  <XIcon />
                )
              ) : null}
            </span>
          </div>
          <button onClick={() => setEditingToken(true)} className="btn-change">
            Change
          </button>
        </div>
      )}
    </div>
  )
}

const Popup = () => {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  const checkRunningMutation = useMutation({
    mutationFn: async () => {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (!tab.id) return false

        type PopupAction = {
          action: string
        }

        const results = await browser.tabs.sendMessage<PopupAction, boolean>(
          tab.id,
          { action: 'checkRunning' },
        )
        return results || false
      } catch (error) {
        return false
      }
    },
    onSuccess: (isRunning) => {
      setEnabled(isRunning)
    },
  })

  useEffect(() => {
    checkRunningMutation.mutate()
  }, [])

  const handleToggle = async () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)

    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    if (!tab.id) return

    if (newEnabled) {
      await browser.storage.sync.set({ takoEnabled: true })
      await browser.tabs.sendMessage(tab.id, { action: 'start' })
    } else {
      await browser.storage.sync.set({ takoEnabled: false })
      await browser.tabs.sendMessage(tab.id, { action: 'stop' })
    }
  }

  const isChecking = checkRunningMutation.isPending

  return (
    <div className="container">
      <div className="header">
        <img src={takoIcon} alt="Tako" />
        <span>Tako Settings</span>
      </div>
      <label className="toggle-container">
        <span className="toggle-label">
          {isChecking ? 'Checking...' : enabled ? 'Enabled' : 'Disabled'}
        </span>
        <div className="toggle">
          <input
            id="tako-toggle"
            type="checkbox"
            checked={enabled || false}
            onChange={handleToggle}
            disabled={isChecking}
          />
          <span className="slider"></span>
        </div>
      </label>
      <TokenSection />
    </div>
  )
}

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 4L6 11L3 8" />
  </svg>
)

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 4L4 12M4 4l8 8" />
  </svg>
)

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <Popup />
    </QueryClientProvider>,
  )
}
