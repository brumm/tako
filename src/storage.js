import produce from 'immer'
import createStore from 'zustand'
import { queryCache } from 'react-query'

const [useStore, api] = createStore((set, get) => {
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

    setPath: path =>
      setState(state => {
        state.repoDetails.path = path
      }),

    setSelectedFilePath: selectedFilePath => {
      setState(state => {
        if (state.selectedFilePath === selectedFilePath) {
          state.selectedFilePath = null
        } else {
          state.selectedFilePath = selectedFilePath
        }
      })
    },

    toggleExpandNode: id => {
      setState(state => {
        if (state.expandedNodes[id]) {
          delete state.expandedNodes[id]
        } else {
          state.expandedNodes[id] = true
        }
      })
    },
  }
})

const { setState, getState } = api.getState()

window.clearToken = () => {
  chrome.storage.sync.remove('token')
}
window.queryCache = queryCache
window.getState = getState

chrome.storage.onChanged.addListener(({ token: { newValue: token } }) =>
  setState(state => {
    state.token = token
  })
)

export { useStore, setState, getState }
