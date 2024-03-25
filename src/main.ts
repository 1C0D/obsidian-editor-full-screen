import { App, Plugin, PluginSettingTab, Setting, View, WorkspaceSidedock } from "obsidian";

const DEFAULT_SETTINGS: EFSSettings = {
	hideStatusBar: true,
}

export interface EFSSettings {
	hideStatusBar: boolean
}

export default class EditorFullScreen extends Plugin {
	fullScreen = false;
	zen = false;
	settings: EFSSettings;
	isRightSideOpen = false;
	isLeftSideOpen = false;

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
		this.fullScreen = !this.fullScreen;
		this.zen = zen;
		const actionsOnMove = (event: MouseEvent) => {
			onMouseMove(event, this);
		}
		if (this.fullScreen) {
			document.addEventListener("mousemove", actionsOnMove);
		} else {
			document.removeEventListener("mousemove", actionsOnMove);
		}

		conditionalToggle(this, this.fullScreen, zen);
	}
}

let leftEdgeThreshold = 15;
let upEdgeThreshold = 20;
function onMouseMove(e: MouseEvent, modal: EditorFullScreen) {
	const xPosition = e.clientX;
	const yPosition = e.clientY;

	const { ribbon, rootHeader, viewHeader, workspaceLeafContent } = getOtherEl();
	if (ribbon && rootHeader && modal.fullScreen) {
		if (xPosition <= leftEdgeThreshold) {
			ribbon.classList.remove('hide-el');
			leftEdgeThreshold = 50
		}
		else {
			if (!this.fullScreen) {
				ribbon.classList.add('hide-el');
			}
			leftEdgeThreshold = 15
		}
		if (yPosition <= upEdgeThreshold) {
			rootHeader.classList.remove('hide-el');
			if (!modal.zen) {
				workspaceLeafContent?.classList.remove('zen-mode');
				viewHeader?.classList.remove('hide-el');
			}
			upEdgeThreshold = 140;
		} else {
			if (!modal.zen) {
				viewHeader?.classList.add('hide-el');
				workspaceLeafContent?.classList.add('zen-mode');
			}
			if (!this.fullScreen) {
				rootHeader.classList.add('hide-el');
			}
			upEdgeThreshold = 20;
		}
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
	const { ribbon, rootHeader } = getOtherEl()
	ribbon?.classList.toggle('hide-el', value);
	rootHeader?.classList.toggle('hide-el', value);
}

function conditionalToggle(modal: EditorFullScreen, isfullscreen: boolean, zen: boolean) {
	const { ribbon, leftSplit, rightSplit, rootHeader, workspaceLeafContent, viewHeader } = getOtherEl()

	toggleOtherEl(isfullscreen)
	toggleSibebars(modal, isfullscreen)

	if (zen) {
		workspaceLeafContent?.classList.toggle('zen-mode', isfullscreen)
	} else {
		viewHeader?.classList.toggle('hide-el', isfullscreen);
		if (modal.settings.hideStatusBar) {
			toggleStatusbar(isfullscreen)
		}
	}

	if (!isfullscreen) {
		workspaceLeafContent?.classList.remove('zen-mode')
		viewHeader?.classList.remove('hide-el')

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

function toggleSibebars(modal: EditorFullScreen, fullScreen = true) {
	if (!fullScreen) {
		modal.isLeftSideOpen = isOpen(getLeftSplit(modal));
		modal.isRightSideOpen = isOpen(getRightSplit(modal));
		getLeftSplit(modal).collapse();
		getRightSplit(modal).collapse();
	} else {
		if (modal.isLeftSideOpen) {
			getLeftSplit(modal).expand();
		}
		if (modal.isRightSideOpen) {
			getRightSplit(modal).expand();
		}
	}
}

function getLeftSplit(modal: EditorFullScreen) {
	return modal.app.workspace.leftSplit;
}

function getRightSplit(modal: EditorFullScreen) {
	return modal.app.workspace.rightSplit;
}

function isOpen(side: WorkspaceSidedock) {
	if (side.collapsed == true) return false;
	else return true;
}

