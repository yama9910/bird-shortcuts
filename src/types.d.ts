/// <reference types="thunderbird-webext-browser" />

// Thunderbird では browser.* と messenger.* は同義の別名
declare const messenger: typeof browser; // 便利エイリアス

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
			enable(): void;
			disable(): void;
			onClicked: {
				addListener(callback: () => Promise<void>): void;
			};
		};
		commands: {
			getAll(): Promise<Array<{ name: string; shortcut?: string }>>;
			onCommand: {
				addListener(callback: (command: string) => Promise<void> | void): void;
			};
		};
	}
}

// biome-ignore lint: placeholder to keep this file a module during global augmentation
const _x: void = undefined;
