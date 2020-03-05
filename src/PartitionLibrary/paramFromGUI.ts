import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {getDataPath} from './paths';

const homedir = require('os').homedir();


export interface GUIParams {
    fsChoice: string;
    dataPath: string; 
    uploadChoice: string;
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
