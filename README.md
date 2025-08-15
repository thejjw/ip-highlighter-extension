
# IP Highlighter Extension

Annotates IP addresses on supported web pages with their country codes for quick reference.

This Firefox version is experimental.

## Features

- **Automatic IP annotation:** Detects IP addresses on supported pages and displays their country codes on tooltip at user request.
- **Works on specific sites:** Currently enabled for `https://gall.dcinside.com/*`, `https://mlbpark.donga.com/*`, and `https://namu.wiki/*` (customize in `manifest.json`).
- **Popup UI:** Click the extension icon to access additional features.
- **Context menu integration:** Right-click on supported pages for annotation actions.
- **Privacy-friendly:** All processing is done locally; no data is sent to external servers.

## Installation

1. Download or clone this repository.
2. Go to `about:debugging` (or your browser's equivalent page).
3. Use "Load temporary add-on" and select the manifest file.

**Alternatively, install from the [AMO (addons.mozilla.org)](https://addons.mozilla.org/en-US/firefox/addon/ip-highlighter-extension/)**  
_(Note: The AMO version may not always have the latest updates.)_

## Usage

- Visit a supported page (e.g., gall.dcinside.com, mlbpark.donga.com, or namu.wiki).
- To annotate IP addresses with their country codes, use right-click menu that the extension provides.
- The extension will then highlight and display country codes for the IP addresses.
- (Optional) Click the extension icon for more options or information.

## Customization

- To support more sites, edit the `matches` field in `manifest.json` under `content_scripts`.
- To change icons, replace the files in the `icons/` directory.

## License
See [LICENSE](LICENSE).

## Attribution

This extension uses the [fflate](https://github.com/101arrowz/fflate) project (MIT License) for decompression functionality.

## Author
- Jaewoo Jeon [@thejjw](https://github.com/thejjw)

If you find this extension helpful, consider supporting its development:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-yellow.png)](https://www.buymeacoffee.com/thejjw)
