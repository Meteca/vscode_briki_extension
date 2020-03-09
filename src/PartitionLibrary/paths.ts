import * as vscode from 'vscode';
import * as ini from 'ini';
import * as path from 'path';
import * as fs from 'fs';
import {GUIParams} from './paramFromGUI';


const homedir = require('os').homedir();


export async function getOutputPath(): Promise<string | undefined> {
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;

    try{
        for (var i = folders.length - 1; i >= 0; i--){
            ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
            ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
            if (ini_file[Object.keys(ini_file)[0]].board.includes("briki") && ini_file[Object.keys(ini_file)[0]].board.includes("esp")){ // recognize if this is a briki-esp32 project
                return path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0].slice(4), "briki_data.bin");
            }
        }
    }
    catch{
        vscode.window.showErrorMessage("No briki project was automatically found");
    }
    return undefined;
}


export function getExecutablePath(params: GUIParams): string | undefined {
    const dir_path : string = vscode.extensions.getExtension("meteca.briki-extension")?.extensionPath || ".";
    var executable = path.join(dir_path, "partition");

    if(params.fsChoice === 'Ffat' && process.platform === "darwin"){
        executable = path.join(executable, "fatfsimage");
    }
    else if(params.fsChoice === 'Ffat' && process.platform === "win32"){
        executable = path.join(executable, "fatfsimage.exe"); 
    }
    else if(params.fsChoice === 'Ffat' && process.platform === "linux"){
        executable = path.join(executable, "fatfsimage.elf"); 
    }
    else if(params.fsChoice === 'Spiffs' && process.platform === "darwin"){
        executable = path.join(executable, "mkspiffs"); 
    }
    else if(params.fsChoice === 'Spiffs' && process.platform === "win32"){
        executable = path.join(executable, "mkspiffs.exe");
    }
    else if(params.fsChoice === 'Spiffs' && process.platform === "linux"){
        executable = path.join(executable, "mkspiffs.elf");
    }
    else{
        return undefined;
    }

    try{
        fs.chmodSync(executable, 0o555);
        return executable;
    }
    catch{
        vscode.window.showErrorMessage('Error with partition binary');
        return undefined;
    }
    

}


export function getMbcToolPath(): string | undefined {
    if (process.platform === "win32"){
        return path.join(homedir, ".platformio", "packages", "tool-mbctool", "bin", "mbctool.exe");  
    }
    else{
        return path.join(homedir, ".platformio", "packages", "tool-mbctool", "bin", "mbctool");
    }
}


export function getCSVPath(): string | undefined{
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;
    var keys: string[];
    var CsvPath: string | undefined = undefined;
    for (var i = folders.length - 1; i >= 0; i--){
        ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
        ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
        console.log(ini_file);
        keys = Object.keys(ini_file);
        keys.forEach( (key) => {
            var builtInPath = path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "tools", "partitions", ini_file[key]["board_build.partitions"]);
            var newFilePath = path.join(folders[i].uri.fsPath, ini_file[key]["board_build.partitions"]);
            var defaultPath = path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "tools", "partitions", "8MB_ffat.csv");
            console.log(builtInPath);
            console.log(newFilePath);
            console.log(defaultPath);
            if(fs.existsSync(builtInPath)){
                console.log("dentro built in");
                CsvPath = builtInPath;
            }
            else if (fs.existsSync(newFilePath)){
                console.log("dentro new file");
                CsvPath = newFilePath;
            }
            else if (fs.existsSync(defaultPath)) {
                console.log("dentro default");
                CsvPath = defaultPath;
            }
            else{
                console.log("fuori");
                CsvPath = undefined;
            }
        });
        console.log("prima della fine");
        console.log(CsvPath);
        return CsvPath;
    }
}


export async function getDataPath(): Promise<string | undefined>{
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;
    var key: string;
    
    try{
        for (var i = folders.length - 1; i >= 0; i--){
            ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
            ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
            key = Object.keys(ini_file)[0];
            if (ini_file[Object.keys(ini_file)[0]].board.includes("briki") && ini_file[Object.keys(ini_file)[0]].board.includes("esp")){ // recognize if this is a briki-esp32 project
                return ini_file[key].data_dir ??  path.join(folders[i].uri.fsPath, "data"); //return user selected data folder if exist or default one            
            }
        }
        return undefined;
    }
    catch{
        vscode.window.showErrorMessage("Unable to find briki project");
    }
}


export function getOtaPath(): string | undefined{
    const dir_path : string = vscode.extensions.getExtension("meteca.briki-extension")?.extensionPath || ".";
    let tool_path : string;
    if(process.platform === "win32"){
        tool_path = path.join(dir_path, "brikiOta", "brikiOta.exe");
    }
    else if(process.platform === "darwin"){
        tool_path = path.join(dir_path, "brikiOta", "brikiOta.app", "Contents", "MacOS", "brikiOta");
    }
    else{
        tool_path = path.join(dir_path, "brikiOta", "brikiOta");
    }
    try{
        fs.chmodSync(tool_path, 0o555);
        return tool_path;
    }
    catch{
        vscode.window.showInformationMessage('Error with ota binary');
        return undefined;
    }

}

export function getPioPath(){
    if (process.platform === "win32"){
        return path.join(homedir, ".platformio", "penv", "Scripts", "platformio.exe");  
    }
    else{
        return path.join(homedir, ".platformio", "penv", "bin", "platformio");
    }
}