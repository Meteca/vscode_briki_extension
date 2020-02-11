import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as ini from 'ini';



export function brikiOta(){
    let dir_path : string = vscode.extensions.getExtension("meteca.briki-extension")?.extensionPath || ".";
    let tool_path : string;
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;
    var args : string[] = [];

    if(process.platform === "win32"){
        tool_path = path.join(dir_path, "brikiOta", "brikiOta.exe");
    }
    if(process.platform === "darwin"){
        tool_path = path.join(dir_path, "brikiOta", "brikiOta.app");
    }
    else{
        tool_path = path.join(dir_path, "brikiOta", "brikiOta");
    }
    try{
        fs.chmodSync(tool_path, 0o555);
    }
    catch{
        vscode.window.showInformationMessage('Error with ota binary');
        return;
    }

    console.log(process.platform);
    console.log(tool_path);

    try{
        console.log(folders.length);
        for (var i = folders.length - 1; i >= 0; i--){
            ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
            ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
            if (Object.keys(ini_file)[0].includes("briki") && Object.keys(ini_file)[0].includes("esp32")){
                args.push("ESP32");
                args.push(path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0].slice(4), "firmware.bin"));
                break;
            }
            if (Object.keys(ini_file)[0].includes("briki") && Object.keys(ini_file)[0].includes("samd21")){
                args.push("SAMD21");
                args.push(path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0].slice(4), "firmware.bin"));
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
}
