import { FS } from '../../../_shared/fs/fs';
import { LOG } from '../../../_shared/log/log';
import { DEBUG_LOG, TEMPLATE, TEMPLATE_CONFIG } from './template.d';
import { getJSON } from '../../../_shared/convert/convert';
import { FileItem } from '../../..';
import { LogType } from '../../../_shared/log/log.config';

/**
 * 🎯 Create a debug log object
 * @returns {DEBUG_LOG} 📤 A new debug log object
 */
export const createDebugLog = (): DEBUG_LOG => ({
    warnings: [],
    errors: [],
    infos: [],
    success: true,
});

/**
 * 🎯 Get availbale templates
 * @param {string} templateFolder ➡️ Path to the template folder
 * @returns {TEMPLATE[]} 📤 Array of available templates
 */
export const getAvailableTemplates = (templateFolder: string): TEMPLATE[] => {
    const TEMPLATE_JSONS: string[] = FS.list(templateFolder, true).filter(
        (file) => !file.endsWith('.schema.json')
    );

    const TEMPLATES: TEMPLATE[] = TEMPLATE_JSONS.map((templatePath: string) => {
        const configStr: string = FS.readFile(templatePath) || '';
        const config: TEMPLATE_CONFIG = getJSON(configStr) as TEMPLATE_CONFIG;
        const name = config.name;
        const source = config.source;
        const baseProject = config.baseProject;
        const path = templatePath;
        return { name, baseProject, config, path, source };
    });
    if (TEMPLATES.length === 0) {
        LOG.FAIL(`No templates found in folder ${templateFolder}`);
    }
    return TEMPLATES;
};

/**
 * 🎯 Display available templates
 * @param {string} templateFolder ➡️ Path to the template folder
 * @returns {void} 📤 nothing
 */
export const displayAvailableTemplates = (templateFolder: string): void => {
    const templates = getAvailableTemplates(templateFolder);
    if (templates.length === 0) {
        LOG.DEFAULT(`- no TEMPLATES available -`);
        return;
    }
    // LOG.DEFAULT('Available templates:\n');
    for (const [index, template] of templates.entries()) {
        const name = template.name;
        const baseProject = template.baseProject;
        LOG.DEFAULT(`    👉 ${index + 1}. ${name} [${baseProject}]`);
    }
};

/**
 * 🎯 Get selected template
 * @param {string} templateFolder ➡️ Path to the template folder
 * @param {string} templateName ➡️ Name of the template to select
 * @returns {TEMPLATE|null} 📤 The selected template
 */
export const getSelectedTemplate = (
    templateFolder: string,
    templateName: string
): TEMPLATE | null => {
    const templates = getAvailableTemplates(templateFolder);
    const template = templates.find((t: TEMPLATE) => t.name === templateName);
    if (!template) {
        LOG.FAIL(
            `Template ${templateName} not found in folder ${templateFolder}`
        );
        return null;
        // process.exit(1);
    }
    return template;
};

/**
 * 🎯 Get final target folder
 * @param {string} targetFolder ➡️ Target folder entered by the user
 * @returns {string} 📤 Final target folder with year if needed
 */
