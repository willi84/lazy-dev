/**
 * 🎯 A utility class for mixed functionality
 * @module backend/_shared/TOOLS
 * @example detectType(3.2);
 * @version 0.0.1
 * @date 2026-09-19
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
import { Json } from '../..';
// import { sortBy } from '../../apps/api/_shared/utils/utils';
// import {
//     DATA_ENTRY,
//     DATA_ITEMS,
//     DATA_MAP,
//     DATA_TYPES,
// } from '../../apps/api/endpoints/endpoints.d';
// import { LOG } from '../log/log';
import { KEY_VALUES, STATS } from './tools.d';
import { DOM, DOMS } from './tools.d';
const NUM_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ','];

/**
 * 🎯 detect value type from a string
 * @param {string} rawValue ➡️ The raw string value to analyze.
 * @returns {string} 📤 type inside the string
 */
export const detectTypeFromString = (rawValue: string): string => {
    const value = rawValue.toLowerCase().trim();
    const booleans = ['true', 'false'];
    let isBoolean = false;
    booleans.forEach((bool: string) => {
        if (bool === value.toLowerCase().trim()) {
            isBoolean = true;
        }
    });
    // check if value just consists of those
    let testValue = value;
    NUM_VALUES.forEach((num: string) => {
        testValue = replaceAll(testValue, num, '');
    });
    const isNumber = testValue.trim() === '';
    if (isNumber) {
        return 'number';
    }
    if (isBoolean) {
        return 'boolean';
    } else {
        return 'string';
    }
    // TODO: Array, urls, number, object
};

/**
 * 🎯 detect type of the value
 * @param {any} value ➡️ The value to analyze.
 * @returns {string} 📤 type of the value
 */
export const detectType = (value: any) => {
    const isArray = Array.isArray(value);
    const isObject = typeof value === 'object' && !isArray;
    if (isObject) {
        return 'object';
    } else if (isArray) {
        return 'array';
    } else {
        return typeof value;
    }
};

/**
 * 🎯 replace all occurrences of a substring in a string
 * @param {string} input ➡️ The original string.
 * @param {string} search ➡️ The substring to search for.
 * @param {string} replacement ➡️ The substring to replace with.
 * @returns {string} 📤 The modified string with all occurrences replaced.
 */
export const replaceAll = (
    input: string,
    search: string,
    replacement: string
): string => {
    return input.split(search).join(replacement);
};

/**
 * 🎯 Merging items together
 * @param {any} target ➡️ item to merge into
 * @param {any} source ➡️ item to merge from
 * @returns {any} 📤 merged item
 */
export const deepMerge = (target: any, source: any): any => {
    if (target === null || target === undefined) return clone(source);
    if (source === null || source === undefined) return clone(target);

    if (typeof target !== 'object' || typeof source !== 'object') {
        return clone(source);
    }

    const merged: any = Array.isArray(target) ? [...target] : { ...target };

    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];

        if (isObject(srcVal) && isObject(tgtVal)) {
            merged[key] = deepMerge(tgtVal, srcVal);
        } else {
            merged[key] = clone(srcVal);
        }
    }

    return merged;
};

/**
 * 🎯 detect if value is an object
 * @param {any} val ➡️ The value to check.
 * @returns {boolean} 📤 true if the value is an object, false otherwise.
 */
export const isObject = (val: any): boolean =>
    val !== null && typeof val === 'object' && !Array.isArray(val);

/**
 * 🎯 detect if value is an array
 * @param {any} val ➡️ The value to check.
 * @returns {boolean} 📤 true if the value is an array, false otherwise.
 */
export const isArray = (val: any): boolean => Array.isArray(val);

/**
 * 🎯 clone an object
 * @param {any} val ➡️ value to clone
 * @returns {any} 📤 cloned value
 */
export const clone = (val: any): any => {
    return val !== undefined && typeof val === 'object'
        ? JSON.parse(JSON.stringify(val))
        : val;
};

/**
 * 🎯 shorthand to select a dom element
 * @param {string} query ➡️ query selector
 * @param {DOM} [target] ➡️ target to search in, default: document
 * @returns {DOM} 📤 found dom element
 */
export const select = (query: string, target?: DOM): DOM => {
    const base = target || document;
    return base?.querySelector(query) as DOM;
};

/**
 * 🎯 shorthand to select multiple dom elements
 * @param {string} query ➡️ query selector
 * @param {DOM} [target] ➡️ target to search in, default: document
 * @returns {DOMS} 📤 found dom elements
 */
export const selectAll = (query: string, target?: DOM): DOMS => {
    const base = target || document;
    return base?.querySelectorAll(query) as DOMS;
};

