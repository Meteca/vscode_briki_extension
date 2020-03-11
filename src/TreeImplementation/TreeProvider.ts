import * as vscode from 'vscode';
import {Cmd} from './Cmd';


export class TreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	commands : Cmd [];
	constructor(commands : Cmd[]){
		this.commands = commands;
	}

	public async getChildren(task? : vscode.TreeItem): Promise<vscode.TreeItem[]> {
	    if(task){
			return Promise.resolve([]);
		}
		var items : vscode.TreeItem[] = [];
		this.commands.forEach(command => {
            var item = new vscode.TreeItem(command.title);
            item.command = command;
			items.push(item);
		});

		return Promise.resolve(items);
	}
	
	getTreeItem(item : vscode.TreeItem) : vscode.TreeItem{
		return item;
	}
}
