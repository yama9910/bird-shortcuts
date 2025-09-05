/**
 * “スロット”→“アクション”の初期割り当て。
 * ここは storage に同期され、ユーザーが後から変更可能（将来はオプションUIで編集）。
 *
 * アクションの種類:
 *  - type: "repair"          → 文字化け修復（Experiment: repairActiveMessage）
 *  - type: "command", name   → Thunderbird の goDoCommand("name") を実行（例: "cmd_toggleHeaderMode"）
 */
export type ActionSlot =
  | { type: "repair" }
  | { type: "command"; name: string };

export type ShortcutConfig = {
  slots: Record<string, ActionSlot>;
};

export const DEFAULT_CONFIG: ShortcutConfig = {
  slots: {
    "action-1": { type: "repair" },
    // 例: ヘッダー表示切替（仮例、環境に応じて適切な command 名に変えてね）
    "action-2": { type: "command", name: "cmd_toggleHeaderMode" },
    // 必要になったら随時設定
    "action-3": { type: "command", name: "cmd_markAsRead" },
    "action-4": { type: "command", name: "cmd_markAsJunk" },
    "action-5": { type: "command", name: "cmd_viewPageSource" },
    "action-6": { type: "command", name: "cmd_openConversation" },
    "action-7": { type: "command", name: "cmd_forward" },
    "action-8": { type: "command", name: "cmd_reply" },
    "action-9": { type: "command", name: "cmd_print" },
    "action-10": { type: "command", name: "cmd_find" }
  }
};
