import browser from 'webextension-polyfill'

// Disable action by default
browser.action.disable()

// Listen for tab updates
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    await updateActionState(tabId, tab.url)
  }
})

// Listen for tab activation
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId)
  if (tab.url) {
    await updateActionState(activeInfo.tabId, tab.url)
  }
})

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'updateActionState' && sender.tab?.id) {
    if (message.enabled) {
      browser.action.enable(sender.tab.id)
    } else {
      browser.action.disable(sender.tab.id)
    }
  }
})

async function updateActionState(tabId: number, url: string) {
  const isGithubRepo = /^https?:\/\/github\.com\/[^/]+\/[^/]+/.test(url)

  if (isGithubRepo) {
    await browser.action.enable(tabId)
  } else {
    await browser.action.disable(tabId)
  }
}
