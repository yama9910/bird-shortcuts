/// <reference path="./types.d.ts" />
(function () {
	/* global ChromeUtils */
	// 遅延ローダ（ESM優先、古い版はJSM）
	const lazy: any = {};
	if (typeof (ChromeUtils as any).defineESModuleGetters === "function") {
		(ChromeUtils as any).defineESModuleGetters(lazy, {
			ExtensionCommon: "resource://gre/modules/ExtensionCommon.sys.mjs",
			Services: "resource://gre/modules/Services.sys.mjs",
		});
	} else {
		(ChromeUtils as any).defineLazyModuleGetters(lazy, {
			ExtensionCommon: "resource://gre/modules/ExtensionCommon.jsm",
			Services: "resource://gre/modules/Services.jsm",
		});
	}

	function ensureExtensionCommon(): any {
		try {
			return lazy.ExtensionCommon;
		} catch (_e) {
			const mod = (ChromeUtils as any).import("resource://gre/modules/ExtensionCommon.jsm");
			Object.defineProperty(lazy, "ExtensionCommon", {
				value: (mod as any).ExtensionCommon ?? mod,
			});
			return lazy.ExtensionCommon;
		}
	}

	// Services に依存せず、XPCOM で Window Mediator に直接アクセス
	function getWindowMediator(): any {
		// biome-ignore lint: accessing XPCOM Components members in Thunderbird
		return (Components as any).classes["@mozilla.org/appshell/window-mediator;1"].getService(
			// biome-ignore lint: accessing XPCOM Components members in Thunderbird
			(Components as any).interfaces.nsIWindowMediator,
		);
	}

	const getActiveMailWindow = () => {
		const wm = getWindowMediator();
		let w = wm.getMostRecentWindow("mail:3pane");
		if (w && !w.document.hidden) return w;
		w = wm.getMostRecentWindow("mail:messageWindow");
		if (w && !w.document.hidden) return w;
		return null;
	};

	const getAllMailWindows = (): any[] => {
		const wm = getWindowMediator();
		const wins: any[] = [];
		for (const type of ["mail:3pane", "mail:messageWindow"]) {
			// biome-ignore lint: Thunderbird XPCOM enumerator is untyped
			const e: any = wm.getEnumerator(type);
			while (e.hasMoreElements()) {
				// biome-ignore lint: Thunderbird XPCOM window object is untyped
				const w: any = e.getNext();
				if (w && !w.closed) wins.push(w);
			}
		}
		return wins;
	};

	const safeDoCommand = (target: any, label: string): boolean => {
		try {
			if (target && typeof target.doCommand === "function") {
				dbg("safeDoCommand: invoking doCommand on", label);
				target.doCommand();
				return true;
			}
			return false;
		} catch (e) {
			dbg("safeDoCommand: doCommand threw", { label, error: String(e) });
			return false;
		}
	};

	const tryToolbarMenuCommand = (doc: any): boolean => {
		try {
			dbg("tryToolbarMenuCommand: enter", {
				hasDoc: !!doc,
			});
			const toolbar = doc.getElementById("header-view-toolbar");
			if (!toolbar) {
				dbg("tryToolbarMenuCommand: toolbar not found");
				return false;
			}
			const popup = toolbar.querySelector("#otherActionsPopup");
			if (!popup) {
				dbg("tryToolbarMenuCommand: otherActionsPopup not found");
				return false;
			}
			const menuItem = popup.querySelector("#charsetRepairMenuitem");
			if (!menuItem) {
				dbg("tryToolbarMenuCommand: charsetRepairMenuitem not found under popup");
				return false;
			}
			if (safeDoCommand(menuItem, "toolbarPopup.charsetRepairMenuitem")) {
				return true;
			}
			dbg("tryToolbarMenuCommand: menuItem.doCommand not a function or failed");
		} catch (e) {
			dbg("tryToolbarMenuCommand: error", e);
		}
		return false;
	};

	const runRepair = (win: any): boolean => {
		const wtype = win?.document?.documentElement?.getAttribute?.("windowtype");
		dbg("runRepair: start", { windowType: wtype });
		// 既存 UI の「文字化け修復」メニュー項目を優先して叩く
		// 1) ツールバー配下の otherActionsPopup（userChromeJS と同等の経路）
		if (tryToolbarMenuCommand(win.document)) {
			dbg("runRepair: success via toolbar popup in main document");
			return true;
		}
		const msgBrowserDoc = win.document
			.getElementById("messageBrowser")
			?.contentDocument;
		if (msgBrowserDoc) {
			dbg("runRepair: messageBrowser.contentDocument present");
			if (tryToolbarMenuCommand(msgBrowserDoc)) {
				dbg("runRepair: success via toolbar popup in messageBrowser document");
				return true;
			}
		} else {
			dbg("runRepair: messageBrowser.contentDocument not available");
		}

		// 1.5) 3pane の各タブのブラウザ(contentDocument)も探索
		try {
			const browsers = Array.from(
				win.document.querySelectorAll('browser[id*="mailMessageTabBrowser"]'),
			) as any[];
			dbg("runRepair: tab browsers count", browsers.length);
			for (const br of browsers) {
				const brDoc = br?.contentDocument;
				if (!brDoc) {
					dbg("runRepair: browser has no contentDocument yet");
					continue;
				}
				if (tryToolbarMenuCommand(brDoc)) {
					dbg("runRepair: success via toolbar popup in tab browser document");
					return true;
				}
				const inTabItem = brDoc.getElementById("charsetRepairMenuitem");
				if (inTabItem) {
					if (safeDoCommand(inTabItem, "tab.charsetRepairMenuitem")) {
						return true;
					}
				}
			}
		} catch (e) {
			dbg("runRepair: error while scanning tab browsers", e);
		}

		// 2) ドキュメント直下、または messageBrowser 内にメニュー項目があればそれを叩く
		let elt =
			win.document.getElementById("charsetRepairMenuitem") ||
			msgBrowserDoc?.getElementById("charsetRepairMenuitem");
		if (elt) {
			if (safeDoCommand(elt, "docOrMsgBrowser.charsetRepairMenuitem")) {
				return true;
			}
		}
		// フォールバック: goDoCommand
		if (typeof win.goDoCommand === "function") {
			try {
				dbg("runRepair: fallback to goDoCommand('cmd_charsetRepair')");
				win.goDoCommand("cmd_charsetRepair");
				return true;
			} catch (e) {
				dbg("runRepair: goDoCommand threw", String(e));
			}
		}
		dbg("runRepair: all paths failed");
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

	const DEBUG = true;
	function dbg(...args: any[]) {
		if (DEBUG) console.debug("[bird-shortcuts][exp]", ...args);
	}

	class APIImpl extends ((lazy.ExtensionCommon?.ExtensionAPI ??
		ensureExtensionCommon().ExtensionAPI) as any) {
		getAPI(_context: any) {
			return {
				birdShortcuts: {
					async repairActiveMessage(): Promise<boolean> {
						dbg("repairActiveMessage: invoked");
						const win = getActiveMailWindow();
						if (!win) throw new Error("No active mail window");
						const ok = runRepair(win);
						dbg("repairActiveMessage: runRepair result", ok);
						if (!ok) throw new Error("Repair command not available");
						dbg("repairActiveMessage: success");
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
					},
				},
			};
		}
	}

	// biome-ignore lint: global exposure for experiment API cast
	globalThis.birdShortcuts = APIImpl as any;
})();
