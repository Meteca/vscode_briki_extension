import * as vscode from 'vscode';
import {Command, TreeProvider} from './TreeProvider';
import {brikiOta} from './brikiOta';

export function activate(context: vscode.ExtensionContext) {

	let otaDisposable = vscode.commands.registerCommand('extension.brikiOta', brikiOta);

	context.subscriptions.push(otaDisposable);
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'briki-commands',
			new TreeProvider([
				{
					label: 'Briki OTA',
					commandName: 'extension.brikiOta' 
				}
			])
		)
	);
		
}

// this method is called when your extension is deactivated
export function deactivate() {}
