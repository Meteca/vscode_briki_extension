import * as vscode from 'vscode';
import {TreeProvider} from './TreeProvider';
import {Cmd} from './Cmd';
import {brikiOta} from './brikiOta';

export function activate(context: vscode.ExtensionContext) {

	let otaDisposable = vscode.commands.registerCommand('extension.brikiOta', brikiOta);

	context.subscriptions.push(otaDisposable);
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'briki-commands',
			new TreeProvider([
				new Cmd('Briki OTA', 'extension.brikiOta')
			])
		)
	);
		
}

export function deactivate() {}
