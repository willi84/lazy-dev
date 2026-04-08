import { SPY_LOG } from './log.d';
import { LOG_TYPES } from './log.config';
import { LOG } from './log';

type SpyLogKey = keyof SPY_LOG;
type LogMatcherName = `has${(typeof LOG_TYPES)[number]}`;
type LogMatcherResult = jest.CustomMatcherResult;
type RuntimeLogMatcher = () => LogMatcherResult;
type LogMatchers<R> = {
    [K in LogMatcherName]: (expected: string) => R;
};

const createLogMatcher = (logKey: SpyLogKey): jest.CustomMatcher => {
    return (received: SPY_LOG, expected: string) => {
        const spy = received?.[logKey];
        const calls =
            spy?.mock.calls.length > 0
                ? spy?.mock.calls.map((call) => call[0]) || []
                : [];
        const pass = calls.length > 0 ? calls.includes(expected) : false;
        return {
            message: () =>
                pass
                    ? `Expected spyLog not to have calls with "${expected}".`
                    : `Expected spyLog to have a call with "${expected}".`,
            pass,
        };
    };
};

const LOG_MATCHERS = LOG_TYPES.reduce(
    (matchers, logType) => {
        const matcherName = `has${logType}` as LogMatcherName;
        const logKey = logType as SpyLogKey;
        matchers[matcherName] = createLogMatcher(logKey) as RuntimeLogMatcher;
        return matchers;
    },
    {} as Record<LogMatcherName, RuntimeLogMatcher>
);

expect.extend(LOG_MATCHERS as Record<string, jest.CustomMatcher>);

declare global {
    namespace jest {
        interface Matchers<R> extends LogMatchers<R> {}
    }
}

/**
 * 🎯 Creates a spy log object with jest spies for each log type defined in LOG_TYPES.
 * @returns {SPY_LOG} 📤 The spy log object with registered jest spies.
 */
export const createSpyLog = () => {
    const spyLog: SPY_LOG = {} as SPY_LOG;
    LOG_TYPES.forEach((log) => {
        const logKey = log as SpyLogKey;
        spyLog[logKey] = jest.spyOn(LOG, logKey);
    });
    return spyLog;
};

/**
 * 🎯 Resets all spies in the provided spy log object.
 * @param {SPY_LOG} spyLog ➡️ The spy log object whose spies should be reset.
 * @returns {void} 📤 No return value.
 */
export const resetSpyLog = (spyLog: SPY_LOG) => {
    Object.values(spyLog).forEach((spy) => spy.mockReset());
};

/**
 * 🎯 Restores all spies in the provided spy log object.
 * @param {SPY_LOG} spyLog ➡️ The spy log object whose spies should be restored.
 * @returns {void} 📤 No return value.
 */
export const restoreSpyLog = (spyLog: SPY_LOG) => {
    Object.values(spyLog).forEach((spy) => spy.mockRestore());
};

type SpyLogSetup = SPY_LOG & {
    debug: () => Partial<Record<SpyLogKey, string[]>>;
};

/**
 * 🎯 Registers Jest lifecycle hooks and returns a spy log shaped helper.
 * @returns {SpyLogSetup} 📤 The current spy log object plus debug output.
 */
export const setupSpyLog = () => {
    let spyLog: SPY_LOG;
    const setup = {} as SpyLogSetup;

    // create spy before it exists in the setup object
    LOG_TYPES.forEach((log) => {
        const logKey = log as SpyLogKey;
        Object.defineProperty(setup, logKey, {
            configurable: true,
            enumerable: true,
            get: () => spyLog?.[logKey],
        });
    });

    beforeEach(() => {
        spyLog = createSpyLog();
    });

    afterEach(() => {
        restoreSpyLog(spyLog);
        jest.clearAllMocks();
    });

    return setup;
};