export const getFinalTargetFolder = (targetFolder: string): string => {
    const folders = targetFolder.split('/').filter((f) => f.trim() !== '');
    const YEAR = new Date().getFullYear();
    let result = '';
    if (folders.length === 1) {
        result = `${YEAR}/${targetFolder}`;
    } else {
        result = targetFolder;
    }
    result = result.trim();
    result = result.replace(/^\//g, ''); // replace leading slash
    result = result.replace(/\/$/g, ''); // replace trailing slash
    return result;
};

/**
 * 🎯 Copy folder structure from template to target
 * @param {string} target ➡️ Target folder where the structure should be copied
 * @param {string} basePath ➡️ Base path of the template
 * @param {string} source ➡️ Source folder in the template to copy
 * @param {DEBUG_LOG} debugLog ➡️ Debug log to collect warnings and errors
 * @returns {void} 📤 nothing
 */
export const copyFolder = (
    target: string,
    basePath: string,
    source: string,
    debugLog: DEBUG_LOG
) => {
    // get files and folders from source
    const sourcePath = `${basePath}/${source}`;
    const items: FileItem[] = FS.listDetails(sourcePath, true);
    const targetPath = `${basePath}/${target}`;
    if (!FS.exists(sourcePath)) {
        debugLog.errors.push(`Source folder "${sourcePath}" does not exist.`);
        debugLog.success = false;
    } else if (!FS.exists(targetPath)) {
        FS.createFolder(targetPath);
        LOG.OK(`Created target folder ${targetPath}`);
    }
    for (const item of items) {
        const sourceFile = item.path;
        const relativeItem = sourceFile.replace(`${sourcePath}/`, '');
        const targetFile = `${targetPath}/${relativeItem}`;
        if (item.type === 'folder') {
            // creating empty folder, fileCreation already creates other folder
            if (!FS.exists(targetFile)) {
                FS.createFolder(targetFile);
                LOG.OK(`Created folder ${targetFile}`);
            }
        } else {
            copyFile(targetFile, sourceFile, debugLog);
        }
    }
};

/**
 * 🎯 Copy file from source to target
 * @param {string} targetFile ➡️ Target file path
 * @param {string} sourceFile ➡️ Source file path
 * @param {DEBUG_LOG} debuglog ➡️ Debug log to collect warnings and errors
 * @returns {void} 📤 nothing
 */
export const copyFile = (
    targetFile: string,
    sourceFile: string,
    debuglog: DEBUG_LOG
) => {
    if (!FS.exists(targetFile)) {
        if (FS.exists(sourceFile)) {
            FS.copyFile(sourceFile, targetFile);
        } else {
            debuglog.errors.push(`Source file ${sourceFile} does not exist.`);
            debuglog.success = false;
        }
    } else {
        debuglog.warnings.push(`Target file ${targetFile} already exists.`);
        debuglog.success = false;
    }
};

/**
 * 🎯 Copy folder structure from template to target
 * @param {string} target ➡️ Target folder where the structure should be copied
 * @param {TEMPLATE} template ➡️ Template containing the folder structure
 * @returns {DEBUG_LOG} 📤 Debug log with warnings and errors
 */
export const copyFolderStructure = (
    target: string,
    basePath: string,
    template: TEMPLATE
): DEBUG_LOG => {
    const source = template.source;
    const config = template.config;
    const debugLog: DEBUG_LOG = createDebugLog();
    if (!FS.exists(basePath)) {
        debugLog.errors.push(
            `Base project folder "${basePath}" does not exist.`
        );
        debugLog.success = false;
        return debugLog;
    }
    if (!FS.exists(`${basePath}/${source}`)) {
        debugLog.errors.push(
            `Source folder "${basePath}/${source}" does not exist.`
        );
        debugLog.success = false;
        return debugLog;
    }
    // copy Folders
    for (const folder of config.folders) {
        const sourceFolder = `${source}/${folder}`;
        const targetFolder = `${target}/${folder}`;
        if (!FS.exists(`${basePath}/${sourceFolder}`)) {
            FS.createFolder(`${basePath}/${targetFolder}`);
            LOG.OK(`Created empty target folder ${targetFolder}`);
        } else {
            copyFolder(targetFolder, basePath, sourceFolder, debugLog);
        }
    }

    // copyFolders(target, config.folders, basePath, debugLog);
    for (const file of config.files) {
        const targetfile = `${basePath}/${target}/${file}`;
        const sourceFile = `${basePath}/${source}/${file}`;
        copyFile(targetfile, sourceFile, debugLog);
    }
    return debugLog;
};
/**
 * 🎯 Display logs with correct format
 * @param {string[]} logs ➡️ Array of log messages to display
 * @param {LogType} type ➡️ Type of log (e.g. OK, FAIL, WARN)
 * @returns {void} 📤 nothing
 */
export const displayLogs = (logs: string[], type: LogType) => {
    for (const log of logs) {
        LOG[type](log);
    }
};
