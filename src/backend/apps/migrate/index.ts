import { argv } from 'process';
import { command } from '../../_shared/cmd/cmd';
import { LOG } from '../../_shared/log/log';
import { FS } from '../../_shared/fs/fs';

import promptSync from 'prompt-sync';
import {
    copyFolderStructure,
    displayAvailableTemplates,
    displayLogs,
    getAvailableTemplates,
    getSelectedTemplate,
} from './template/template';
import { getHome } from '../../_shared/system/system';
import { LogType } from '../../_shared/log/log.config';

const prompt = promptSync();
const PWD = command('pwd');
const TAB = '    ';
const HOME = getHome();

let TARGET_FOLDER = argv[2]; // || 'dist';
// const ROOT_FOLDER = '~/dev';
const DEV_FOLDER = `${HOME}/dev`;
// get home path

LOG.OK('Migration started');
if (!TARGET_FOLDER) {
    TARGET_FOLDER = prompt('Enter target folder: ');
}
LOG.INFO(PWD);
// LOG.INFO(`Source: ${SOURCE}`);
LOG.OK(`Target: ${TARGET_FOLDER}`);

const TEMPLATE_FOLDER = 'src/_data/templates';
if (!FS.exists(TEMPLATE_FOLDER)) {
    LOG.FAIL(`Template folder ${TEMPLATE_FOLDER} does not exist`);
    process.exit(1);
}

const TEMPLATES = getAvailableTemplates(TEMPLATE_FOLDER);
const TEMPLATE_NAMES = TEMPLATES.map((t: any) => t.name);

LOG.INFO('Available templates:');
displayAvailableTemplates(TEMPLATE_FOLDER);
const templateID = prompt(`\n${TAB}Select template: `);
const templateName = TEMPLATE_NAMES[Number(templateID) - 1];
if (!TEMPLATE_NAMES.includes(templateName)) {
    LOG.FAIL(`Invalid template name: ${templateName}`);
    process.exit(1);
}
const SELECTED_TEMPLATE = getSelectedTemplate(TEMPLATE_FOLDER, templateName);
if (!SELECTED_TEMPLATE) {
    LOG.FAIL(`Template ${templateName} not found`);
    process.exit(1);
}
LOG.OK(`${TAB}Selected template: ${templateName}`);

const CONFIG = SELECTED_TEMPLATE.config;
LOG.INFO(`Base project: ${CONFIG.folders}`);

// copy folders
const TARGET = `${DEV_FOLDER}/${TARGET_FOLDER}`;

LOG.INFO(`target folder is: ${TARGET}`);
LOG.INFO(`source folder is: ${SELECTED_TEMPLATE.source}`);
LOG.INFO(`template: ${SELECTED_TEMPLATE.name}`);

const result = copyFolderStructure(
    TARGET_FOLDER,
    DEV_FOLDER,
    SELECTED_TEMPLATE
);
const isCreated = result.success;
if (isCreated) {
    LOG.OK(`Folder structure created successfully at ${TARGET}`);
} else {
    displayLogs(result.warnings, LogType.WARN);
    displayLogs(result.errors, LogType.FAIL);
}
