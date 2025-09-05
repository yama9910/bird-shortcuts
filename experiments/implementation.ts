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

	const runRepair = (win: any): boolean => {
		// 既存 UI の「文字化け修復」メニュー項目を優先して叩く
		let elt =
			win.document.getElementById("charsetRepairMenuitem") ||
			win.document
				.getElementById("messageBrowser")
				?.contentDocument?.getElementById("charsetRepairMenuitem");
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
					},
				},
			};
		}
	}

	// biome-ignore lint: global exposure for experiment API cast
	globalThis.birdShortcuts = APIImpl as any;
})();
