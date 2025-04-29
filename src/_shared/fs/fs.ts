import fs from 'fs';
import path from 'path';

const ignoreFolders = [
    '.git',
    'node_modules',
    '.cache',
    '.vscode-server',
    '.npm'
];

export const getAppDirectory = (directory: string, fileList: string[]) => {
    const apps = fileList
        .filter((file: any) => file.type === 'file')
        .filter((file: any) => file.path.indexOf('package.json') > -1)
        .map((file: any) => {
            return file.path.replace('package.json', '');
        });
    const folders: string[] = apps.map((app) =>
        app
            .replace(directory, '')
            .replace(/\/$/, '')
            .replace(/^\//, '')
            .split('/')
            .slice(0, -1)
            .join('/')
           
    ); //.filter((folder) => folder !== '');
    console.log('folders', folders);
    const firstLevelFolders: string[] = [];
    const result: { [key: string]: { name: string; path: string }[] } = {};
    for (const folder of folders) {
        const folderName: string = folder
            .replace(/\/$/, '')
            .replace(`${directory}/`, '')
            .split('/')[0];
        if (firstLevelFolders.indexOf(folderName) === -1) {
            firstLevelFolders.push(folderName);
        }
    }
    for (const firstLevelFolder of firstLevelFolders.sort()) {
        if (!result[firstLevelFolder]) {
            result[firstLevelFolder] = [];
        }
        for (const app of apps) {
            if (app.indexOf(firstLevelFolder) > -1) {
                const appName = app.replace(/\/$/, '').split('/').pop();
                const appPath = app
                    // .replace(directory, '')
                    .replace(/\/$/, '');
                result[firstLevelFolder].push({ name: appName, path: appPath });
            }
        }
    }
    return result;
    // }
};

export const readFilesRecursively = (
    dir: string,
    limit: number = -1,
    fileList: { path: string; type: 'file' | 'folder' }[] = []
) => {
    const hasLimit = limit > -1;
    const files = fs
        .readdirSync(dir)
        .filter((file) => ignoreFolders.indexOf(file) === -1);
    const filePathes = files.map((file) => path.join(dir, file));
    filePathes.forEach((filePath) => {
        const currentLevel = filePath.split('/').length;
        if (hasLimit && currentLevel > limit) {
            return;
        }

        if (fs.statSync(filePath).isDirectory()) {
            readFilesRecursively(filePath, limit, fileList);
            fileList.push({ path: filePath, type: 'folder' });
        } else {
            fileList.push({ path: filePath, type: 'file' });
        }
    });
    return fileList;
};
