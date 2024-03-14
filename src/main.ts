import { Plugin, View } from "obsidian";

export default class EditorFullScreen extends Plugin {
	fullScreen = false;
	onload() {
		this.addCommand({
			id: "editor-full-screen",
			name: "Switch editor full screen",
			callback: () => this.fullscreenMode(),
		});
	}

	fullscreenMode() {
		const activeView =  this.app.workspace.getActiveViewOfType(View)
		if (!activeView) return;
		const el = activeView.containerEl;
		if (!this.fullScreen) el.requestFullscreen();
		else {
			activeDocument.exitFullscreen();
		}
		this.fullScreen = !this.fullScreen;
	}
}
