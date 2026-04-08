import { DEBUG_LOG, TEMPLATE, TEMPLATE_CONFIG } from './template.d';
import {
    copyFolderStructure,
    copyFile,
    copyFolder,
    displayAvailableTemplates,
    getAvailableTemplates,
    getFinalTargetFolder,
    getSelectedTemplate,
    createDebugLog,
    displayLogs,
} from './template';
import * as mock from 'mock-fs';
import { FS } from '../../../_shared/fs/fs';
import { setupSpyLog } from '../../../_shared/log/log.test_lib';
import { FileItem } from '../../../index.d';
import { LogType } from '../../../_shared/log/log.config';

const createSampleConfig = (key: string) => {
    return {
        name: key,
        version: '0.0.1',
        description: `${key} template`,
        author: 'John Doe',
        baseProject: `${key}-test`,
        source: `template/${key}`,
        files: ['foo/index.html', 'main.js'],
        folders: ['src', 'public'],
        renames: [{ from: '2024', to: '2025' }],
    };
};

describe('with FS mock', () => {
    const SAMPLE_CONFIG: TEMPLATE_CONFIG = createSampleConfig('vue');
    const ANGULAR_CONFIG: TEMPLATE_CONFIG = createSampleConfig('angular');
    let spyLog = setupSpyLog();
    beforeEach(() => {
        const content: string = JSON.stringify(SAMPLE_CONFIG);
        mock({
            templates: {
                'vue.json': content,
                'some.schema.json': '{}',
                specific: {
                    'other.json': JSON.stringify(ANGULAR_CONFIG),
                },
            },
            'empty-folder': {},
        });
    });
    afterEach(() => {
        mock.restore();
    });
    describe('getAvailableTemplates()', () => {
        const FN = getAvailableTemplates;
        it('should return an empty array if no templates are available', () => {
            const FOLDER = 'xyz-folder';
            const templates = FN(FOLDER);
            expect(templates).toEqual([]);
        });
        it('should return an array of templates', () => {
            const FOLDER = 'templates';
            const templates = FN(FOLDER);
            const EXPECTED: TEMPLATE[] = [
                {
                    name: 'angular',
                    path: 'templates/specific/other.json',
                    baseProject: 'angular-test',
                    source: 'template/angular',
                    config: ANGULAR_CONFIG,
                },
                {
                    name: 'vue',
                    path: 'templates/vue.json',
                    baseProject: 'vue-test',
                    source: 'template/vue',
                    config: SAMPLE_CONFIG,
                },
            ];
            expect(templates).toEqual(EXPECTED);
        });
    });
    describe('displayAvailableTemplates()', () => {
        const FOLDER = 'templates';
        const FN = displayAvailableTemplates;
        it('should log a message if no templates are available', () => {
            const EMPTY_FOLDER = 'invalid-folder';
            FN(EMPTY_FOLDER);
            expect(spyLog).hasDEFAULT('- no TEMPLATES available -');
        });
        it('should display available templates', () => {
            FN(FOLDER);
            expect(spyLog).hasDEFAULT('    👉 1. angular [angular-test]');
            expect(spyLog).hasDEFAULT('    👉 2. vue [vue-test]');
        });
        // Add tests for displayAvailableTemplates if needed
    });
    describe('getSelectedTemplate()', () => {
        const FOLDER = 'templates';
        const FN = getSelectedTemplate;
        it('should return the selected template', () => {
            const template = FN(FOLDER, 'vue');
            const EXPECTED: TEMPLATE = {
                name: 'vue',
                path: 'templates/vue.json',
                baseProject: 'vue-test',
                source: 'template/vue',
                config: SAMPLE_CONFIG,
            };
            expect(template).toEqual(EXPECTED);
        });
        it('should log an error if the template is not found', () => {
            const INVALID_TEMPLATE = 'invalid-template';
            expect(FN(FOLDER, INVALID_TEMPLATE)).toEqual(null);
            expect(spyLog).hasFAIL(
                `Template ${INVALID_TEMPLATE} not found in folder ${FOLDER}`
            );
        });
    });
    describe('getFinalTargetFolder()', () => {
        const FN = getFinalTargetFolder;
        const TARGET = 'my-project';
        const YEAR = new Date().getFullYear();
        const FINAL_FOLDER = `${YEAR}/${TARGET}`;
        it('should return the target folder if it already contains a year', () => {
            expect(FN(FINAL_FOLDER)).toBe(FINAL_FOLDER);
        });
        it('should prepend the current year to the target folder if it has one folder', () => {
            expect(FN(TARGET)).toEqual(FINAL_FOLDER);
        });
        it('should return the target folder if it has multiple folders', () => {
            const TARGET_FOLDER = 'projects/my-project';
            expect(FN(TARGET_FOLDER)).toEqual(TARGET_FOLDER);
        });
        it('should trim whitespaces and wrong slashes', () => {
            expect(FN(`  ${FINAL_FOLDER}/  `)).toEqual(`${FINAL_FOLDER}`);
        });
    });
    describe('copyFolder()', () => {
        const FN = copyFolder;
        const target = 'target';
        const source = 'template';
        const basePath = 'dev';
        const targetPath = `${basePath}/${target}`;
        const template = {
            blubber: {
                foo: {
                    'test.html': 'content',
                },
                lorem: {},
            },
            'other-test.csv': 'content',
        };
        it('should create the folder structure based on the template config', () => {
            mock({
                dev: {
                    template,
                    'no-copy.txt': 'content',
                },
            });
            const EXISTING: FileItem[] = [];
            const EXPECTED: FileItem[] = [
                { path: 'dev/target/blubber/foo/test.html', type: 'file' },
                { path: 'dev/target/blubber/foo', type: 'folder' },
                { path: 'dev/target/blubber/lorem', type: 'folder' },
                { path: 'dev/target/blubber', type: 'folder' },
                { path: 'dev/target/other-test.csv', type: 'file' },
            ];
            const debugLog = createDebugLog();
            expect(FS.listDetails(targetPath, true)).toEqual(EXISTING);
            FN(target, basePath, source, debugLog);
            expect(FS.listDetails(targetPath, true)).toEqual(EXPECTED);
            expect(debugLog.success).toEqual(true);
        });
        it('should create the folder structure based on the template config with existing file in target', () => {
            mock({
                dev: {
                    template,
                    target: {
                        'existing-file.txt': 'content',
                    },
                    'no-copy.txt': 'content',
                },
            });
            const EXISTING: FileItem[] = [
                { path: 'dev/target/existing-file.txt', type: 'file' },
            ];
            const EXPECTED: FileItem[] = [
                { path: 'dev/target/blubber/foo/test.html', type: 'file' },
                { path: 'dev/target/blubber/foo', type: 'folder' },
                { path: 'dev/target/blubber/lorem', type: 'folder' },
                { path: 'dev/target/blubber', type: 'folder' },
                ...EXISTING,
                { path: 'dev/target/other-test.csv', type: 'file' },
            ];
            const debugLog = createDebugLog();
            expect(FS.listDetails(targetPath, true)).toEqual(EXISTING);
            FN(target, basePath, source, debugLog);
            expect(FS.listDetails(targetPath, true)).toEqual(EXPECTED);
            expect(debugLog.warnings).toEqual([]);
            expect(debugLog.success).toEqual(true);
        });
        it('should not create the folder structure based on the template config if one file already exists', () => {
            mock({
                dev: {
                    template,
                    target: {
                        'other-test.csv': 'contentOther',
                    },
                    'no-copy.txt': 'content',
                },
            });
            const EXISTING: FileItem[] = [
                { path: 'dev/target/other-test.csv', type: 'file' },
            ];
            const EXPECTED: FileItem[] = [
                { path: 'dev/target/blubber/foo/test.html', type: 'file' },
                { path: 'dev/target/blubber/foo', type: 'folder' },
                { path: 'dev/target/blubber/lorem', type: 'folder' },
                { path: 'dev/target/blubber', type: 'folder' },
                ...EXISTING,
            ];
            const debugLog = createDebugLog();
            expect(FS.listDetails(targetPath, true)).toEqual(EXISTING);
            FN(target, basePath, source, debugLog);
            expect(FS.listDetails(targetPath, true)).toEqual(EXPECTED);
            expect(debugLog.warnings).toEqual([
                `Target file ${targetPath}/other-test.csv already exists.`,
            ]);
            expect(debugLog.success).toEqual(false);
        });
        it('should not create the folder structure based on the template config if a folder not exists', () => {
            mock({
                dev: {
                    'no-copy.txt': 'content',
                },
            });
            const EXISTING: FileItem[] = [];
            const EXPECTED: FileItem[] = [];
            const debugLog = createDebugLog();
            expect(FS.listDetails(targetPath, true)).toEqual(EXISTING);
            FN(target, basePath, source, debugLog);
            expect(FS.listDetails(targetPath, true)).toEqual(EXPECTED);
            expect(debugLog.warnings).toEqual([]);
            expect(debugLog.errors).toEqual([
                `Source folder "${basePath}/${source}" does not exist.`,
            ]);
            expect(debugLog.success).toEqual(false);
        });
    });

    describe('copyFile()', () => {
        const FN = copyFile;
        const sourceFile: string = 'template/file1.txt';
        const targetFile: string = 'target/file1.txt';
        it('should copy file if source file exists', () => {
            mock({
                // source: {
                template: {
                    'file1.txt': 'content',
                },
                // template: {},
            });
            const debugLog = createDebugLog();
            FN(targetFile, sourceFile, debugLog);
            const EXPECTED: FileItem[] = [
                { path: 'target/file1.txt', type: 'file' },
            ];
            expect(FS.listDetails('target', true)).toEqual(EXPECTED);
            expect(debugLog.success).toEqual(true);
            expect(debugLog.errors).toEqual([]);
        });
        it('should not copy file if source file not exists', () => {
            mock({
                // wrong folder name
                source: {
                    'file1.txt': 'content',
                },
                // template: {},
            });
            const debugLog = createDebugLog();
            FN(targetFile, sourceFile, debugLog);
            const EXPECTED: FileItem[] = [
                // { path: 'target/file1.txt', type: 'file' },
            ];
            expect(FS.listDetails('target', true)).toEqual(EXPECTED);
            expect(debugLog.success).toEqual(false);
            expect(debugLog.errors).toEqual([
                `Source file ${sourceFile} does not exist.`,
            ]);
        });
    });

    describe('copyFolderStructure()', () => {
        const FN = copyFolderStructure;
        const TEMPLATE: TEMPLATE = {
            name: 'angular',
            path: 'templates/specific/other.json',
            baseProject: 'angular-test',
            source: 'template',
            config: ANGULAR_CONFIG,
        };
        const template = {
            src: {
                'some-file.js': 'content of js',
            },
            public: { 'index.html': 'Hello World' },
            'main.js': 'content1',
            foo: { 'index.html': 'content' },
        };
        const template2 = {
            src: {
                'some-file.js': 'content of js',
            },
            'main.js': 'content1',
            foo: { 'index.html': 'content' },
        };
        const target = 'target';
        const basePath = 'dev';
        const TARGET_FOLDER = `${basePath}/${target}`;
        const BASE: FileItem[] = [
            { path: 'dev/target/foo/index.html', type: 'file' },
            { path: 'dev/target/foo', type: 'folder' },
            { path: 'dev/target/main.js', type: 'file' },
        ];
        const SRC: FileItem[] = [
            { path: 'dev/target/src/some-file.js', type: 'file' },
            { path: 'dev/target/src', type: 'folder' },
        ];
        const EXPECTED: FileItem[] = [
            ...BASE,
            { path: 'dev/target/public/index.html', type: 'file' },
            { path: 'dev/target/public', type: 'folder' },
            ...SRC,
        ];
        const EXPECTED2: FileItem[] = [
            ...BASE,
            // { path: 'dev/target/public/index.html', type: 'file' },
            { path: 'dev/target/public', type: 'folder' },
            ...SRC,
        ];
        it('should copy files from base project to target folder', () => {
            mock({ dev: { template } });
            const debugLog: DEBUG_LOG = FN(target, basePath, TEMPLATE);
            expect(debugLog.errors).toEqual([]);
            expect(debugLog.success).toEqual(true);
            expect(FS.listDetails(TARGET_FOLDER, true)).toEqual(EXPECTED);
        });
        it('should copy files from base project to target and create empty folder', () => {
            mock({ dev: { template: template2 } });
            const debugLog: DEBUG_LOG = FN(target, basePath, TEMPLATE);
            expect(debugLog.errors).toEqual([]);
            expect(debugLog.success).toEqual(true);
            expect(FS.listDetails(TARGET_FOLDER, true)).toEqual(EXPECTED2);
        });
        it('should not copy files if source not exists', () => {
            mock({ dev: { source: template } });
            const debugLog: DEBUG_LOG = FN(target, basePath, TEMPLATE);
            const EXPECTED: FileItem[] = []; // no files to copy
            expect(debugLog.errors).toEqual([
                `Source folder "${basePath}/${TEMPLATE.source}" does not exist.`,
            ]);
            expect(debugLog.success).toEqual(false);
            expect(FS.listDetails(TARGET_FOLDER, true)).toEqual(EXPECTED);
        });
        it('should not copy files if basePath not exists', () => {
            mock({ devNotExists: { template } });
            const debugLog: DEBUG_LOG = FN(target, basePath, TEMPLATE);
            const EXPECTED: FileItem[] = []; // no files to copy
            expect(debugLog.errors).toEqual([
                `Base project folder "${basePath}" does not exist.`,
            ]);
            expect(debugLog.success).toEqual(false);
            expect(FS.listDetails(TARGET_FOLDER, true)).toEqual(EXPECTED);
        });
    });
});
describe('without mockFS', () => {
    let spyLog = setupSpyLog();
    describe('displayLogs()', () => {
        it('should display logs with correct format', () => {
            const FN = displayLogs;
            const messages = ['This is 1 message', 'This is 2 message'];
            FN(messages, LogType.WARN);
            expect(spyLog).hasWARN('This is 1 message');
            expect(spyLog).hasWARN('This is 2 message');
        });
        it('should display logs with correct format', () => {
            const FN = displayLogs;
            const messages = ['This is 1 message', 'This is 2 message'];
            FN(messages, LogType.FAIL);
            expect(spyLog).hasFAIL('This is 1 message');
            expect(spyLog).hasFAIL('This is 2 message');
        });
    });
});
