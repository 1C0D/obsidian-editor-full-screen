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
		const elements = getOtherEl();
		conditionalToggle(this, this.fullScreen, zen, elements);

		const actionsOnMove = (event: MouseEvent) => {
			onMouseMove(event, this, elements);
		}
		if (this.fullScreen) {
			document.addEventListener("mousemove", actionsOnMove);
		} else {
			document.removeEventListener("mousemove", actionsOnMove);
		}
	}
}

function conditionalToggle(modal: EditorFullScreen, isfullscreen: boolean, zen: boolean, elements: Elements) {
	toggleSibebars(modal, isfullscreen)
	toggleEls(isfullscreen, elements)

	const { activeView,workspaceLeafContent, viewHeader, statusBar } = elements
	const leafContent = zen ? activeView?.containerEl : activeView?.containerEl.lastElementChild as HTMLElement;
	leafContent?.classList.toggle('zen-mode', true)

	if (zen) {
		// activeView?.containerEl?.classList.toggle('zen-mode', isfullscreen)
	} else {
		viewHeader?.classList.toggle('hide-el', isfullscreen);
		if (modal.settings.hideStatusBar) {
			statusBar?.classList.toggle('hide-el', isfullscreen);
		}
	}
	if (!isfullscreen) {
		workspaceLeafContent?.classList.remove('zen-mode')
		viewHeader?.classList.remove('hide-el')
		modal.isRightSideOpen = false;
		modal.isLeftSideOpen = false;
		statusBar?.classList.remove('hide-el')
	}
}

function toggleSibebars(modal: EditorFullScreen, fullScreen: boolean) {
	if (fullScreen) {
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

function toggleEls(value: boolean, elements: Elements) {
	const { ribbon, rootHeader } = elements
	ribbon?.classList.toggle('hide-el', value);
	rootHeader?.classList.toggle('hide-el', value);
}

let leftEdgeThreshold = 20;
let upEdgeThreshold = 20;
let bottomEdgeThreshold = 200;
let rightEdgeThreshold = 350;
function onMouseMove(e: MouseEvent, modal: EditorFullScreen, elements: Elements) {
	const { activeView, ribbon, rootHeader, workspaceLeafContent, viewHeader, statusBar } = elements
	if (!activeView) return

	const xPosition = e.clientX;
	const yPosition = e.clientY;


	if (modal.fullScreen) {
		if (ribbon && xPosition <= leftEdgeThreshold) {
			ribbon.classList.remove('hide-el');
			leftEdgeThreshold = 50
		}
		else {
			if (ribbon && !this.fullScreen) {
				ribbon.classList.add('hide-el');
			}
			leftEdgeThreshold = 15
		}
		if (yPosition <= upEdgeThreshold) {
			if (rootHeader) rootHeader.classList.remove('hide-el');
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
			if (rootHeader && !this.fullScreen) {
				rootHeader.classList.add('hide-el');
			}
			upEdgeThreshold = 20;
		}
		if (statusBar && !modal.zen && yPosition >= (window.innerHeight - bottomEdgeThreshold) && xPosition >= (window.innerWidth - rightEdgeThreshold)) {
			statusBar.classList.remove('hide-el');
		} else {
			if (statusBar && !modal.zen && !this.fullScreen) {
				statusBar.classList.add('hide-el');
			}
		}
	}
}

interface Elements {
	activeView: View | null;
	ribbon: Element | null;
	leftSplit: Element | null;
	rightSplit: Element | null;
	rootHeader: Element | null;
	workspaceLeafContent: Element | null;
	viewHeader: Element | null;
	statusBar: Element | null;
}

function getOtherEl(): Elements {
	const activeView: View = this.app.workspace.getActiveViewOfType(View) ?? null;
	const leafContent = activeView?.containerEl ?? null;
	const ribbon = document.querySelector(".workspace-ribbon") ?? null;
	const leftSplit = document.querySelector(".mod-left-split") ?? null;
	const rightSplit = document.querySelector(".mod-right-split") ?? null;
	const root = document?.querySelector(".workspace-tabs.mod-top-right-space") ?? null;
	const rootHeader = root?.querySelector(".workspace-tabs.mod-top-right-space>.workspace-tab-header-container") ?? null;
	const viewHeader = leafContent?.firstElementChild ?? null;
	const workspaceLeafContent = root?.querySelector(".workspace-leaf-content") ?? null;
	const statusBar = document.querySelector(".status-bar") ?? null;

	return {
		activeView,
		ribbon,
		leftSplit,
		rightSplit,
		rootHeader,
		workspaceLeafContent,
		viewHeader,
		statusBar,
	};
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

