import * as vscode from 'vscode';
import * as ini from 'ini';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csv-parser';

const pick = vscode.window.showQuickPick;


interface Params {
    fsChoice: string;
    dataPath: string; 
    uploadChoice: string;
}



async function findDataPath(): Promise<string | undefined>{
    var folders = vscode.workspace.workspaceFolders || [];
    var ini_file : any;
    var ini_file_path : string;
    var key: string;
    
    for (var i = folders.length - 1; i >= 0; i--){
        ini_file_path = path.join(folders[i].uri.fsPath, "platformio.ini");
        ini_file = ini.parse(fs.readFileSync(ini_file_path, 'utf-8'));
        key = Object.keys(ini_file)[0];
        if (key.includes("briki") && key.includes("esp32")){ // recognize if this is a briki-esp32 project
            return ini_file[key].data_dir ??  path.join(folders[i].uri.fsPath, "data"); //return user selected data folder if exist or default one            
        }
    }
    return undefined;
}


//da testare
function getCSVPath(): string | undefined{
    const homedir = require('os').homedir();
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
                return path.join(homedir, ".platformio", "packages", "framework-arduino-briki", "tools", "partitions", ini_file[key].board_build.partition);
            }
        });
    }
    return path.join(homedir, ".platformio", "packages", "framework-arduino-briki", "tools", "partitions", "default_8MB.csv");
}


//da testare
async function getPartitionDim(): Promise <number | undefined>{
    var results: any[];
    fs.createReadStream(<fs.PathLike> getCSVPath())
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            results.forEach( (row) =>{
                if(row.Name === 'ffat' || row.Name === 'spiff'){
                    return row.Size;
                }
            });
        });
    return undefined;
}


async function getParamFromGUI(): Promise<Params | undefined>{
    const fsOptions = ['Fat', 'Spiff'];
    const loadOptions = ['Load default', 'Load empty', 'Cancel'];
    const uploadOptions = ['Usb', 'Ota', 'Just create'];
    
    var fsChoice = await pick(  //choose filesystem window
        fsOptions, 
        {placeHolder: "Choose the filesystem"} as vscode.QuickPickOptions
    );
    if(fsChoice === undefined){
        vscode.window.showInformationMessage('You canceled the operation');
        return undefined;
    }


    let dataPath = await findDataPath();

    if(dataPath === undefined){  //data alredy do not exist
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
                // da implementare
                break;
            case 'Load empty':
                //da implementare
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
        uploadChoice: uploadChoice} as Params;
}



//scrivere i comandi
export async function partition(){
    let [params, partitionDim] = await Promise.all([getParamFromGUI(), getPartitionDim()]);
    if(params === undefined || partitionDim === undefined){
        return;
    } 
    
}