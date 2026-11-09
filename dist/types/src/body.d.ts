import { type Labels } from './runtime/format.js';
import { type Params } from './runtime/params.js';
import { LivLivError, PlayerBase, type LoadOptions, type PlayerOptions } from './base.js';
export { LivLivError };
export type { ActionId, Driver, Frame, Host, LivLivErrorCode, LoadOptions, LoadProgress, PlayerOptions, View } from './base.js';
/** an expression a Body can show: `labels` its names by language (BCP 47 tag -> name), `label` the one to fall back on */
export interface BodyExpression {
    id: string;
    label: string;
    labels?: Labels;
}
/** one frame's pose, as a Body draws it: the params, the picture's move (x, y shares of the canvas, y up; s a scale)
 *  and each expression's weight (0..1, eased) */
export interface Pose {
    params: Params;
    move: {
        x: number;
        y: number;
        s: number;
    };
    expr: Record<string, number>;
}
export interface Body {
    /** what kind of character it draws ('png', 'vrm', ...): BodyInfo.format */
    readonly format: string;
    /** optional: called before load with the canvas it will draw on; throw if it cannot draw there (the canvas already has
     *  another kind of context), and load() rejects with that */
    attach?(canvas: HTMLCanvasElement): void;
    /** loads from its files (by file name); its name and the expressions it can show. If it rejects, the character before
     *  must stay as it is */
    load(files: Map<string, Blob>): Promise<{
        name: string;
        expressions: BodyExpression[];
        meta?: BodyMeta;
    }>;
    /** optional: the WebGL context it draws with, once it has one: what lets the player say when it is lost and give it up
     *  (dispose({ release: true })). A Body without WebGL leaves this out */
    context?(): WebGLRenderingContext | WebGL2RenderingContext | null;
    /** draws the pose into the canvas, w × h device pixels, dt seconds after the last frame */
    render(canvas: HTMLCanvasElement, pose: Pose, w: number, h: number, dt: number): void;
    /** where the head is, in shares of the canvas (from the top left) and its radii */
    head(): {
        x: number;
        y: number;
        rx: number;
        ry: number;
    };
    dispose(): void;
}
/** who made a body character and under what terms, as its file says */
export interface BodyMeta {
    author?: {
        name: string;
    } | null;
    license?: {
        id?: string;
        url?: string;
    } | null;
}
/** a loaded body character */
export interface BodyInfo {
    name: string;
    /** the Body's format: 'png', 'vrm', ... */
    format: string;
    /** what setExpression() takes (smile is always there: a param, not an expression) */
    expressions: {
        id: string;
        label: string;
        labels: Labels;
    }[];
    /** what the file says about itself, where it does: a VRM's author and terms (VrmTerms). null otherwise */
    meta: BodyMeta | null;
}
/** its files: a URL (one file, a .vrm say), a File / Blob, a FileList / File[], or a map or object of file name -> Blob
 *  or URL (`{ closed: 'me-closed.png', open: 'me-open.png' }`). Files are known by their name, without folders */
export type BodySource = string | URL | Blob | FileList | Iterable<File> | Map<string, Blob | string> | Record<string, Blob | string>;
export type BodyPlayerOptions = PlayerOptions;
/** the most a body's files may hold in all (a VRM is usually 5-50 MB) */
export declare const BODY_LIMIT: number;
/** Plays a character a Body draws, with the API of Player where it applies (no mark, no `puppet`, no `view.head`) */
export declare class BodyPlayer extends PlayerBase<BodyInfo> {
    readonly body: Body;
    /** see PlayerOptions.maxPixelRatio */
    maxPixelRatio: number;
    private pose;
    private time;
    constructor(canvas: HTMLCanvasElement, body: Body, options?: BodyPlayerOptions);
    /** Loads a character from its files (see BodySource) in place of the one before (a failed load keeps it). A new load
     *  replaces one still downloading or waiting, which rejects with an AbortError (see LoadOptions); one whose character is
     *  already going in finishes first, since a Body swaps it inside, and the newer one then follows */
    load(source: BodySource, options?: LoadOptions): Promise<BodyInfo>;
}
