import * as vscode from 'vscode';
import {TreeProvider} from './TreeProvider';
import {Cmd} from './Cmd';
import {brikiOta} from './brikiOta';
import {partition} from './partition';
import {documentation} from './documentation';

export function activate(context: vscode.ExtensionContext) {
	let otaDisposable = vscode.commands.registerCommand('briki.brikiOta', brikiOta);
	let partDisposable = vscode.commands.registerCommand('briki.partition', partition);
	let docDisposable = vscode.commands.registerCommand('briki.documentation', documentation);
	context.subscriptions.push(otaDisposable);
	context.subscriptions.push(partDisposable);
	context.subscriptions.push(docDisposable);
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'briki-commands',
			new TreeProvider([
				new Cmd('Briki OTA', 'briki.brikiOta'),
				new Cmd('Partition', 'briki.partition'),
				new Cmd('Documentation', 'briki.documentation')
			])
		)
	);		
}

export function deactivate() {}
