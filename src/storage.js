import produce from 'immer'
import createStore from 'zustand'
import { queryCache } from 'react-query'

import { removeToken } from '@/utils'

const useStore = createStore((set, get) => {
  const setState = fn => set(produce(fn))

  return {
    getState: get,
    setState,
    repoDetails: {
      user: '',
      repo: '',
      branch: '',
      path: '',
    },

    selectedFilePath: null,
    token: null,
    expandedNodes: {},

    setPath: path => {
      setState(state => {
        state.repoDetails.path = path
      })
    },

    setSelectedFilePath: selectedFilePath => {
      setState(state => {
        if (state.selectedFilePath === selectedFilePath) {
          state.selectedFilePath = null
        } else {
          state.selectedFilePath = selectedFilePath
        }
      })
    },

    toggleExpandNode: path => {
      setState(state => {
        if (state.expandedNodes[path]) {
          delete state.expandedNodes[path]
        } else {
          state.expandedNodes[path] = true
        }
      })
    },
  }
})

const { setState, getState } = useStore.getState()

window.removeToken = () => removeToken()
window.queryCache = queryCache
window.getState = getState

chrome.storage.onChanged.addListener(({ token: { newValue: token = null } }) =>
  setState(state => {
    state.token = token
  })
)

export { useStore, setState, getState }
