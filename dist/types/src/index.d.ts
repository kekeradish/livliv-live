import { type Labels, type ModelMeta } from './runtime/format.js';
import { FORMAT, FORMAT_VERSION, LEGACY_FORMAT, PARAM_RANGES, defaultParams, type ModelDef, type Params } from './runtime/puppet.js';
import { LivLivError, PlayerBase, type LoadOptions, type PlayerOptions } from './base.js';
export { FORMAT, FORMAT_VERSION, LEGACY_FORMAT, PARAM_RANGES, defaultParams };
export type { Labels, ModelDef, ModelMeta, Params };
export { LivLivError };
export type { ActionId, Driver, Frame, Host, LivLivErrorCode, LoadOptions, LoadProgress, PlayerOptions, View } from './base.js';
/** this package's version */
export declare const VERSION = "0.3.0";
/** where a model comes from: the URL of its model.json, of the folder holding it, or of a .livliv package (relative URLs
 *  resolve against the page); a .livliv package itself (a File or Blob: a ZIP of the folder); or its files: a FileList /
 *  File[] from an <input type="file"> (a folder with webkitdirectory, or one picked .livliv), or a map of path -> Blob */
export type ModelSource = string | URL | Blob | FileList | Iterable<File> | Map<string, Blob> | Record<string, Blob>;
export interface ModelInfo {
    name: string;
    /** model.json's format: FORMAT ("livliv-model"), or LEGACY_FORMAT ("livemaker-puppet") for packages exported before v4 */
    format: string;
    /** its version (FORMAT_VERSION is the newest this player reads; a legacy package is 3) */
    version: number;
    /** the size the character was drawn at, in pixels */
    size: [number, number];
    /** what setExpression() takes: `id` (smile, shy, angry ... mean the same on every model; x_… is the model's own),
     *  `label` its name in the player's language, `labels` every language's (BCP 47 tag -> name) */
    expressions: {
        id: string;
        label: string;
        labels: Labels;
    }[];
    /** the mark drawn over the character: "LivLiv" (the free plan's), the owner's own text, or null */
    watermark: string | null;
    /** v4 packages: who made it (author), the terms it comes under (license), what wrote it and when; null before v4 */
    meta: ModelMeta | null;
}
/** Plays one LivLiv model on a canvas. Size the canvas with CSS; the drawing follows its size. */
export declare class Player extends PlayerBase<ModelInfo> {
    private mark;
    /** Whether this browser can play a LivLiv model (WebGL2 starts on a new canvas). Where it cannot, new Player() throws */
    static isSupported(): boolean;
    constructor(canvas: HTMLCanvasElement, options?: PlayerOptions);
    /** see PlayerOptions.maxPixelRatio */
    get maxPixelRatio(): number;
    set maxPixelRatio(v: number);
    /** A point on the canvas (CSS px from its top left) in the model's own px, as the last frame drew it */
    canvasToModel(x: number, y: number): [number, number];
    /** A flick at a point in the model's px (canvasToModel): the swinging pieces passing near it are thrown, the nearest
     *  joint hardest (a tap on a twin tail). Returns how many it moved: none on a model without any */
    poke(x: number, y: number, strength?: number): number;
    /** Loads a model (see ModelSource) and shows it in place of the one before. A load that fails keeps it; a new load
     *  replaces one still running, which rejects with an AbortError (see LoadOptions) */
    load(source: ModelSource, options?: LoadOptions): Promise<ModelInfo>;
    private loadNow;
}
