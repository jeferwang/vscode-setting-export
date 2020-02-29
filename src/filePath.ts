import { resolve } from "path";
import { ExtensionContext } from "vscode";
import { exists, statSync, existsSync, mkdirSync } from "fs";

const checkAndFixDir = function (path: string): boolean {
    if (!existsSync(path)) {
        mkdirSync(path);
        return true;
    } else {
        if (!statSync(path).isDirectory()) {
            return false;
        }
        return true;
    }
};


export const getPathInfo = function (context: ExtensionContext) {
    const CODE_DIR_PATH: string = resolve(context.globalStoragePath, '../../..');
    const USER_DIR_PATH: string = resolve(CODE_DIR_PATH, './User');
    const USER_SNIPPETS_DIR_PATH: string = resolve(USER_DIR_PATH, './snippets');
    const USER_SETTING_PATH: string = resolve(USER_DIR_PATH, './settings.json');
    const USER_KEYBINDING_PATH: string = resolve(USER_DIR_PATH, './keybindings.json');

    [CODE_DIR_PATH, USER_DIR_PATH, USER_SNIPPETS_DIR_PATH].forEach(d => checkAndFixDir(d));

    return {
        CODE_DIR_PATH,
        USER_DIR_PATH,
        USER_SETTING_PATH,
        USER_SNIPPETS_DIR_PATH,
        USER_KEYBINDING_PATH,
    };
};
