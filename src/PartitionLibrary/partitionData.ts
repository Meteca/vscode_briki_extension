import * as vscode from 'vscode';
import * as ini from 'ini';
import * as path from 'path';
import * as csv from 'csvtojson';
import * as fs from 'fs';


const homedir = require('os').homedir();


export interface PartitionData {
    size: string;
    offset: string;
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

export async function getPartitionData(): Promise<PartitionData | undefined>{
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
