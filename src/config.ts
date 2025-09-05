/**
 * “スロット”→“アクション”の初期割り当て。
 * ここは storage に同期され、ユーザーが後から変更可能（将来はオプションUIで編集）。
 *
 * アクションの種類:
 *  - type: "repair"          → 文字化け修復（Experiment: repairActiveMessage）
 *  - type: "command", name   → Thunderbird の goDoCommand("name") を実行（例: "cmd_toggleHeaderMode"）
 */
export type ActionSlot = { type: "repair" } | { type: "command"; name: string };

export type ShortcutConfig = {
	slots: Record<string, ActionSlot>;
};

export const DEFAULT_CONFIG: ShortcutConfig = {
	slots: {
		"action-1": { type: "repair" },
	},
};
