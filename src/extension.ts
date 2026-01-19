// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('vscode-preset active');
	// 等 VS Code 完全 ready 再執行
	setTimeout(async () => {
		await vscode.commands.executeCommand("opencode.open"); 
		// ↑ 這個 command id 依實際為準，下面教你怎麼查
	}, 1500);

}

// This method is called when your extension is deactivated
export function deactivate() {}
