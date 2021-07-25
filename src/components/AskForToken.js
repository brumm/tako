import React, { Fragment } from 'react'

import TakoLogo from '@/components/TakoLogo'

const AskForToken = () => {
  const [token, setToken] = React.useState('')

  return (
    <Fragment>
      <div className="bg-yellow-light text-gray-dark p-3 lh-default">
        <div className="d-flex flex-items-center">
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
        </div>

        <form
          className="mt-3"
          style={{ display: 'flex' }}
          onSubmit={event => {
            event.preventDefault()
            chrome.storage.sync.set({ token: token || null })
          }}
        >
          <input
            css={{
              textAlign: 'left',
              flex: 1,
            }}
            value={token}
            className="form-control input-sm"
            spellCheck="false"
            autoComplete="off"
            type="password"
            placeholder="Personal Access Token"
            onChange={({ target: { value } }) => setToken(value)}
          />
          <button className="ml-2 btn btn-sm btn-primary">Save</button>
        </form>
      </div>
    </Fragment>
  )
}

export default AskForToken
