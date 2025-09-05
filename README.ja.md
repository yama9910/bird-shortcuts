# Bird Shortcuts (日本語)

Thunderbird の標準機能へ、ボタンやキーボードショートカットから素早くアクセスするための拡張です。現在はまず「文字化け修復」を最優先で提供しています（Action #1 に割り当て）。将来的に追加アクションを増やす予定です。

## 機能

- メッセージ表示ツールバーのボタン（`messageDisplayAction`）
- ショートカット「スロット」を1つ提供（Action #1）。今後拡張予定
- Experiment API 経由で以下を提供
  - 文字化け修復（専用APIが無いため UI をブリッジ）
  - 任意の `goDoCommand("cmd_xxx")` を実行
- オプションページ（読み取り専用）: Action #1 に割り当てられたショートカット表示
- 開発スタック: TypeScript / pnpm / tsup / Biome / web-ext

## ドキュメント

- [インストール（英語）](docs/INSTALL.md)
- [インストール（日本語）](docs/INSTALL.ja.md)
- [制限事項 / 注意](docs/CAUTION.md)

詳細なセットアップや使い方はインストールドキュメントをご参照ください（重複を避けるため、本READMEでは概要のみに留めています）。

## 要件

- Thunderbird 115+（ESR想定）
- Node.js 18+ および pnpm
- Windows の場合は WSL2（WSLg）または GUI 付き Linux 環境

## 開発（WSL/Linux 想定）

1) 依存パッケージのインストール
```bash
pnpm i
```

2) Thunderbird のインストール（Ubuntu/Debian 例）
```bash
sudo apt update
sudo apt install -y thunderbird
```

3) 初回起動でプロファイル作成 → 終了
```bash
thunderbird
```

4) プロファイルパスの確認
- `~/.thunderbird/profiles.ini` の `Path=` を確認、または
- `prefs.js` を探索（プロファイルディレクトリに存在）
```bash
find ~/.thunderbird -maxdepth 3 -type f -name prefs.js -printf "%h\n"
```

5) プロジェクト直下に `.env.tb` を作成
```bash
# .env.tb
TB_PATH=/usr/bin/thunderbird
TB_PROFILE=/home/<your-user>/.thunderbird/<your-profile>
TB_ARGS=-no-remote -foreground
```
- `TB_ARGS` は Thunderbird をフォアグラウンドで起動し、既存インスタンスを再利用しないようにします（開発時に推奨）。
- 開発ランナーは `TB_PATH` / `TB_PROFILE` / `TB_ARGS` を使用します（Windows 固有の変数は非対応）。

6) 開発実行
```bash
pnpm run dev
```
`dist/` にビルド後、`web-ext run` で Thunderbird を起動します。

## TB_ARGS の参考
- web-ext run の `--args`: https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#command-reference-run
- Thunderbird のコマンドライン引数: https://support.mozilla.org/en-US/kb/command-line-arguments-thunderbird

例:
```bash
# 推奨（デフォルト）
TB_ARGS=-no-remote -foreground
# プロファイルマネージャを先に開く
TB_ARGS=-no-remote -foreground -ProfileManager
# 次回起動時にキャッシュをクリア
TB_ARGS=-no-remote -foreground -purgecaches
```

## スクリプト

- `pnpm run build:bg` — `src/background.ts` を tsup で IIFE バンドル
- `pnpm run build:exp` — experiments の Type-check と `experiments/schema.json` のコピー
- `pnpm run build:options` — `src/options.ts` を tsup で IIFE バンドル
- `pnpm run build:static` — アイコンと `src/manifest.json`（および存在すれば `options.html`/`options.css`）を `dist/` へコピー
- `pnpm run typecheck` — 拡張本体と experiments の型検査（no emit）
- `pnpm run build` — Type-check を実行後、上記をすべて実行
- `pnpm run dev` — ビルド後、`.env.tb` を用いて `web-ext run` で起動
- `pnpm run lint` — Biome による Lint
- `pnpm run format` — Biome による整形

## プロジェクト構成

- `src/` — バックグラウンドスクリプト、`manifest.json`、オプションページ（`options.html`, `options.ts`, `options.css`）
- `experiments/` — Experiment API のスキーマと実装
- `icons/` — 拡張機能のアイコン
- `dist/` — ビルド成果物（生成物）
- `scripts/run-webext.mjs` — `web-ext run` 用の開発ランナー（Linux向け）
- `docs/` — ドキュメント（インストール手順、注意、テスト用素材）

## トラブルシューティング

- WSL でGUIが出ない
  - Windows 11 の WSL2 + WSLg を利用。Windows 10 の場合は外部 X サーバが必要（本READMEでは非対象）。
- プロファイルが見つからない
  - `TB_PROFILE` が `prefs.js` を含むディレクトリを指しているか確認。
- Snap/Flatpak 利用時
  - プロファイル位置が異なる場合あり（例: Snap: `~/snap/thunderbird/common/.thunderbird/...`、Flatpak: `~/.var/app/org.mozilla.Thunderbird/.thunderbird/...`）。
- 複数インスタンス/誤プロファイルに接続される
  - `-no-remote` を付与して既存インスタンスへ接続しないようにする。

## ライセンス

MIT
