import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'

const Popup = () => {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkRunningState = async () => {
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
        {
          action: 'checkRunning',
        },
      )
      return results || false
    } catch (error) {
      // Content script might not be loaded or tab not valid
      return false
    }
  }

  useEffect(() => {
    checkRunningState().then((isRunning) => {
      setEnabled(isRunning)
      setLoading(false)
    })
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
      // Save enabled state and start Tako
      await browser.storage.sync.set({ takoEnabled: true })
      await browser.tabs.sendMessage(tab.id, { action: 'start' })
    } else {
      // Save disabled state and stop Tako
      await browser.storage.sync.set({ takoEnabled: false })
      await browser.tabs.sendMessage(tab.id, { action: 'stop' })
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="header">🐙 Tako</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">🐙 Tako</div>
      <div className="toggle-container">
        <span className="toggle-label">{enabled ? 'Enabled' : 'Disabled'}</span>
        <label className="toggle">
          <input type="checkbox" checked={enabled} onChange={handleToggle} />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<Popup />)
}
