import * as vscode from 'vscode';
import * as path from 'path';
import * as ini from 'ini';
import * as fs from 'fs';


const homedir = require('os').homedir();


export interface GUIParams {
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


export async function getParamFromGUI(): Promise<GUIParams | undefined>{
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
