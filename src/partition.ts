import * as vscode from 'vscode';
import * as ini from 'ini';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csvtojson';
import {getOtaPath} from './brikiOta';

const homedir = require('os').homedir();


interface GUIParams {
    fsChoice: string;
    dataPath: string; 
    uploadChoice: string;
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

//aggiornare path con quello definitivo
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

async function getPartitionDim(): Promise <string | undefined>{
    let size: string | undefined = undefined;
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
            }
        });
    }
    return size;
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
                vscode.window.showInformationMessage('An error has occured');
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


//da testare
function getExecutablePath(params: GUIParams):  string | undefined {
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
        vscode.window.showInformationMessage('Error with partition binary');
        return undefined;
    }
    

}


function getMbcToolPath(): string | undefined {
    return path.join(homedir, ".platformio", "package", "tool-mbctool", "bin", "mbctool");
}




//upload
export async function partition(){  
    let [params, partitionDim, outputFile] = await Promise.all([getParamFromGUI(), getPartitionDim(), getOutputPath()]);
    if(params === undefined || partitionDim === undefined || outputFile === undefined){
        return;
    }

    var executable = getExecutablePath(params);
    if(executable === undefined){
        vscode.window.showInformationMessage("Executable not found");
        return;
    }

    //launch command
    console.log(`${executable} ${outputFile} ${partitionDim} ${params.dataPath}`);
    vscode.window.createTerminal("partition", executable, [outputFile, partitionDim, params.dataPath]);

    //upload

    if(params.uploadChoice === 'Ota'){
        var otaPath = getOtaPath();
        if(otaPath === undefined){
            vscode.window.showInformationMessage('Ota tool was not properly finded');
            return undefined;
        }
        vscode.window.createTerminal("brikiOta", otaPath, ["ESP32", outputFile]);
    }

    else if(params.uploadChoice === 'Usb'){
        var mbctool = getMbcToolPath();
        if(mbctool === undefined){
            vscode.window.showInformationMessage("Mbctool not founded");
            return undefined;
        }
        //vscode.window.createTerminal("mbctool", mbctool, []);
    }

    else{
        vscode.window.showInformationMessage('Data binary created');
    }

}