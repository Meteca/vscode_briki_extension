import * as vscode from 'vscode';
import {getOtaPath} from './PartitionLibrary/paths';
import {getParamFromGUI} from './PartitionLibrary/paramFromGUI';
import {getPartitionData} from './PartitionLibrary/partitionData';
import {getExecutablePath, getMbcToolPath, getOutputPath, getPioPath, getProject} from './PartitionLibrary/paths';


const { exec } = require('child_process');


async function getUploadPort(): Promise<string | undefined>{
    try{
        let brikiPort : string | undefined = await new Promise((res, rej) => {
            console.log(`${getPioPath()} device list --json-output --serial`);           
            exec(`${getPioPath()} device list --json-output --serial`, (err: string, stdout: string, stderr: string) => {
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
    var project = getProject();
    if (project === undefined){
        return undefined;
    }
    let [params, partitionData, outputFile] = await Promise.all([getParamFromGUI(project), getPartitionData(project), getOutputPath(project)]);
    
    console.log("ho risolto le promesse");
    if(params === undefined || partitionData === undefined || outputFile === undefined){
        console.log("qualche undefined");
        return;
    }

    var partitionDim = partitionData.size;
    var partitionOffset = partitionData.offset;
    var partitionType = partitionData.type;

    var executable = getExecutablePath(params);
    if(executable === undefined){
        vscode.window.showErrorMessage("Executable not found");
        return;
    }

    if(partitionType.toLowerCase() !== params.fsChoice.toLowerCase()){
        vscode.window.showErrorMessage(`You selected ${params.fsChoice} but your partition table uses ${partitionType}`);
        return;
    }


    //launch command
    let command: string;
    if(params.fsChoice === 'Ffat'){
        let partitionDimKB = <string> <unknown> (<number> <unknown> partitionDim/1024);
        command = `${executable} ${outputFile} ${partitionDimKB} ${params?.dataPath}`;
    }
    else {
        command = `${executable} -c ${params?.dataPath} -p 256 -b 4096 -s ${partitionDim} ${outputFile}`;
    }
    console.log(command);

    try{
        await new Promise((res, rej) => {
            console.log(command);
            exec(command, (err: string, stdout: string, stderr: string) => {
                if (err) {
                    rej(err);
                } else {
                    console.log(stdout);
                    console.log(`stderr: ${stderr}`);
                    if(stderr !== undefined && stderr !== "" && stderr !== " "){
                        return rej(err);
                    }
                    return res();
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
            vscode.window.showErrorMessage('Ota tool not found');
            return undefined;
        }
        vscode.window.createTerminal("brikiOta", otaPath, ["SPIFFS", outputFile]);
    }

    else if(params.uploadChoice === 'Usb'){
        var mbctool = getMbcToolPath();
        if(mbctool === undefined){
            vscode.window.showErrorMessage("Mbctool not found");
            return undefined;
        }

        var uploadPort = await getUploadPort();
        if(uploadPort === undefined){
            vscode.window.showErrorMessage("Briki board not found");
            return undefined;
        }        

        vscode.window.showInformationMessage("Uploading ...");
        
        try{    
            await new Promise((res, rej) => {
                console.log(`${mbctool} --device esp --speed 1500000 --port ${uploadPort} --upload ${partitionOffset} ${outputFile}`);
                exec(`${mbctool} --device esp --speed 1500000 --port ${uploadPort} --upload ${partitionOffset} ${outputFile}`, (err: string, stdout: string, stderr: string) => {
                    console.log(`${mbctool} --device esp --speed 1500000 --port ${uploadPort} --upload ${partitionOffset} ${outputFile}`);
                    if (err) {
                        rej(err);
                    } else {
                        console.log(stdout);
                        console.log(`stderr: ${stderr}`);
                        if(stderr !== undefined && stderr !== "" && stderr !== " "){
                            return rej(stderr);
                        }
                        return res();
                    }
                });
            });
            vscode.window.showInformationMessage("Data has been uploaded to the board");
        }
        catch{
            vscode.window.showErrorMessage("An error as occurred during the upload");
            return undefined;
        }
    }

    else{
        vscode.window.showInformationMessage(`Data binary created at ${outputFile}`);
    }

}
