import { App, Plugin, PluginSettingTab, Setting, View } from "obsidian";

const DEFAULT_SETTINGS: EFSSettings = {
	hideStatusBar: true,
}

export interface EFSSettings {
	hideStatusBar: boolean
}

export default class EditorFullScreen extends Plugin {
	fullScreen = false;
	settings: EFSSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new EFSSettingTab(this.app, this));

		this.addCommand({
			id: "editor-full-screen",
			name: "Full screen mode",
			callback: () => this.toggleMode()
		});
		this.addCommand({
			id: "editor-zen-mode",
			name: "Zen mode",
			callback: () => this.toggleMode(true),
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	toggleMode(zen = false) {
		const activeView = this.app.workspace.getActiveViewOfType(View)
		if (!activeView) return;

		const leafContent = zen ? activeView.containerEl : activeView.containerEl.lastElementChild as HTMLElement;
		const workspaceContainer = document.querySelector('.workspace');
		leafContent.classList.toggle('zen-mode',true)

		if (!workspaceContainer) return;

		if (!this.fullScreen) {
			workspaceContainer.empty();
			workspaceContainer.appendChild(leafContent);
			if (!zen && this.settings.hideStatusBar) {
				const bar = document.querySelector(".status-bar")
				bar!.classList.toggle('hide-status-bar', true);
			}
		} else {
			window.location.reload();
		}
		this.fullScreen = !this.fullScreen;
	}
}

class EFSSettingTab extends PluginSettingTab {
	plugin: EditorFullScreen;

	constructor(app: App, plugin: EditorFullScreen) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Hide status bar in full screen')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.hideStatusBar)
				.onChange(async (value) => {
					this.plugin.settings.hideStatusBar = value;
					await this.plugin.saveSettings();
				}));
	}
}