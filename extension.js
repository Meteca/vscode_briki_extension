const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const ini = require('ini');

let brikiOtaButton;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	//function that create the BrikiOTA command

	let disposable = vscode.commands.registerCommand('extension.BrikiOTA', function () {
		// tool_path = "C:/Users/alber/Desktop/mbc-wb-sw-platform-master/mbc-wb-sw-platform-master/tools/brikiOta/brikiOta.exe";
		let dir_path = vscode.extensions.getExtension("briki.brikiota").extensionPath;
		let tool_path;

		if(process.platform === "win32"){
			tool_path = path.join(dir_path, "brikiOta.exe")
		}
		if(process.platform === "darwin"){
			tool_path = path.join(dir_path, "brikiOta.app")
		}
		if(process.platform === "linux"){
			tool_path = path.join(dir_path, "brikiOta")
		}

		fs.chmodSync(tool_path, 0o555);
		console.log(process.platform)
		console.log(tool_path)
		try{
			var folders = vscode.workspace.workspaceFolders;
			var ini_file;
			var ini_file_path;
			var args = [];

			console.log(folders.length)
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
		}
		catch{
			vscode.window.showInformationMessage('No briki project was automatically finded');
		}
		finally{
			vscode.window.createTerminal("brikiOta", tool_path, args);
		}
	});



	context.subscriptions.push(disposable); //making the command available


	//create the button that calls the command
	brikiOtaButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	brikiOtaButton.command = 'extension.BrikiOTA';
	brikiOtaButton.text = 'B'
	brikiOtaButton.show();
	context.subscriptions.push(brikiOtaButton);  //making the button available

}
exports.activate = activate;


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
