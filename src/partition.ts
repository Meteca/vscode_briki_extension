import * as vscode from 'vscode';
import * as ini from 'ini';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csvtojson';
import {getOtaPath} from './brikiOta';

const homedir = require('os').homedir();
const { exec } = require('child_process');

interface GUIParams {
    fsChoice: string;
    dataPath: string; 
    uploadChoice: string;
}

interface PartitionData {
    size: string;
    offset: string;
}

async function getDataPath(): Promise<string | undefined>{
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;
    var key: string;
    
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

function getCSVPath(): string | undefined{
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;
    var keys: string[];
    
    for (var i = folders.length - 1; i >= 0; i--){
        ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
        ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
        keys = Object.keys(ini_file);
        keys.forEach( (key) => {
            if (key.includes('custom_table')){
                return path.join(folders[i].uri.fsPath, ini_file[key].board_build.partition);
            }
            if (key.includes('custom_builtin_table')){
                return path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "tools", "partitions", ini_file[key].board_build.partition);
            }
        });
    }
    return path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "tools", "partitions", "8MB_ffat.csv");
}

async function getPartitionData(): Promise<PartitionData | undefined>{
    let size: string | undefined = undefined;
    let offset: string | undefined = undefined;
    var path = getCSVPath(); 
    if(path !== undefined){
        let jsonArray = await csv().fromStream(
            fs.createReadStream(<fs.PathLike> getCSVPath(), {
                encoding: 'utf8',
                start: 2,
            })
        );
        jsonArray.forEach( (row) =>{
            if(row.Name === 'ffat' || row.Name ==='spiffs'){
                size = row.Size;
                offset = row.Offset; 
            }
        });
        if(size !== undefined && offset !== undefined){
            return{
                size: size,
                offset: offset
            } as PartitionData;
        }
    }
    
    return undefined;
}

async function getParamFromGUI(): Promise<GUIParams | undefined>{


    const pick = vscode.window.showQuickPick;
    const fsOptions = ['Ffat', 'Spiff'];
    const loadOptions = ['Load default', 'Load empty', 'Cancel'];
    const uploadOptions = ['Usb', 'Ota', 'Just create'];


    let dataPath = await getDataPath();

    if(dataPath === undefined){
        vscode.window.showInformationMessage('Unable to find briki project');
        return undefined;
    }
    
    var fsChoice = await pick(  //choose filesystem window
        fsOptions, 
        {placeHolder: "Choose the filesystem"} as vscode.QuickPickOptions
    );
    if(fsChoice === undefined){
        vscode.window.showInformationMessage('You canceled the operation');
        return undefined;
    }


    if(!fs.existsSync(<fs.PathLike> dataPath)){  //data alredy do not exist
        var loadChoice = await pick(  //choose load option
            loadOptions, 
            {placeHolder: "Data not found"} as vscode.QuickPickOptions
        );
        
        switch(loadChoice){
            case undefined:
            case 'Cancel':
                vscode.window.showInformationMessage('You canceled the operation');
                return undefined;
            case 'Load default':
                dataPath = path.join(homedir, ".platformio", "packages", "framework-arduino-mbcwb", "data");
                break;
            case 'Load empty': 
                fs.mkdirSync(dataPath);
                break;
            default:
                vscode.window.showErrorMessage('An error has occured');
                return undefined;
        }    
    }
    
    var uploadChoice = await pick(  //choose upload method
        uploadOptions, 
        {placeHolder: "Choose how to upload"} as vscode.QuickPickOptions
    );
    if (uploadChoice === undefined){
        vscode.window.showInformationMessage('You canceled the operation');
        return undefined;
    }

    return {
        fsChoice: fsChoice, 
        dataPath: dataPath, 
        uploadChoice: uploadChoice} as GUIParams;
}

async function getOutputPath(): Promise<string | undefined> {
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;

    for (var i = folders.length - 1; i >= 0; i--){
        ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
        ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
        if (ini_file[Object.keys(ini_file)[0]].board.includes("briki") && ini_file[Object.keys(ini_file)[0]].board.includes("esp")){ // recognize if this is a briki-esp32 project
            return path.join(folders[i].uri.fsPath, ".pio", "build", Object.keys(ini_file)[0].slice(4), "briki_data.bin");
        }
    }
    return undefined;
}

