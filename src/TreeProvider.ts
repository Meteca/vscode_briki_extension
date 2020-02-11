import * as vscode from 'vscode';

export class Command {
	label: string;
	commandName: string;
	constructor(label: string, command: string){
		this.label = label;
		this.commandName = command;
	}
}

export class TreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	commands : Command [];
	constructor(commands : Command[]){
		this.commands = commands;
	}

	public async getChildren(task? : vscode.TreeItem): Promise<vscode.TreeItem[]> {
	    if(task){
			return Promise.resolve([]);
		}
		var items : vscode.TreeItem[] = [];
		this.commands.forEach(command => {
            var item = new vscode.TreeItem(command.label);
            item.command = {
                title: command.label,
                command: command.commandName,
                arguments: []
            };
			items.push(item);
		});

		return Promise.resolve(items);
	}
	
	getTreeItem(item : vscode.TreeItem) : vscode.TreeItem{
		return item;
	}
}
