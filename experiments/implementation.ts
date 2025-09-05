/* global ChromeUtils */
const { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

const getActiveMailWindow = () => {
  let w = Services.wm.getMostRecentWindow("mail:3pane");
  if (w && !w.document.hidden) return w;
  w = Services.wm.getMostRecentWindow("mail:messageWindow");
  if (w && !w.document.hidden) return w;
  return null;
};

const runRepair = (win: any): boolean => {
  // 既存 UI の「文字化け修復」メニュー項目を優先して叩く
  let elt =
    win.document.getElementById("charsetRepairMenuitem") ||
    win.document.getElementById("messageBrowser")?.contentDocument?.getElementById("charsetRepairMenuitem");
  if (elt && typeof elt.doCommand === "function") {
    elt.doCommand();
    return true;
  }
  // フォールバック: goDoCommand
  if (typeof win.goDoCommand === "function") {
    win.goDoCommand("cmd_charsetRepair");
    return true;
  }
  return false;
};

const runCommand = (win: any, cmd: string): boolean => {
  if (typeof win.goDoCommand === "function") {
    try {
      win.goDoCommand(cmd);
      return true;
    } catch (_) {
      // fallthrough
    }
  }
  return false;
};

class APIImpl extends ExtensionCommon.ExtensionAPI {
  getAPI(_context: unknown) {
    return {
      birdShortcuts: {
        async repairActiveMessage(): Promise<boolean> {
          const win = getActiveMailWindow();
          if (!win) throw new Error("No active mail window");
          const ok = runRepair(win);
          if (!ok) throw new Error("Repair command not available");
          return true;
        },
        async executeCommand(commandName: string): Promise<boolean> {
          if (!commandName || typeof commandName !== "string") {
            throw new Error("commandName must be a non-empty string");
          }
          const win = getActiveMailWindow();
          if (!win) throw new Error("No active mail window");
          const ok = runCommand(win, commandName);
          if (!ok) throw new Error(`Command failed: ${commandName}`);
          return true;
        }
      }
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(this as any).birdShortcuts = APIImpl;
