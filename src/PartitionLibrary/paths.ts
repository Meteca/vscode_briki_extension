import * as vscode from 'vscode';
import * as ini from 'ini';
import * as path from 'path';
import * as fs from 'fs';
import {GUIParams} from './paramFromGUI';


const homedir = require('os').homedir();


export interface BrikiProject{
    folder: vscode.WorkspaceFolder;
    isEsp: boolean;
    key: string;
    iniFile: any;
}


export function getProject(): BrikiProject | undefined {
    var documentUri: vscode.Uri | undefined = vscode.window.activeTextEditor?.document.uri;
    if(documentUri === undefined){
        vscode.window.showErrorMessage("No briki project found");
        return undefined;
    }
    var workFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.getWorkspaceFolder(documentUri);
    if(workFolder !== undefined){
        try{
            var iniFilePath = path.join(workFolder.uri.fsPath, "platformio.ini");
            var iniFile = ini.parse(fs.readFileSync(iniFilePath, 'utf-8'));
            var keys = Object.keys(iniFile);
            for (var key of keys){
                if (iniFile[key].board.includes("briki") && iniFile[key].board.includes("esp")){ // recognize if this is a briki-esp32 project
                    return {
                        folder: workFolder,
                        isEsp: true,
                        key: key,
                        iniFile: iniFile[key]
                    } as BrikiProject;
                }
                if (iniFile[key].board.includes("briki") && iniFile[key].board.includes("samd")){ //recognize if this is a briki-samd21 project
                    return {
                        folder: workFolder,
                        isEsp: false,
                        key: key,
                        iniFile: iniFile[key]
                    } as BrikiProject;
                }
            }
            vscode.window.showErrorMessage("No briki project found");
            return undefined; 
        }                            
        catch{
            vscode.window.showErrorMessage("No briki project found");
            return undefined;
        }
    }
    else {
        vscode.window.showErrorMessage("No briki project found");
        return undefined;
    }
}


export async function getOutputPath(project: BrikiProject): Promise<string | undefined> {
    if(project === undefined){
        return undefined;
    }
    else if (project.isEsp){
        return path.join(project.folder.uri.fsPath, ".pio", "build",project.key.slice(4), "briki_data.bin");
    }
    else {
        vscode.window.showErrorMessage("You selected a samd Briki project");
        return undefined;
    }
}


export function getExecutablePath(params: GUIParams): string | undefined {
    const dir_path : string = vscode.extensions.getExtension("briki.briki-mbcwb-extension")?.extensionPath || ".";
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
        if(fs.existsSync(executable)){
        return executable;
    }
        else {
            vscode.window.showErrorMessage('Error with partition binary');
            return undefined
        }
    }
    catch{
        vscode.window.showErrorMessage('Error with partition binary');
        console.log("catch exacutable");
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

export function getBoardPath(project: BrikiProject): string | undefined {
    var boardPath = path.join(homedir, ".platformio", "platforms", "espressif32", "boards", `${project.iniFile.board}.json`);
    if(!fs.existsSync(boardPath)){
        vscode.window.showErrorMessage("Platformio has not installed briki framework");
        return undefined;
    }
    else {
        return boardPath;
    }
}

export function getDefaultCSV(project: BrikiProject): string | undefined {
    var boardPath = getBoardPath(project);
    if (boardPath === undefined){
        return undefined;
    }
    else {
        try{
            var boardObj = JSON.parse(fs.readFileSync(boardPath, 'utf8'));
            var partition = boardObj.build.partitions;
            return path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "tools", "partitions", partition);
        }
        catch{
            vscode.window.showErrorMessage("Error during the reading of default partition");
        }
    }
}

export function getCSVPath(project: BrikiProject): string | undefined{
    if(project === undefined){
        return undefined;
    }
    var defaultPath = getDefaultCSV(project);
    if (defaultPath === undefined){
        return undefined;
    }
    //var defaultPath = path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "tools", "partitions", "8MB_ffat.csv");
    if(project.iniFile["board_build.partitions"] !== undefined){
        var builtInPath = path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "tools", "partitions", project.iniFile["board_build.partitions"]);
        var newFilePath = path.join(project.folder.uri.fsPath, project.iniFile["board_build.partitions"]);
        if(fs.existsSync(builtInPath)){
            console.log("dentro built in");
            return builtInPath;
        }
        else if (fs.existsSync(newFilePath)){
            console.log("dentro new file");
            return newFilePath;
        }
    }
    else if (fs.existsSync(defaultPath)) {
        console.log("dentro default");
        return defaultPath;
    }
    else{
        console.log("fuori");
        return undefined;
    }
}


export async function getDataPath(project: BrikiProject): Promise<string | undefined>{
    if (project === undefined){
        return undefined;
    }
    else if(project.isEsp){
        return project.iniFile.data_dir ??  path.join(project.folder.uri.fsPath, "data"); //return user selected data folder if exist or default one            
    }
    else {
        vscode.window.showErrorMessage("You selected a samd Briki project");
        return undefined;
    }
}


export function getOtaPath(): string | undefined{
    const dir_path : string = vscode.extensions.getExtension("briki.briki-mbcwb-extension")?.extensionPath || ".";
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
        if(fs.existsSync(tool_path)){
        return tool_path;
    }
        else {
            vscode.window.showErrorMessage('Ota tool not found');
            return undefined;
        }
    }
    catch{
        vscode.window.showErrorMessage('Ota tool not found');
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