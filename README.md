# Bird Shortcuts

Thunderbird の標準機能を素早く呼び出す“ショートカット・ハブ”拡張。  
初期状態では **アクション#1 = 文字化け修復（Repair Text Encoding）** を割り当て。  
アクション#2〜#10 は任意の `goDoCommand("...")` を割り当て可能（将来的にオプションUIを提供予定）。

## 特徴

- 🖱️ メッセージ表示ツールバーのボタン（`messageDisplayAction`）
- ⌨️ 10個のショートカット“スロット”（アドオンのショートカット設定でキー変更可）
- 🧩 Experiment API 経由で
  - 文字化け修復（専用 API が無いので UI を橋渡し）
  - 任意の `goDoCommand("cmd_xxx")` 実行
- 🧰 モダン開発環境：TypeScript / pnpm / tsup / Biome / web-ext

## 要件

- Thunderbird 115+（ESRラインを想定）
- Node.js 18+ / pnpm

## セットアップ

```bash
pnpm i
