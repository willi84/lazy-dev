import { commandSafeFirst } from '../cmd/cmd';

export const getHome = (): string => {
    const home = commandSafeFirst('echo $HOME');
    if (home !== '$HOME') {
        return home;
    } else {
        // CMD
        const homeCMD = commandSafeFirst('echo %USERPROFILE%');
        if (homeCMD !== '%USERPROFILE%') {
            return homeCMD;
        }
    }
    return '$HOME'; // container or home not set
};
