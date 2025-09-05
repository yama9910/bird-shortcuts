import { type ActionSlot, DEFAULT_CONFIG, type ShortcutConfig } from "./config";

// ---- action runners ----
async function runAction(action: ActionSlot): Promise<boolean> {
	try {
		if (action.type === "repair") {
			// Experiment: 文字化け修復の実行
			// @ts-expect-error injected by experiment
			return await browser.birdShortcuts.repairActiveMessage();
		}
		if (action.type === "command") {
			// Experiment: 任意の goDoCommand("name") を実行
			// @ts-expect-error injected by experiment
			return await browser.birdShortcuts.executeCommand(action.name);
		}
	} catch (e) {
		console.error("[bird-shortcuts] runAction failed:", e);
	}
	return false;
}

async function notify(title: string, message: string) {
	try {
		await browser.notifications.create({
			type: "basic",
			iconUrl: "icons/mouse-pointer-click.svg",
			title,
			message,
		});
	} catch {
		// ignore
	}
}

// ---- config handling ----
let currentConfig: ShortcutConfig = DEFAULT_CONFIG;

function normalizeConfig(raw: Partial<ShortcutConfig> | undefined): ShortcutConfig {
	const incoming = raw ?? ({} as Partial<ShortcutConfig>);
	return {
		...DEFAULT_CONFIG,
		...incoming,
		slots: { ...DEFAULT_CONFIG.slots, ...(incoming.slots ?? {}) },
	};
}

async function loadOrInitConfig(): Promise<ShortcutConfig> {
	const { config } = await browser.storage.local.get("config");
	if (!config) {
		await browser.storage.local.set({ config: DEFAULT_CONFIG });
		return DEFAULT_CONFIG;
	}
	const normalized = normalizeConfig(config as Partial<ShortcutConfig>);
	// 既存データに欠損があれば保存しておく（マイグレーション）
	await browser.storage.local.set({ config: normalized });
	return normalized;
}

async function applyConfigUI(_cfg: ShortcutConfig) {
	console.debug("[bird-shortcuts] applyConfigUI invoked");
	try {
		// 常に有効化し、タイトルとアイコンを設定
		await browser.messageDisplayAction.enable();
		await browser.messageDisplayAction.setTitle({ title: "文字化け修復" });
		await browser.messageDisplayAction.setIcon({ path: "icons/glasses.svg" });
	} catch (e) {
		console.debug("[bird-shortcuts] applyConfigUI failed:", e);
	}
}

// ---- wiring ----
async function handleCommand(commandId: string) {
	const action = currentConfig.slots[commandId];
	if (!action) {
		await notify("Bird Shortcuts", `未割り当てスロット: ${commandId}`);
		return;
	}
	const ok = await runAction(action);
	if (!ok) await notify("Bird Shortcuts", "実行できませんでした。");
}

// ツールバーのクリック → action-1 を呼ぶ（初期値: repair）
browser.messageDisplayAction.onClicked.addListener(async () => {
	await handleCommand("action-1");
});

// キーボードショートカット
browser.commands.onCommand.addListener(async (cmd) => {
	// cmd: "action-1" .. "action-10"
	await handleCommand(cmd);
});

// 右クリック（ボタンのメニュー）
browser.menus.create({
	id: "run-action-1",
	title: "アクション#1を実行",
	contexts: ["message_display_action"],
});
browser.menus.onClicked.addListener(async (info) => {
	if (info.menuItemId === "run-action-1") await handleCommand("action-1");
});

// 起動時に設定をロードし、UIへ適用。
(async () => {
	currentConfig = await loadOrInitConfig();
	await applyConfigUI(currentConfig);
})();

// 設定変更を監視し、UIへ反映
browser.storage.onChanged.addListener(async (changes, area) => {
	if (area !== "local" || !changes.config) return;
	console.debug("[bird-shortcuts] storage.onChanged config:", {
		oldValue: changes.config.oldValue,
		newValue: changes.config.newValue,
	});
	currentConfig = normalizeConfig(changes.config.newValue as Partial<ShortcutConfig>);
	await applyConfigUI(currentConfig);
});
