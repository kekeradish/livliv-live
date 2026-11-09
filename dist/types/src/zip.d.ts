/** what a package may hold before anything is decoded; model.json and keyforms.json as format.ts says */
export declare const ZIP_LIMITS: {
    entries: number;
    bytes: number;
    modelJson: number;
    keyforms: number;
};
/** whether these bytes begin a ZIP (a local file header, or the end record of an empty one) */
export declare function isZip(b: Blob): Promise<boolean>;
/** the package's files by path (no folders, no __MACOSX / ._ / .DS_Store litter). Throws on what it cannot or must
 *  not read; a deflated keyforms.json the browser cannot inflate is left out (the character plays on the rig alone) */
export declare function unzip(zip: Blob): Promise<Map<string, Blob>>;
