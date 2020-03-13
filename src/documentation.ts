import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const homedir = require('os').homedir();

const { exec } = require('child_process');


export async function documentation(context: vscode.ExtensionContext){
    /*
    const dir_path : string = vscode.extensions.getExtension("meteca.briki-extension")?.extensionPath || ".";
    const indexPath = path.join(dir_path, "documentation", "index.html");
    */

    const indexPath = path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "documentation", "platform", "index.html");


    try{
        fs.chmodSync(indexPath, 0o555);
    }
    catch{
        vscode.window.showInformationMessage('Error with documentation');
        return;
    }
    

    if (process.platform === 'win32'){
        vscode.window.createTerminal("documentation", "rundll32.exe", ["url.dll,FileProtocolHandler", indexPath]);
    }
    else if (process.platform === 'darwin'){
        vscode.window.createTerminal("documentation", "open", [indexPath]);
    }
    else if (process.platform === 'linux'){
        //vscode.window.createTerminal("documentation", "~/.platformio/penv/bin/python", ["-m webbrowser " + "file://" + indexPath]);
        try{
            await new Promise((res, rej) => {
                exec(`~/.platformio/penv/bin/python -m webbrowser file://${indexPath}`, (err: string, stdout: string, stderr: string) => {
                    if (err) {
                        return rej(err);
                    } 
                    else {
                        console.log(stdout);
                        console.log(`stderr: ${stderr}`);
                        return res();
                    }
                });
            });
        }
        catch{
            vscode.window.showErrorMessage("An error has occurred");
            return undefined;
        }
    }  
}
