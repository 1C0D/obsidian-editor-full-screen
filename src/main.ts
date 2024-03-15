import { Plugin, View } from "obsidian";

export default class EditorFullScreen extends Plugin {
	onload() {
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

	toggleMode(zen=false) {
		const activeView = this.app.workspace.getActiveViewOfType(View)
		if (!activeView) return;
		if (!document.fullscreenElement) {
			let el = zen? activeView.containerEl : activeView.containerEl.lastElementChild as HTMLElement;
			el.requestFullscreen()
		} else {
			if (document.fullscreenElement)
				document.exitFullscreen()
		}
	}
}
