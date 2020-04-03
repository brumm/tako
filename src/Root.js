import React from 'react'

import { MOUNT_SELECTOR } from '@/constants'
import { useStore } from '@/storage'
import { setToken as setBrowserToken } from '@/utils'
import App from '@/App'
import PrependPortal from '@/PrependPortal'

const AskForToken = () => {
  const [token, setToken] = React.useState('')
  const validToken = /[\da-f]{40}/.test(token)

  return (
    <div className="bg-yellow-light text-gray-dark p-3 d-flex flex-items-center lh-default">
      <div
        style={{
          width: 60,
          height: 60,
          backgroundImage: `url(${chrome.runtime.getURL('tako.svg')})`,
          backgroundSize: '90%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#fff',
          borderRadius: '50%',
          boxShadow: '0 0 0 5px white',
        }}
      />
      <div className="flex-auto pl-3">
        <div>
          {process.env.DISPLAY_NAME} needs a <b>personal access token</b> to
          work.
        </div>
        <a
          href={`https://github.com/settings/tokens/new?description=${process.env.DISPLAY_NAME}&scopes=repo`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Click here to generate a token
        </a>
        , then paste it into the box and hit <b>Save</b>
      </div>
      <form
        onSubmit={event => {
          event.preventDefault()
          if (validToken) {
            setBrowserToken(token);
          }
        }}
      >
        <input
          css={{
            width: '41ch',
            textAlign: 'left',
          }}
          value={token}
          className="form-control input-sm"
          spellCheck="false"
          autoComplete="off"
          size="40"
          maxLength="40"
          pattern="[\da-f]{40}"
          type="password"
          placeholder="Personal Access Token"
          onChange={({ target: { value } }) => setToken(value)}
        />
        <button className="ml-2 btn btn-sm btn-primary" disabled={!validToken}>
          Save
        </button>
      </form>
    </div>
  )
}

const Root = () => {
  const token = useStore(state => state.token)
  /* If I didn't check for keys length, `token` was being passed as truthy, even when empty */
  const tokenExists = token && Object.keys(token).length > 0;

  return (
    <PrependPortal targetSelector={MOUNT_SELECTOR}>
      {!tokenExists && <AskForToken />}
      {tokenExists && <App />}
    </PrependPortal>
  )
}

export default Root
