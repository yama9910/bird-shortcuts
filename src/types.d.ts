/// <reference types="thunderbird-webext-browser" />

// Thunderbird では browser.* と messenger.* は同義の別名
declare const messenger: typeof browser;  // 便利エイリアス

// Experiment の型（最小）
interface BirdShortcutsAPI {
  repairActiveMessage(): Promise<boolean>;
  executeCommand(commandName: string): Promise<boolean>;
}

// webextension-polyfill の型を拡張
declare module "webextension-polyfill" {
  interface Browser {
    birdShortcuts: BirdShortcutsAPI;
    messageDisplayAction: {
      onClicked: {
        addListener(callback: () => Promise<void>): void;
      };
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _x: void = undefined;
