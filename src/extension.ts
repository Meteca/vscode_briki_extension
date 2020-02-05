import * as vscode from 'vscode';


class TreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

	treeItem : vscode.TreeItem;
	constructor(/*commandName: string*/){
		this.treeItem = new vscode.TreeItem("label_prova");
		this.getTreeItem(new vscode.TreeItem("prova"));
	}
	getChildren(item? : vscode.TreeItem): Thenable<vscode.TreeItem[]> {
		return Promise.resolve([]);
	}
	getTreeItem(item : vscode.TreeItem) : vscode.TreeItem{
		console.log(this.treeItem);
		return item;
	}
}





export function activate(context: vscode.ExtensionContext) {

	

	
	console.log('Congratulations, your extension "briki-extension" is now active!');

	let disposable = vscode.commands.registerCommand('prova.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);

	console.log("dsasadsadfsafdsafd");


	//var provider = new vscode.window.createTreeView('platformio-activitybar.projectTasks',

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'prova',
			new TreeProvider()
		)
	);
		
}

// this method is called when your extension is deactivated
export function deactivate() {}
