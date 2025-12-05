import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

const Popup = () => {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load current enabled state
    browser.storage.sync.get('takoEnabled').then((result) => {
      setEnabled(result.takoEnabled !== false) // Default to true
      setLoading(false)
    })
  }, [])

  const handleToggle = async () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)

    // Save to storage
    await browser.storage.sync.set({ takoEnabled: newEnabled })

    // Reload the current tab
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      browser.tabs.reload(tab.id)
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
        <span className="toggle-label">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
          />
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
