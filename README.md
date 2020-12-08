<div style="text-align:center;">
  <img width="50%" src="media/logo.png" alt="Tako extension logo" />
</div>

# Tako

Tako is an inline, expandable file tree with file preview for github.

**Supports new Github dark mode!** 🎉

- [Get it on the Chrome Webstore!](https://chrome.google.com/webstore/detail/tako-%E2%80%94-github-file-tree/fdmdpnmffpjdkjaapcbdnkhnidhgoabe)
- [Get it on Firefox Add-ons!](https://addons.mozilla.org/en-US/firefox/addon/tako-github-file-tree/)

![](media/screenshot.png)

## Development

- `git clone`
- `cd tako`
- `yarn install`
- `yarn start`
- [Turn on dev mode for chrome extensions](https://developer.chrome.com/extensions/faq#faq-dev-01)
- Click "Load unpacked" and select `tako/unpacked-extension`
- Navigate to any github repository and open dev tools

## Building

- `yarn build:{chrome,firefox}`
- Drop resulting file `tako-github-file-tree-{chrome,firefox}.zip` onto your browser's extension page
