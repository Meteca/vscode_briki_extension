import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as tmp from 'tmp';
import {getDataPath, BrikiProject} from './paths';


const homedir = require('os').homedir();


export interface GUIParams {
    fsChoice: string;
    dataPath: string; 
    uploadChoice: string;
}


export async function getParamFromGUI(project: BrikiProject): Promise<GUIParams | undefined>{
    const pick = vscode.window.showQuickPick;
    const fsOptions = ['Ffat', 'Spiffs'];
    const loadOptions = ['Load default', 'Load empty', 'Cancel'];
    const uploadOptions = ['Usb', 'Ota', 'Just create'];

    let dataPath = await getDataPath(project);
    if(dataPath === undefined){
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
                dataPath = tmp.dirSync({ mode: 0o0777, prefix: 'brikiTmpDir_' }).name;
                break;
            case 'Load empty': 
                var extensionPath = vscode.extensions.getExtension("meteca.briki-extension")?.extensionPath;
                if (extensionPath === undefined){
                    return undefined;
                }
                dataPath = path.join(extensionPath, "empty");
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
