import { getAppDirectory, readFilesRecursively } from "./_shared/fs/fs";

console.log("foobaxr")

const folders = readFilesRecursively(
    process.cwd(),
    6,
    []
);
const appRoot = getAppDirectory('.', folders.map(folder => folder.path));
// const appRoot = getAppDirectory(process.cwd(), folders);
console.log(appRoot);
// console.log(appRoot[0]);
console.log(folders);