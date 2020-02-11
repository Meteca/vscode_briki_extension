import * as vscode from 'vscode';
import {Command, TreeProvider} from './TreeProvider';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'briki-commands',
			new TreeProvider([
				{
					label: 'HelloWorld',
					commandName: 'extension.helloWorld' 
				}
			])
		)
	);
		
}

// this method is called when your extension is deactivated
export function deactivate() {}
