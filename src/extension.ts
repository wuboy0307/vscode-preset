// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('vscode-preset active');

	// Simple hello command that doesn't mutate settings
	const hello = vscode.commands.registerCommand('vscode-preset.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from vscode-preset!');
	});

	// Command to apply recommended workspace settings (prompts user)
	const apply = vscode.commands.registerCommand('vscode-preset.applyDefaults', async () => {
		const choice = await vscode.window.showInformationMessage(
			'Apply recommended workspace settings (this will write to .vscode/settings.json)?',
			{ modal: true },
			'Apply',
			'Preview',
			'Cancel'
		);

		if (choice === 'Cancel' || !choice) {
			return;
		}

		const settings: Record<string, unknown> = {
			'editor.formatOnSave': true,
			'editor.tabSize': 2,
			'files.trimTrailingWhitespace': true,
			'files.insertFinalNewline': true,
			"security.workspace.trust.enabled": false,
			"terminal.integrated.defaultLocation": "view",
			"terminal.integrated.tabs.enabled": true,
			"terminal.integrated.shellIntegration.enabled": true,
			"security.workspace.trust.banner": "never",
			"security.workspace.trust.startupPrompt": "never"			
		};

		if (choice === 'Preview') {
			const doc = await vscode.workspace.openTextDocument({
				content: JSON.stringify(settings, null, 2),
				language: 'json'
			});
			await vscode.window.showTextDocument(doc, { preview: true });
			return;
		}

		try {
			const config = vscode.workspace.getConfiguration();
			const target = vscode.ConfigurationTarget.Workspace;
			for (const [key, value] of Object.entries(settings)) {
				// await each update to ensure order and to catch errors early
				// set don't target Global without explicit user consent
				// third argument `target` sets workspace-level settings (writes .vscode/settings.json)
				// false indicates the setting is not in a specific folder
				// Note: some settings are contributed by extensions and may not persist if unknown
				// but workspace-level updates are the correct approach for per-workspace presets
				// eslint-disable-next-line no-await-in-loop
				await config.update(key, value, target);
			}
			vscode.window.showInformationMessage('Workspace settings updated.');
		} catch (err) {
			console.error(err);
			vscode.window.showErrorMessage('Failed to apply workspace settings. See console for details.');
		}
	});

	context.subscriptions.push(hello, apply);

	// One-time startup prompt: show on first activation after install/update
	(async () => {
		try {
			const seen = context.globalState.get<boolean>('vscode-preset.startupPromptShown');
			if (seen) return;
			const choice = await vscode.window.showInformationMessage(
				'vscode-preset: apply recommended workspace settings?',
				{ modal: true },
				'Apply',
				'Preview',
				'Skip'
			);
			if (!choice || choice === 'Skip') {
				await context.globalState.update('vscode-preset.startupPromptShown', true);
				return;
			}
			// Reuse the apply command logic by invoking it programmatically
			if (choice === 'Preview') {
				await vscode.commands.executeCommand('vscode-preset.applyDefaults', 'preview');
			} else if (choice === 'Apply') {
				await vscode.commands.executeCommand('vscode-preset.applyDefaults', 'apply');
			}
			await context.globalState.update('vscode-preset.startupPromptShown', true);
		} catch (err) {
			console.error('startup prompt failed', err);
		}
	})();

}

// This method is called when your extension is deactivated
export function deactivate() {}
