import React from 'react'

import TakoLogo from '@/components/TakoLogo'

const AskForToken = () => {
  const [token, setToken] = React.useState('')
  const validToken = /\w{40}/.test(token)

  return (
    <div className="bg-yellow-light text-gray-dark p-3 d-flex flex-items-center lh-default">
      <TakoLogo />

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
            chrome.storage.sync.set({ token: token || null })
          }
        }}
      >
        <input
          css={{
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

export default AskForToken
