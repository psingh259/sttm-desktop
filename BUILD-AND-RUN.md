# Build and run (macOS)

This project needs **Node 18** for local development and packaging. Newer Node (e.g. 24) breaks `node-sass` on Apple Silicon.

## Prerequisites

- macOS (Apple Silicon or Intel)
- [nvm](https://github.com/nvm-sh/nvm) (Homebrew path below is common on Apple Silicon)
- Xcode Command Line Tools (for native modules when packaging)

## Use Node 18

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 18.18
```

If `18.18` is not installed:

```bash
nvm install 18.18.2
nvm use 18.18.2
```

Confirm:

```bash
node -v   # should be v18.x
npm -v
```

## Install dependencies

From the repo root:

```bash
npm install
```

## Run the app (development)

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 18.18
npm start
```

`npm start` will:

1. Build CSS and JS (`build:local`)
2. Watch SCSS and JS for changes
3. Launch Electron in development mode

## Build assets only

```bash
nvm use 18.18
npm run build-css
npm run build-js
```

## Mac release installer (local, no publish)

### Apple Silicon (arm64)

```bash
export NVM_DIR="$HOME/.nvm"
. "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 18.18

export PYTHON=/usr/bin/python3
export CSC_IDENTITY_AUTO_DISCOVERY=false   # skip code signing for local builds

npm run build-css
npm run build-js

# If electron-builder hangs rebuilding mdns, build it once then pack with rebuild off:
cd node_modules/mdns
npx node-gyp rebuild --target=26.6.10 --arch=arm64 --dist-url=https://electronjs.org/headers
cd ../..

npx electron-builder -c packaging/electron-builder.macArm.yml --mac --arm64 --publish never -c.npmRebuild=false
```

Or use the package script (may try native rebuild):

```bash
npm run pack:macArm
```

### Intel (x64)

```bash
nvm use 18.18
npm run pack:mac
```

### Output

Installers land under:

- `dist/SikhiToTheMax-<version>-mac-arm64.dmg` (arm64 config often uses `dist/`)
- or `builds/` depending on electron-builder config

Open the DMG and drag the app to **Applications**.

Unsigned local builds may need: right-click app → **Open** the first time (Gatekeeper).

## Notarization / signed release

Official signed builds need Apple credentials in the environment (see `notarize.js`):

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

Without these, notarization is skipped. Publishing uses S3 (`dist:mac` / `dist:macArm`) and is for CI/release, not required for a local install DMG.

## OBS overlay after code changes

1. Restart STTM (or ensure the overlay server is running).
2. In OBS → Browser source → **Refresh cache of current page**.

Keep OBS default CSS if you need a transparent overlay:

```css
body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }
```

## Useful scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Dev app + watchers |
| `npm run build` | Production CSS + JS |
| `npm run pack:mac` | Local Intel Mac DMG/zip |
| `npm run pack:macArm` | Local Apple Silicon DMG/zip |
| `npm run dist:mac` / `dist:macArm` | Build and publish (S3) |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `node-sass` “Unsupported architecture / runtime” | Use Node 18 (`nvm use 18.18`), not Node 24 |
| `No module named 'distutils'` during native build | Use system Python: `export PYTHON=/usr/bin/python3` |
| electron-builder hangs on `mdns` rebuild | Rebuild mdns once (see arm64 steps), then `-c.npmRebuild=false` |
| App blocked on open | Right-click → Open; or sign/notarize for distribution |
