import * as vscode from 'vscode';
import * as csv from 'csvtojson';
import * as fs from 'fs';
import {getCSVPath} from './paths';

export interface PartitionData {
    size: string;
    offset: string;
    type: string;
}


export async function getPartitionData(): Promise<PartitionData | undefined>{
    let size: string | undefined = undefined;
    let offset: string | undefined = undefined;
    let type: string | undefined = undefined;
    var path = getCSVPath();
    console.log(path) 
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
                type = row.Name; 
            }
        });
        if(size !== undefined && offset !== undefined && type !== undefined){
            return{
                size: size,
                offset: offset,
                type: type
            } as PartitionData;
        }
        else{
            vscode.window.showErrorMessage("No valid partition table was found");
        }
    }
    
    return undefined;
}
