import * as vscode from 'vscode';
import {TreeProvider} from './TreeImplementation/TreeProvider';
import {Cmd} from './TreeImplementation/Cmd';
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
			'commands',
			new TreeProvider([
				new Cmd('Briki: MBC-WB OTA', 'briki.brikiOta'),
				new Cmd('Briki: MBC-WB Flash Partitioning', 'briki.partition'),
				new Cmd('Briki: MBC-WB Documentation', 'briki.documentation')
			])
		)
	);
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'briki-commands',
			new TreeProvider([
				new Cmd('Briki: MBC-WB OTA', 'briki.brikiOta'),
				new Cmd('Briki: MBC-WB Flash Partitioning', 'briki.partition'),
				new Cmd('Briki: MBC-WB Documentation', 'briki.documentation')
			])
		)
	);		
}

export function deactivate() {}
