import * as vscode from 'vscode';
import { exportSetting, importSetting } from './configManager';

export function activate(context: vscode.ExtensionContext) {

	const commandExport = vscode.commands.registerCommand('extension.ExportSetting', () => {
		exportSetting(context);
	});

	const commandImport = vscode.commands.registerCommand('extension.ImportSetting', () => {
		importSetting(context);
	});

	context.subscriptions.push(commandExport, commandImport);
}

export function deactivate() { }
