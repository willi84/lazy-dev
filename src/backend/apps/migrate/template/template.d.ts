export type RENAME_ITEM = {
    from: string;
    to: string;
};

export type TEMPLATE_CONFIG = {
    name: string;
    version: string;
    description: string;
    author: string;
    baseProject: string;
    source: string;
    files: string[];
    folders: string[];
    renames: RENAME_ITEM[];
};

export type TEMPLATE = {
    name: string;
    path: string;
    baseProject: string;
    source: string;
    config: TEMPLATE_CONFIG;
};

export type DEBUG_LOG = {
    warnings: string[];
    errors: string[];
    infos: string[];
    success: boolean;
};
