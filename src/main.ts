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
		conditionalToggle(this, this.fullScreen, zen);
		this.fullScreen = !this.fullScreen;
	}
}

function getOtherEl() {
	const ribbon = document.querySelector(".workspace-ribbon")
	const leftSplit = document.querySelector(".mod-left-split")
	const rightSplit = document.querySelector(".mod-right-split")
	const root = document?.querySelector(".workspace-tabs.mod-top-right-space")
	const rootHeader = root?.querySelector(".workspace-tabs.mod-top-right-space>.workspace-tab-header-container")
	const workspaceLeafContent = root?.querySelector(".workspace-leaf-content")
	const viewHeader = root?.querySelector(".workspace-leaf-content>.view-header")
	return { ribbon, leftSplit, rightSplit, rootHeader, workspaceLeafContent, viewHeader }
}

function toggleOtherEl(value = true) {
	const { ribbon, leftSplit, rightSplit, rootHeader, workspaceLeafContent, viewHeader } = getOtherEl()
	ribbon?.classList.toggle('hide-el', value);
	leftSplit?.classList.toggle('hide-el', value);
	rightSplit?.classList.toggle('hide-el', value);
	rootHeader?.classList.toggle('hide-el', value);
}

function conditionalToggle(modal: EditorFullScreen, isfullscreen: boolean, zen: boolean) {
	const { ribbon, leftSplit, rightSplit, rootHeader, workspaceLeafContent, viewHeader } = getOtherEl()

	toggleOtherEl(isfullscreen)
	
	if (zen) {
		workspaceLeafContent?.classList.toggle('zen-mode', isfullscreen)
	} else {
		viewHeader?.classList.toggle('hide-el', isfullscreen);
		if (modal.settings.hideStatusBar) {
			toggleStatusbar(isfullscreen)
		}
	}
}

function toggleStatusbar(value = true) {
	const bar = document.querySelector(".status-bar")
	bar?.classList.toggle('hide-el', value);
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