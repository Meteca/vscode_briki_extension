import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const homedir = require('os').homedir();


export function documentation(context: vscode.ExtensionContext){
    const dir_path : string = vscode.extensions.getExtension("meteca.briki-extension")?.extensionPath || ".";
    const indexPath = path.join(dir_path, "documentation", "index.html");


    try{
        fs.chmodSync(indexPath, 0o555);
    }
    catch{
        vscode.window.showInformationMessage('Error with permission of files');
        return;
    }
    

    if (process.platform === 'win32'){
        vscode.window.createTerminal("documentation","rundll32 url.dll,FileProtocolHandler ", [indexPath]);
    }
    if (process.platform === 'darwin'){
        vscode.window.createTerminal("documentation", "open", [indexPath]);
        }
    if (process.platform === 'linux'){
        vscode.window.createTerminal("documentation", "~/.platformio/penv/bin/python", ["-m webbrowser " + "file://" + indexPath]);
    }
}