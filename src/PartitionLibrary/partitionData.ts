import * as vscode from 'vscode';
import * as csv from 'csvtojson';
import * as fs from 'fs';
import {getCSVPath} from './paths';

export interface PartitionData {
    size: string;
    offset: string;
}


export async function getPartitionData(): Promise<PartitionData | undefined>{
    let size: string | undefined = undefined;
    let offset: string | undefined = undefined;
    var path = getCSVPath(); 
    if(path === undefined){
        await vscode.window.showErrorMessage("No partition table was found");
    }
    else{
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
        else{
            vscode.window.showErrorMessage("No valid partition table was found");
        }
    }
    
    return undefined;
}
