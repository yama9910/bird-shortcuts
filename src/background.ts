import { type ActionSlot, DEFAULT_CONFIG } from "./config"

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
      message
    });
  } catch {
    // ignore
  }
}

// ---- wiring ----
async function handleCommand(commandId: string) {
  const action = DEFAULT_CONFIG.slots[commandId];
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
  contexts: ["message_display_action"]
});
browser.menus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "run-action-1") await handleCommand("action-1");
});

// 起動時にデフォルト設定を保存（初回のみ）
(async () => {
  await browser.storage.local.set({ config: DEFAULT_CONFIG });
})();
