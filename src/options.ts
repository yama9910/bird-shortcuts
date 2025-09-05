async function renderShortcuts() {
	const valueEl = document.getElementById("shortcutValue");
	if (!valueEl) return;
	try {
		const cmds = await browser.commands.getAll();
		// 現状の機能（エンコーディング自動推定・修正）は action-1 を採用
		const target = cmds.find((c) => c.name === "action-1") ?? cmds[0];
		valueEl.textContent = target?.shortcut ?? "(未割り当て)";
	} catch (e) {
		valueEl.textContent = `ショートカットを取得できませんでした: ${String(e)}`;
	}
}

async function init() {
	await renderShortcuts();
}

void init();
