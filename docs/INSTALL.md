# Bird Shortcuts Installation Guide (End Users)

This guide explains how to download the release artifacts and install the extension into Thunderbird. Target: Thunderbird 115 or later.

## Requirements

- Thunderbird 115+ (ESR line assumed)
- Internet access to download from GitHub Releases

## Download

1. Open the repository's GitHub Releases page.
   - From the repository, go to “Releases” and select the latest `vX.Y.Z` tag.
2. From the Assets section, download one of the following:
   - `artifacts/*.zip` (recommended), or
   - the `dist/**/*` bundle (if provided as a folder)

Note: The GitHub workflow (`.github/workflows/release.yml`) attaches both `artifacts/*.zip` and `dist/**/*` to tagged releases.

## Installation (standard)

Install from Thunderbird's Add-ons Manager:

1. Launch Thunderbird.
2. Open “Add-ons and Themes” (Ctrl+Shift+A).
3. Click the gear icon (Settings) and choose “Install Add-on From File…”.
4. Select the downloaded file.
   - In many cases, you can install directly from the ZIP file.
   - If installation fails, rename the file extension to `.xpi` (e.g., `bird-shortcuts-vX.Y.Z.zip` → `bird-shortcuts-vX.Y.Z.xpi`) and try again.
5. If a warning appears, review and allow if acceptable.
6. Restart Thunderbird if prompted.

## Installation (when distributed as a folder)

If you obtained a full `dist/` bundle:

- Instead of selecting an `.xpi`, either use the temporary load method below for debugging, or zip the contents of `dist/` and rename the archive to `.xpi`, then follow the “Installation (standard)” steps.

### Example: Zip → rename to .xpi

1. Zip the contents of the `dist/` directory (files and subfolders inside `dist/`).
2. Rename the resulting ZIP to have the `.xpi` extension.
3. Proceed from step 3 of “Installation (standard)”.

## For developers: temporary load (quick test)

To test without packaging/signing:

1. In Thunderbird, open “Tools” → “Developer Tools” → “Debug Add-ons”.
2. Click “Load Temporary Add-on” (or equivalent) and select `manifest.json` from the `dist/` folder.
3. The add-on is loaded temporarily and will be disabled when Thunderbird restarts.

## Usage (overview)

- Message display toolbar button
  - A button appears in the message view toolbar (`messageDisplayAction`).
  - The default tooltip/title is “Repair Text Encoding”.
- Keyboard shortcut (default)
  - Windows/Linux: `Ctrl+Shift+E`
  - macOS: `Command+Shift+E`
- Action #1 (default)
  - Invokes Thunderbird's built-in “Repair text encoding” command via a bridge.

## Notes and limitations

- This add-on invokes Thunderbird’s existing feature. It may not fix all kinds of mojibake (garbled text). See `docs/CAUTION.md` for details.
- In managed environments, organizational policies or signing requirements may restrict installation. Consult your administrator if needed.

## Troubleshooting (common cases)

- Installation error
  - Rename the ZIP to `.xpi` and try again.
  - Ensure Thunderbird is version 115 or later.
- Button not visible / shortcut not working
  - Ensure a message view is active (3-pane or message window) and try again.
  - Verify the add-on is enabled in “Add-ons and Themes”.

---
For technical details and development workflow, see `README.md`. 
