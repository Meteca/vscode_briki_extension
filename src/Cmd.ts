import * as vscode from 'vscode';

export class Cmd implements vscode.Command{
	title: string;
	command: string;
	arguments? : string[];
	constructor(label: string, command: string, args? : string[]){
		this.title = label;
		this.command = command;
		this.arguments = args;
	}
}