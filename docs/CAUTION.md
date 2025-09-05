# CAUTION: Limitations of Thunderbird’s built‑in “Repair text encoding”

This add-on currently invokes Thunderbird’s existing UI command for repairing garbled text (charset repair), by triggering the menu item `#charsetRepairMenuitem` (or falling back to `goDoCommand("cmd_charsetRepair")`).

During testing with the sample messages under `docs/test-mails/`, we observed that only one pattern was repaired successfully by Thunderbird:

- Works: `docs/test-mails/body_mislabel_utf8_header_sjis.eml`
- Does not repair (in our tests):
  - [docs/test-mails/body_b64_utf8_header_sjis.eml](test-mails/body_b64_utf8_header_sjis.eml)
  - [docs/test-mails/body_html_meta_conflict.eml](test-mails/body_html_meta_conflict.eml)
  - [docs/test-mails/body_iso2022jp_with_cp932_chars.eml](test-mails/body_iso2022jp_with_cp932_chars.eml)
  - [docs/test-mails/body_no_charset_fallback_latin1.eml](test-mails/body_no_charset_fallback_latin1.eml)

This strongly suggests a limitation in Thunderbird’s built‑in repair logic for these specific mislabeling/encoding scenarios, rather than a bug in this add‑on’s dispatch.

## What the add-on does (and does not do)

- The add‑on does:
  - Provide a toolbar button/shortcut that programmatically triggers Thunderbird’s native “Repair text encoding” command.
  - Search for the appropriate menu item across 3‑pane tabs and message windows to ensure it is invoked reliably.
- The add‑on does not:
  - Implement its own decoding heuristics or override Thunderbird’s charset detection/repair engine.
  - Patch message content; it only delegates to the built‑in command.

## Known side effects and errors

- If a message is no longer available (e.g., a local `.eml` was removed), Thunderbird’s internal code may throw (e.g., `NS_ERROR_FILE_NOT_FOUND`). The add‑on now guards `doCommand()` calls and fails safely, but the repair cannot succeed without a valid, loaded message.

## Workarounds and next steps

- Workarounds (manual):
  - Try opening the message in a different view (message window vs. 3‑pane) and then run the repair.
  - Ensure the message is fully loaded and accessible (not deleted/moved, external `.eml` still present).
- Next steps (future development ideas):
  - Implement a custom experimental path that performs content re‑decoding heuristics (outside of Thunderbird’s built‑in command) for known problematic patterns.
  - Add diagnostics to surface why a particular message was not repairable (e.g., missing file, unsupported MIME/charset combination).

If you rely on robust repair for the non‑working patterns above, Thunderbird’s current feature set may be insufficient. Additional logic will be required at the add‑on layer (e.g., custom decoding), which is outside the scope of the current implementation.
