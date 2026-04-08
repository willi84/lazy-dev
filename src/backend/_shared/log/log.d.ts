import { LOG_TYPES } from './log.config';
export type LogItem = {
    message: string;
    type: LogType;
    time: number;
    telemetry?: any;
};
export type COLOR_SET = {
    id: string;
    fg: string;
    bg: string;
};
export type COLOR_SET_ITEMS = {
    [key: LogType]: COLOR_SET;
};

export type LogOpts = {
    icon?: string;
    newline?: boolean;
};

export type SPY_LOG = {
    [key in (typeof LOG_TYPES)[number]]: jest.SpyInstance;
};
