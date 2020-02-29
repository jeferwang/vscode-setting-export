import * as vscode from "vscode";
import { readFile, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { ExtensionContext } from "vscode";
import { getPathInfo } from "./filePath";
import { resolve } from "path";


const getUserSettings = function (context: ExtensionContext) {
    const settingsJson = readFileSync(getPathInfo(context).USER_SETTING_PATH, 'utf-8');
    return settingsJson;
};
const restoreUserSettings = function (context: ExtensionContext, userSettingData: string) {
    writeFileSync(getPathInfo(context).USER_SETTING_PATH, userSettingData);
};

const getKeyBinding = function (context: ExtensionContext) {
    const settingsJson = readFileSync(getPathInfo(context).USER_KEYBINDING_PATH, 'utf-8');
    return settingsJson;
};
const restoreKeyBinding = function (context: ExtensionContext, keyBindingData: string) {
    writeFileSync(getPathInfo(context).USER_KEYBINDING_PATH, keyBindingData);
};

const getExtensionList = function (context: ExtensionContext) {
    const res = vscode.extensions.all
        .filter(e => !e.packageJSON.isBuiltin)
        .map(e => {
            return {
                id: e.id,
                uuid: e.packageJSON.uuid,
                name: e.packageJSON.name,
                publisher: e.packageJSON.publisher,
                version: e.packageJSON.version,
            };
        });
    return res;
};

const restoreExtensionList = async function (context: ExtensionContext, extList: [{ [key: string]: { [key: string]: string } }]) {
    for (let i = 0; i < extList.length; i++) {
        const extInfo = extList[i];
        vscode.window.showInformationMessage(`正在安装：${extInfo.name}`);
        await vscode.commands.executeCommand(
            "workbench.extensions.installExtension",
            `${extInfo.publisher}.${extInfo.name}`
        );
    }
};


const getSnippets = function (context: ExtensionContext) {
    const snippetsDir = getPathInfo(context).USER_SNIPPETS_DIR_PATH;
    const res: { [key: string]: string } = {};
    readdirSync(snippetsDir)
        .map(fileName => {
            return {
                name: fileName,
                path: resolve(snippetsDir, fileName),
            };
        })
        .filter(info => {
            return !statSync(info.path).isDirectory()
                && /^.+\.json$/i.test(info.path);
        }).forEach(info => {
            res[info.name] = readFileSync(info.path, 'utf-8');
        });
    return res;
};

const restoreSnippets = function (context: ExtensionContext, snippets: { [key: string]: string }) {
    const snippetsDir = getPathInfo(context).USER_SNIPPETS_DIR_PATH;

    Object.keys(snippets).forEach(fName => {
        writeFileSync(resolve(snippetsDir, fName), snippets[fName]);
    });
};


export const exportSetting = async function (context: ExtensionContext): Promise<boolean> {
    const resData = JSON.stringify({
        'settings.json': getUserSettings(context),
        'keybindings.json': getKeyBinding(context),
        'extensionList': getExtensionList(context),
        'snippets': getSnippets(context),
    });

    const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file('vscode-setting-export.json') });
    if (!uri) {
        return false;
    }
    writeFileSync(uri.fsPath, resData);
    return true;
};

export const importSetting = async function (context: ExtensionContext): Promise<boolean> {
    const uris = await vscode.window.showOpenDialog({
        canSelectMany: false,
        canSelectFolders: false,
        filters: {
            json: ['json']
        }
    });
    if (!uris || !uris.length) {
        return false;
    }
    const dataStr = readFileSync(uris[0].fsPath, 'utf-8');
    if (!dataStr) {
        vscode.window.showInformationMessage('导入失败');
        return false;
    }
    const data: IJsonData = JSON.parse(dataStr);
    if (data["settings.json"]) {
        await restoreUserSettings(context, data["settings.json"]);
    }
    if (data["keybindings.json"]) {
        await restoreUserSettings(context, data["keybindings.json"]);
    }
    if (data.snippets) {
        await restoreSnippets(context, data.snippets);
    }
    if (data["extensionList"]) {
        await restoreExtensionList(context, data["extensionList"]);
    }
    vscode.commands.executeCommand("workbench.action.reloadWindow");
    return true;
};


interface IJsonData {
    'settings.json'?: string;
    'keybindings.json'?: string;
    'extensionList'?: [{ [key: string]: { [key: string]: string } }];
    'snippets'?: { [key: string]: string };
}
