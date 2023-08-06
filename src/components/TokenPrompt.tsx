import { storage } from 'webextension-polyfill'

export const TokenPrompt = () => {
  return (
    <form
      className="p-3 tako"
      onSubmit={async (event) => {
        event.preventDefault()
        const token = new FormData(event.target as HTMLFormElement).get('token')
        await storage.sync.set({ token })
        window.location.reload()
      }}
    >
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
    </form>
  )
}
