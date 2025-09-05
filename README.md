# Bird Shortcuts

A Thunderbird extension that works as a "shortcut hub" to trigger built-in features quickly.
By default, Action #1 is assigned to Repair Text Encoding. Additional actions are planned for future releases.

## Features

- Message display toolbar button (`messageDisplayAction`)
- 1 shortcut "slot" for now (Action #1). Additional slots are planned.
- Via Experiment API
  - Repair Text Encoding (bridges to the UI because there's no dedicated API)
  - Execute arbitrary `goDoCommand("cmd_xxx")`
- Modern dev stack: TypeScript / pnpm / tsup / Biome / web-ext

## Requirements

- Thunderbird 115+ (ESR line assumed)
- Node.js 18+ and pnpm
- WSL2 on Windows (WSLg) or native Linux with GUI

## Development (WSL/Linux only)

This repository now assumes development is done on WSL/Linux only. The dev runner (`scripts/run-webext.mjs`) is simplified to use Linux paths and variables only.

1) Install dependencies
```bash
pnpm i
```

2) Install Thunderbird on WSL (Ubuntu/Debian example)
```bash
sudo apt update
sudo apt install -y thunderbird
```

3) Start Thunderbird once to create a profile
```bash
thunderbird
```
Then close it.

4) Locate your profile path
- Check `~/.thunderbird/profiles.ini` and find the `Path=` line, or
- Search for `prefs.js` (the profile directory contains this file):
```bash
find ~/.thunderbird -maxdepth 3 -type f -name prefs.js -printf "%h\n"
```

5) Create `.env.tb` at the project root
```bash
# .env.tb
TB_PATH=/usr/bin/thunderbird
TB_PROFILE=/home/<your-user>/.thunderbird/<your-profile>
TB_ARGS=-no-remote -foreground
```
Notes:
- `TB_ARGS` keeps Thunderbird in the foreground and prevents reusing an existing instance, which is recommended in development.
- Only `TB_PATH` and `TB_PROFILE` are used. Windows-specific variables are no longer supported.

6) Run in development
```bash
pnpm run dev
```
This builds to `dist/` and launches Thunderbird with the extension via `web-ext run`.

## TB_ARGS reference

`TB_ARGS` is appended to `web-ext run` using `--args=...` and passed through to Thunderbird. See:
- web-ext command reference (run / --args): https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#command-reference-run
- Thunderbird command-line arguments: https://support.mozilla.org/en-US/kb/command-line-arguments-thunderbird

Common options you may want during development:

| Option | Purpose | When to use | Notes |
|---|---|---|---|
| `-no-remote` | Do not connect to an existing Thunderbird instance | Always during dev to ensure the specified `--firefox-profile` is used | Prevents attaching to a running instance with another profile |
| `-foreground` | Keep Thunderbird in the foreground with logs in the terminal | When you want logs and process lifetime controlled by `web-ext` | Helpful for debugging; without it, process supervision can be flaky |
| `-P` or `-ProfileManager` | Open the Profile Manager UI | To create/select a different profile interactively | Spelled as `-P` or `-ProfileManager` in Thunderbird docs |
| `-profile <path>` | Start with a specific profile directory | Rarely needed because we already set `--firefox-profile` via `TB_PROFILE` | If you use it, ensure it matches `TB_PROFILE` to avoid conflicts |
| `-safe-mode` | Start in Troubleshoot Mode (disable add-ons) | To diagnose conflicts unrelated to this extension | Your extension will be disabled; for debugging core issues |
| `-purgecaches` | Clear startup caches | When suspecting stale caches after heavy changes | Sometimes resolves odd startup issues |

Examples:
```bash
# Default (recommended)
TB_ARGS=-no-remote -foreground

# Open Profile Manager first
TB_ARGS=-no-remote -foreground -ProfileManager

# Clear caches on next start
TB_ARGS=-no-remote -foreground -purgecaches
```

## Scripts

- `pnpm run build:bg` — Bundle `src/background.ts` with tsup (IIFE)
- `pnpm run build:exp` — Type-check experiments and copy `experiments/schema.json`
- `pnpm run build:static` — Copy icons and `src/manifest.json` to `dist/`
- `pnpm run build` — Run all of the above
- `pnpm run dev` — Build then run via `web-ext run` (uses `.env.tb`)
- `pnpm run lint` — Lint with Biome
- `pnpm run format` — Format with Biome

## Project structure

- `src/` — Background script and manifest
- `experiments/` — Experiment API schema and implementation
- `icons/` — Extension icons
- `dist/` — Build output (generated)
- `scripts/run-webext.mjs` — Dev runner for `web-ext run` (Linux-only)

## Troubleshooting

- No GUI on WSL
  - Ensure WSL2 with WSLg on Windows 11. On Windows 10, you need a separate X server (not covered here).
- Profile not found
  - Double-check `TB_PROFILE` points to the directory containing `prefs.js`.
- Using Snap/Flatpak
  - Profiles may live elsewhere, e.g. Snap: `~/snap/thunderbird/common/.thunderbird/...`, Flatpak: `~/.var/app/org.mozilla.Thunderbird/.thunderbird/...`.
- Multiple instances / wrong profile
  - Keep `-no-remote` to avoid attaching to an already running instance.

## License

MIT
