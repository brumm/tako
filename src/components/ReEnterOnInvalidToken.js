import React from 'react'

import TakoLogo from '@/components/TakoLogo'

const ReEnterOnInvalidToken = () => {
  const [token, setToken] = React.useState('')
  const validToken = /[\da-f]{40}/.test(token)

  return (
    <div className="bg-red-light text-red p-3 d-flex flex-items-center lh-default">
      <TakoLogo />
      <div className="flex-auto pl-3">
        <div>
          <b>Woah there!</b> Your token seems invalid or expired.
        </div>
        <a
          href={`https://github.com/settings/tokens/new?description=${process.env.DISPLAY_NAME}&scopes=repo`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Click here to re-generate a token
        </a>
        , then paste it into the box and hit <b>Save</b>
      </div>
      <form
        onSubmit={event => {
          event.preventDefault()
          if (validToken) {
            chrome.storage.sync.set({ token: token || null }, () =>
              window.location.reload()
            )
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

export default ReEnterOnInvalidToken
