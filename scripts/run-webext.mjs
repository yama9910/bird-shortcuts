import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

let tbPath = process.env.TB_PATH || "thunderbird";
let tbProfile = process.env.TB_PROFILE;

const looksLikeExe =
  tbPath === "thunderbird" ||
  path.basename(tbPath).toLowerCase().includes("thunderbird");

if (tbPath !== "thunderbird") {
  if (!existsSync(tbPath)) {
    console.error(`[bird-shortcuts] Thunderbird executable not found: ${tbPath}`);
    process.exit(1);
  }
  try {
    const st = statSync(tbPath);
    if (!looksLikeExe || !st.isFile()) {
      console.error(
        `[bird-shortcuts] TB_PATH must point to the thunderbird executable. Got: ${tbPath}`
      );
      process.exit(1);
    }
  } catch {}
}

if (tbProfile) {
  if (!existsSync(tbProfile) || !statSync(tbProfile).isDirectory()) {
    console.error(`[bird-shortcuts] Profile directory not found: ${tbProfile}`);
    process.exit(1);
  }
}

// ログ（起動前に見えるように）
console.log(`[bird-shortcuts] thunderbird: ${tbPath}`);
if (tbProfile) console.log(`[bird-shortcuts] profile    : ${tbProfile}`);
if (process.env.TB_ARGS) console.log(`[bird-shortcuts] extra args: ${process.env.TB_ARGS}`);

const args = ["run", "--source-dir", "dist", "--firefox", tbPath];
if (tbProfile) args.push("--firefox-profile", tbProfile);

if (process.env.TB_ARGS) {
  // 例: TB_ARGS='-no-remote -foreground' などを想定
  // シンプルに空白区切りで分割（必要なら高度なパースに差し替え可）
  const tokens = process.env.TB_ARGS.match(/"[^"]+"|'[^']+'|\S+/g) || [];
  for (const t of tokens) {
    // クォートを外して素の引数に
    const cleaned = t.replace(/^["']|["']$/g, "");
    args.push(`--args=${cleaned}`);
  }
}

const child = spawn("web-ext", args, { stdio: "inherit", shell: false });
child.on("exit", (code) => process.exit(code ?? 0));
