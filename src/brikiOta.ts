import * as vscode from 'vscode';
import * as path from 'path';
import {getOtaPath, getProject} from './PartitionLibrary/paths';

export function brikiOta(){
    var args : string[] = [];

    var project = getProject();
    var toolPath = getOtaPath();

    console.log(process.platform);
    console.log(toolPath);

    if (toolPath === undefined){
        return undefined;
    }

    if (project?.isEsp === true){
        args.push("ESP32");
        args.push(path.join(project.folder.uri.fsPath, ".pio", "build", project.key.slice(4), "firmware.bin"));
    }
    else if (project?.isEsp === false){
        args.push("SAMD21");
        args.push(path.join(project.folder.uri.fsPath, ".pio", "build", project.key.slice(4), "firmware.bin"));
    }

    vscode.window.createTerminal("brikiOta", toolPath, args);
}