function getExecutablePath(params: GUIParams): string | undefined {
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
    else if(params.fsChoice === 'Spiff' && process.platform === "darwin"){
        executable = path.join(executable, "mkspiff"); 
    }
    else if(params.fsChoice === 'Spiff' && process.platform === "win32"){
        executable = path.join(executable, "mkspiff.exe");
    }
    else if(params.fsChoice === 'Spiff' && process.platform === "linux"){
        executable = path.join(executable, "mkspiff.elf");
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

function getMbcToolPath(): string | undefined {
    var toolPath: string | undefined = undefined;
    if (process.platform === "win32"){
        return path.join(homedir, ".platformio", "packages", "tool-mbctool", "bin", "mbctool.exe");  
    }
    else{
        return path.join(homedir, ".platformio", "packages", "tool-mbctool", "bin", "mbctool");
    }
}

async function getUploadPort(): Promise<string | undefined>{
    try{
        let brikiPort : string | undefined = await new Promise((res, rej) => {
            exec('pio device list --json-output --serial', (err: string, stdout: string, stderr: string) => {
                if (err) {
                    rej(err);
                } else {
                    console.log(stdout);
                    let jsonObj = JSON.parse(stdout);
                    console.log(jsonObj);
                    jsonObj.forEach( (portObj: any) => {
                        console.log("hardware id" + portObj.hwid);
                        if(portObj.hwid.includes("VID:PID=3112:0001") || portObj.hwid.includes("VID:PID=3112:0002")){
                            return res(portObj.port);
                        }
                    });
                    rej(err);
                    console.log(`stderr: ${stderr}`);
                }
            });
        });
        return brikiPort;
    }
    catch{
        vscode.window.showErrorMessage("An error has occurred");
        return undefined;
    }
}

export async function partition(){  
    let [params, partitionData, outputFile] = await Promise.all([getParamFromGUI(), getPartitionData(), getOutputPath()]);

    if(params === undefined || partitionData === undefined || outputFile === undefined){
        return;
    }

    var partitionDim = partitionData.size;
    var partitionOffset = partitionData.offset;

    var executable = getExecutablePath(params);
    if(executable === undefined){
        vscode.window.showErrorMessage("Executable not found");
        return;
    }


    //launch command
    console.log(`${executable} ${outputFile} ${(<string> <unknown> (<number> <unknown> partitionDim/1024))} ${params.dataPath}`);
    var partionDimKB = <string> <unknown> (<number> <unknown> partitionDim/1024);
    try{
        //vscode.window.createTerminal("partition", executable, [outputFile, partionDimKB , params.dataPath]);

        await new Promise((res, rej) => {
            exec(`${executable} ${outputFile} ${partionDimKB} ${params?.dataPath}`, (err: string, stdout: string, stderr: string) => {
                if (err) {
                    rej(err);
                } else {
                    console.log(stdout);
                    console.log(`stderr: ${stderr}`);
                    return res() ;
                }
            });
        });
    }
    catch{
        vscode.window.showErrorMessage("An error has occurred during the creation of bin file");
        return undefined;
    }

    //upload
    if(params.uploadChoice === 'Ota'){
        var otaPath = getOtaPath();
        if(otaPath === undefined){
            vscode.window.showErrorMessage('Ota tool was not properly finded');
            return undefined;
        }
        vscode.window.createTerminal("brikiOta", otaPath, ["ESP32", outputFile]);
    }

    else if(params.uploadChoice === 'Usb'){
        var mbctool = getMbcToolPath();
        if(mbctool === undefined){
            vscode.window.showErrorMessage("Mbctool not founded");
            return undefined;
        }

        var uploadPort = await getUploadPort();
        console.log(uploadPort);
        if(uploadPort === undefined){
            vscode.window.showErrorMessage("Briki board not founded");
            return undefined;
        }        
        //vscode.window.createTerminal("mbctool", mbctool, ["--device", "esp", "--speed", "1500000", "--port", uploadPort, "--upload", partitionDim, outputFile]);

        vscode.window.showInformationMessage("Uploading ...");
        console.log(`${mbctool} --device esp --speed 1500000 --port ${uploadPort} --upload ${partitionOffset} ${outputFile}`);
        try{    
            await new Promise((res, rej) => {
                exec(`${mbctool} --device esp --speed 1500000 --port ${uploadPort} --upload ${partitionDim} ${outputFile}`, (err: string, stdout: string, stderr: string) => {
                    if (err) {
                        rej(err);
                    } else {
                        console.log(stdout);
                        console.log(`stderr: ${stderr}`);
                        return res();
                    }
                });
            });
            vscode.window.showInformationMessage("Data has uploaded to the board");
        }
        catch{
            vscode.window.showErrorMessage("An error as occurred during upload ");
            return undefined;
        }
    }

    else{
        vscode.window.showInformationMessage(`Data binary created at ${outputFile}`);
    }

}