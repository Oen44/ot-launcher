# About

Launcher with built-in updater for (but not limited to) OTClient.

## Requirements

- Node.js 20+
- Cloudflare domain
- Cloudflare R2 bucket
- [OT Launcher API](https://github.com/Oen44/ot-launcher-api)

## Configuration

Rename `launcher-config.json.default` to `launcher-config.json` and fill fields with own links.

Use [OT Launcher Uploader](https://github.com/Oen44/ot-launcher-uploader) for easier client files management.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
