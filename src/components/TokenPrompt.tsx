import { storage } from 'webextension-polyfill'

export const TokenPrompt = ({ invalidToken }) => {
  return (
    <form
      className="d-flex flex-items-center gap-3 p-3"
      onSubmit={async (event) => {
        event.preventDefault()
        const token = new FormData(event.target as HTMLFormElement).get('token')
        await storage.sync.set({ token })
        window.location.reload()
      }}
    >
      <img
        src="https://github.com/brumm/tako/blob/master/src/assets/tako.svg?raw=true"
        alt=""
        width={80}
        height={80}
        className="circle color-bg-subtle p-2"
      />

      <div className="flex-1">
        <div className="pb-2">
          {invalidToken ? (
            <span className="color-fg-danger">
              Your token seems invalid or expired.{' '}
            </span>
          ) : (
            <span>
              Tako needs a <b>personal acccess token</b> to work.{' '}
            </span>
          )}
          <a
            href="https://github.com/settings/tokens/new?description=tako&scopes=repo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Generate {invalidToken && 'a new'} one!
          </a>
        </div>

        <div className="input-group">
          <input
            className="form-control"
            type="text"
            name="token"
            placeholder="Your token"
          />
          <span className="input-group-button">
            <button type="submit" className="btn">
              Set Token
            </button>
          </span>
        </div>
      </div>
    </form>
  )
}
