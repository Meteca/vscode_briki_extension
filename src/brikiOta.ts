import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as ini from 'ini';
import {getOtaPath} from './PartitionLibrary/paths';

export function brikiOta(){
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;
    var args : string[] = [];

    var tool_path = getOtaPath();
    console.log(process.platform);
    console.log(tool_path);

    try{
        console.log(folders.length);
        for (var i = folders.length - 1; i >= 0; i--){
            ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
            ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
            console.log(ini_file);
            if (ini_file[Object.keys(ini_file)[0]].board.includes("briki") && ini_file[Object.keys(ini_file)[0]].board.includes("esp")){ // recognize if this is a briki-esp32 project
                args.push("ESP32");
                args.push(path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0].slice(4), "firmware.bin"));
                break;
            }
            if (ini_file[Object.keys(ini_file)[0]].board.includes("briki") && ini_file[Object.keys(ini_file)[0]].board.includes("samd")){ //recognize if this is a briki-samd21 project
                args.push("SAMD21");
                args.push(path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0].slice(4), "firmware.bin"));
                break;
            }
        }
    }
    catch{
        vscode.window.showErrorMessage('No briki project was automatically found');
    }
    finally{
        vscode.window.createTerminal("brikiOta", tool_path, args);
    }
}