/**
 * 🎯 substitute placeholders in a string with values from an object
 * @param {string} str ➡️ The string containing placeholders.
 * @param {KEY_VALUES} replacements ➡️ An object with key-value pairs for replacements.
 * @returns {string} 📤 The modified string with placeholders replaced.
 */
export const substitute = (str: string, replacements: KEY_VALUES): string => {
    if (!replacements || Object.keys(replacements).length === 0) {
        return str;
    }
    return Object.keys(replacements).reduce((acc, key) => {
        const value = replacements[key];
        return acc.replace(new RegExp(`{${key}}`, 'gi'), String(value));
    }, str);
};

/** 🎯 get the value of a flag, prioritizing newValue over currentValue
 * @param {any} newValue ➡️ The new value to consider.
 * @param {any} currentValue ➡️ The current value to fall back on if newValue is undefined.
 * @returns {any} 📤 The selected value based on the priority.
 */
export const getFlagValue = (newValue: any, currentValue: any): any => {
    if (newValue === undefined) {
        return currentValue;
    } else {
        return newValue;
    }
};

/**
 * 🎯 update items array with new items, avoiding duplicates based on 'id' property
 * @param {any[]} allItems ➡️ The existing array of items to update.
 * @param {any[]} newItems ➡️ The new items to add to the existing array.
 * @return {void} 📤 The function modifies the allItems array in place.
 */
// export const updateItemsArray = <T>(allItems: T[], newItems: T[]): STATS => {
//     return sortBy<T>(newItems, allItems);
// };

/**
 * 🎯 convert a map of items to an array
 * @param {Json} map ➡️ The map of items to convert.
 * @returns {T[]} 📤 The array of items.
 */
export const convertMap2ArrayOld = <T>(map: Json): T[] => {
    const array: T[] = [];
    map &&
        Object.keys(map).forEach((key) => {
            const item = map[key];
            array.push(item);
        });
    return array;
};

/**
 * 🎯 convert an array of items to a map using 'id' as the key
 * @param {T[]} array ➡️ The array of items to convert.
 * @param {string} [key='id'] ➡️ The key to use for the map (default is 'id').c
 * @returns {Json} 📤 The map of items.
 */
// export const convertArray2MapOld = <T>(
//     array: T[],
//     key: string = 'id'
// ): Json => {
//     const map: DATA_ENTRY<T> = {};
//     array.forEach((item: any) => {
//         if (item[key] !== undefined && !map[item[key]]) {
//             map[item[key]] = item;
//         }
//     });
//     // Object.assign({}, map);
//     return map;
// };

// export const updateItems = <T>(
//     items: T[] | DATA_ENTRY<T>,
//     // data: T[] | DATA_ENTRY<T>
//     data: DATA_TYPES<T>
// ): STATS => {
//     const isItemsArray = Array.isArray(items);
//     let isValid = false;
//     let stats: STATS = { added: 0, skipped: 0, failed: 0 };
//     //
//     if ('items' in data && isItemsArray) {
//         const dataItems = data.items;
//         const itemsType = Array.isArray(dataItems);
//         if (itemsType) {
//             // console.log(data.items);
//             stats = updateItemsArray(items as T[], dataItems);
//             isValid = true;
//         } else {
//             // console.log(data);
//         }
//     } else if ('itemsById' in data && !isItemsArray) {
//         const dataItemsById = data.itemsById;
//         const itemsType = !Array.isArray(dataItemsById);
//         if (itemsType) {
//             if (typeof dataItemsById === 'object' && dataItemsById !== null) {
//                 Object.assign(items, dataItemsById);
//                 stats.added = Object.keys(dataItemsById).length;
//                 isValid = true;
//             }
//         }
//     } else {
//         if (isItemsArray) {
//             const array: T[] = convertMap2ArrayOld<T>(
//                 (data as DATA_MAP<T>).itemsById
//             );
//             stats = updateItemsArray(items as T[], array);
//             isValid = true;
//             // console.log(data);
//         } else {
//             // convert array to map
//             const map = convertArray2MapOld<T>((data as DATA_ITEMS<T>).items);
//             Object.assign(items, map);
//             stats.added = Object.keys(map).length;
//             isValid = true;
//             // console.log(data);
//         }

//         // const dataItemsType = Array.isArray(data.items);
//         // if (dataItemsType !== isItemsArray) {
//         //     console.log(data);
//         // }
//     }
//     if (!isValid) {
//         LOG.FAIL(`Invalid items data structure for updateItems`);
//     }
//     return stats;
// };

/**
 * 🎯 sum up stats values
 * @param {STATS} stats ➡️ The stats object containing added, skipped, and failed counts.
 * @returns {number} 📤 The total sum of added, skipped, and failed counts.
 */
export const sumStats = (stats: STATS): number => {
    return stats.added + stats.skipped + stats.failed;
};
