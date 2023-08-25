import { storage } from 'webextension-polyfill'
import { TakoLogo } from './Tako'

export const TokenPrompt = ({ invalidToken }) => {
  return (
    <form
      className="p-3 d-flex"
      onSubmit={async (event) => {
        event.preventDefault()
        const token = new FormData(event.target as HTMLFormElement).get('token')
        await storage.sync.set({ token })
        window.location.reload()
      }}
    >
      <TakoLogo />
      <div className='flex-1'>
        <div className="pb-2">
          {invalidToken ? (
            <span style={{ color: "var(--color-danger-fg)" }}>
              Your token seems invalid or expired.{" "}
            </span>
          ) : (
            <span>
              Tako needs a <b>personal acccess token</b> to work.{" "}
            </span>
          )}
          <a
            href={`https://github.com/settings/tokens/new?description=tako&scopes=repo`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Generate {invalidToken && "a new"} one!
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
            <button
              type="submit"
              data-view-component="true"
              className="js-add-new-user btn"
            >
              Set Token
            </button>
          </span>
        </div>
      </div>
    </form>
  )
}
