# Bird Shortcuts Installation Guide (End Users)

This document explains how to download the release artifact and install it into Thunderbird. Target: Thunderbird 115 or later.

## Supported versions

- Thunderbird 115+

## Download

1. Open the [latest releases page](https://github.com/yama9910/bird-shortcuts/releases/latest).
2. From Assets, download `bird-shortcuts-v*.*.*.zip`.

## Installation

Install from Thunderbird's Add-ons Manager.

1. Launch Thunderbird.
2. Open "Add-ons and Themes".
3. Click the gear icon in the top-right and choose "Install Add-on From File…".
4. Select the file you downloaded.
   - You can install directly from the ZIP file.
   - If installation fails, rename the file extension to `.xpi` and try again (e.g., `bird-shortcuts-v*.*.*.zip` → `bird-shortcuts-v*.*.*.xpi`).
5. If a warning appears, review the contents and allow if acceptable.
6. Restart Thunderbird if prompted.

## Usage (overview)

- Message display toolbar button
  - A button is added to the toolbar at the top of the message view.
- Keyboard shortcut (default)
  - Windows/Linux: `Ctrl+Shift+E`
  - macOS: `Command+Shift+E`
- You can view this add-on's settings from `≡` (hamburger menu) > `Add-ons and Themes` > `Extensions` in the left sidebar > this add-on's `Settings` (wrench) button.

## Notes

- This add-on invokes Thunderbird's existing feature. It may not fix all kinds of mojibake (garbled text). See [CAUTION](CAUTION.md) for details.

## Troubleshooting (common cases)

- Button not visible / shortcut not working
  - Make sure a message view is active (3-pane or message window) and try again.
  - Verify the add-on is enabled in "Add-ons and Themes".

---
For more detailed technical information and development steps, see [README](../README.md) or [README.ja](../README.ja.md).