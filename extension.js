// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const ini = require('ini');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	//console.log('Congratulations, your extension "Briki" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.BrikiOTA', function () {
		
		// The code you place here will be executed every time your command is executed
		//var tool_path = path.resolve('brikiOta.exe');
		var tool_path = "C:/Users/alber/Desktop/mbc-wb-sw-platform-master/mbc-wb-sw-platform-master/tools/brikiOta/brikiOta.exe";
		
		var folders = vscode.workspace.workspaceFolders;
		var ini_file;
		var ini_file_path;
		var args = [];

		// ini_file_path = path.join(folders[0].uri.fsPath, "platformio.ini");
		// ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
		// console.log(Object.keys(ini_file))
		// console.log(Object.keys(ini_file)[0].includes("briki"))
		
		for (var i = folders.length - 1; i >= 0; i--){
			ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
			ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
			if (Object.keys(ini_file)[0].includes("briki") && Object.keys(ini_file)[0].includes("esp32")){
				args.push("ESP32");
				args.push(path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0], "firmware.bin"));
				break;
			}
			if (Object.keys(ini_file)[0].includes("briki") && Object.keys(ini_file)[0].includes("samd21")){
				args.push("SAMD21");
				args.push(path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0], "firmware.bin"));
				break;
			}
		}
		
		if (args === []){
			vscode.window.showInformationMessage('No briki project was automatically finded');
		}
		vscode.window.createTerminal("brikiOta", tool_path, args);
		
		

		// Display a message box to the user
		//vscode.window.showInformationMessage('Launched Briki OTA tool');
		//console.log(vscode.workspace.workspaceFolders);
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
