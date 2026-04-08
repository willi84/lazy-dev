import { LOG } from '../log/log';
const execSync = require('child_process').execSync;

/**
 * 🎯 Execute a shell command
 * @param {string} command ➡️ The command to execute.
 * @param {boolean} doLog ➡️ Whether to log the output (default: false).
 * @param {boolean} showError ➡️ Whether to show errors (default: false).
 * @returns {string} 📤 The output of the command.
 */
export const command = (command: string, doLog = false, showError = false) => {
    let output: string = '';
    let errorText: string = '';
    try {
        output = execSync(`${command}`, { timeout: 10000 });
    } catch (e: any) {
        errorText = e;
    }
    if (doLog) {
        LOG.DEBUG(`${output.toString()}`);
    }
    if (showError && errorText !== '') {
        LOG.FAIL(`${errorText}`);
        LOG.DEBUG(`${output.toString()}`);
    }
    return output.toString();
};

/**
 * 🎯 Execute a shell command safely and return the output as an array of lines
 * @param {string} cmd ➡️ The command to execute.
 * @returns {string[]} 📤 The output of the command as an array of lines.
 */
export const commandSafe = (cmd: string): string[] => {
    const result = command(cmd);
    if (!result || result.trim() === '') {
        return [];
    }
    const allLines = result
        .split(/\r?\n|\r/)
        .map((line) => line.trim())
        .filter((line) => line !== '');
    return allLines;
};
/**
 * 🎯 Execute a shell command safely and return the first line of the output
 * @param {string} cmd ➡️ The command to execute.
 * @returns {string} 📤 The first line of the command output.
 */
export const commandSafeFirst = (cmd: string): string => {
    const result = commandSafe(cmd);
    return result && result.length > 0 ? result[0] : '';
};
