import * as vscode from 'vscode';


class TreeProvider implements vscode.TreeDataProvider











export function activate(context: vscode.ExtensionContext) {



	
	console.log('Congratulations, your extension "briki-extension" is now active!');

	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);


	//var provider = new vscode.window.createTreeView('platformio-activitybar.projectTasks',

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'platformio-activitybar.projectTasks',
			
		)
	)
		
}

// this method is called when your extension is deactivated
export function deactivate() {}
