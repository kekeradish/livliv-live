import { type ActionId as AnyAction } from './runtime/actions.js';
import { type Params } from './runtime/params.js';
export { LivLivError, type LivLivErrorCode } from './errors.js';
/** a short move: see act() */
export type ActionId = Exclude<AnyAction, 'away'>;
export interface PlayerOptions {
    /** move by itself: breathe, blink, sway, look around (default true). Off: only your params and drivers move it */
    idle?: boolean;
    /** the eyes and head follow the pointer anywhere on the page ('page', the default), only over the canvas
     *  ('canvas'), or not at all (false) */
    followPointer?: 'page' | 'canvas' | false;
    /** drawing-buffer pixels per CSS pixel at most (default 2; 1 saves power on high-DPI screens) */
    maxPixelRatio?: number;
    /** start the frame loop at once (default true) */
    autoplay?: boolean;
    /** the language expression names are picked in (`expressions[].label`; a BCP 47 tag, default the browser's) */
    lang?: string;
}
/** where the character sits in the canvas: x, y move it by shares of the canvas (y up), zoom scales it about the
 *  center; head: frame the head instead of the whole drawing (avatars, chat bubbles; a BodyPlayer does not use it) */
export interface View {
    x: number;
    y: number;
    zoom: number;
    head: boolean;
}
/** one frame being put together, as a driver sees it */
export interface Frame {
    /** the pose so far: write to it (for this frame only) */
    readonly params: Params;
    /** seconds since the last frame, and since the model loaded */
    readonly dt: number;
    readonly time: number;
    /** a face tracker drives the head this frame (lip sync then leaves the head alone) */
    tracked: boolean;
    /** add to params, kept in their ranges */
    add(offsets: Partial<Params>): void;
    /** move the picture: x, y shares of the canvas (y up), s a scale */
    readonly move: {
        x: number;
        y: number;
        s: number;
    };
}
/** something that moves the character each frame: face tracking and lip sync are drivers, and your own code can be */
export interface Driver {
    /** lower runs first: face tracking -10, yours 0 (default), lip sync 10 */
    order?: number;
    update(frame: Frame, player: Host): void;
    /** called when it is removed, or the player disposed */
    dispose?(): void;
}
/** what a driver, the lip sync and the face tracking need of a player: a Player, or a BodyPlayer (@livliv-dev/player/body) */
export interface Host {
    /** adds a driver; returns a function that removes it */
    use(driver: Driver): () => void;
    /** blinks now (with the idle motion on) */
    blink(): void;
}
/** how far a load has come: the files coming in (0..1, in step order, 1 once they are all here; where the size is not
 *  known it stays at 0 until then), then the character going in */
export type LoadProgress = {
    step: 'download';
    progress: number;
} | {
    step: 'build';
};
export interface LoadOptions {
    /** calls the load off: it rejects with an AbortError (or the signal's own reason) and the character before stays. An
     *  already aborted signal rejects at once and leaves a load that is running alone */
    signal?: AbortSignal;
    onProgress?: (progress: LoadProgress) => void;
    /** the URL of a picture to show until the first frame (a character's cover.webp), as the canvas's CSS background: it
     *  fits the canvas's box, adds nothing to the page, and the canvas's own background comes back after. Only while the
     *  canvas shows nothing yet: over a character, that one stays until the next is ready */
    poster?: string;
}
export declare abstract class PlayerBase<Info extends {
    expressions: {
        id: string;
    }[];
}> implements Host {
    readonly canvas: HTMLCanvasElement;
    /** your values for the pose and face (ranges in PARAM_RANGES). The player never changes them */
    readonly params: Params;
    /** see PlayerOptions.idle */
    idle: boolean;
    /** see PlayerOptions.followPointer */
    followPointer: 'page' | 'canvas' | false;
    readonly view: View;
    /** see PlayerOptions.lang */
    readonly lang: string;
    /** Called when the canvas's WebGL context is lost (a phone reclaiming the page's GPU memory, a driver reset, too many
     *  contexts on the page). The character is gone from this canvas and does not come back by itself: put a new canvas in
     *  its place and make a new player. On a page with many players, a new context can push out another: release those
     *  that have left (dispose({ release: true })) */
    onContextLost?: () => void;
    private idler;
    /** last frame's: a face tracker drove it, the mouth moved (the idle starts no move while the character talks) */
    private was;
    private drivers;
    private expr;
    private smile;
    private raf;
    private last;
    private visible;
    private io?;
    private queue;
    private lost;
    /** the load that a new one replaces */
    private running;
    /** the canvas's own background while a poster is showing */
    private posterOver;
    /** pose: the Params the subclass draws from, written to each frame */
    constructor(canvas: HTMLCanvasElement, pose: Params, options: PlayerOptions);
    /** the canvas's WebGL context is gone: nothing draws, and load() rejects with code 'context-lost' */
    get contextLost(): boolean;
    /** the loaded character (null before the first load) */
    get model(): Info | null;
    get expressions(): {
        id: string;
    }[];
    get playing(): boolean;
    /** the poster over an empty canvas, or none */
    private setPoster;
    /** Shows an expression (an id from `expressions`), easing over from the one before; null goes back to neutral.
     *  weight: how strongly, 0..1. False when the model has no such expression */
    setExpression(id: string | null, weight?: number): boolean;
    /** Plays a short move over whatever drives the character: nod, shake, tilt, hop, shy */
    act(action: ActionId): void;
    /** Dozes (eyes closed, head down, a slow breath, expressions hidden), easing in, until setAway(false) */
    setAway(on: boolean): void;
    /** Looks toward (x, y), each -1..1 from the canvas center (y up), instead of following the pointer; null goes back to
     *  following it. Needs the idle motion on */
    lookAt(x: number | null, y?: number): void;
    /** Blinks now (with the idle motion on) */
    blink(): void;
    /** Adds a driver; returns a function that removes it. On a disposed player it is disposed at once: what started
     *  while the player went (a camera, a microphone) does not stay on */
    use(driver: Driver): () => void;
    play(): void;
    pause(): void;
    /** Draws now at the canvas's current size. A playing player follows the size by itself; call this after resizing a
     *  paused one */
    resize(): void;
    /** The current frame as an image (PNG data URL), as the pose is now, the mark included */
    snapshot(): string;
    /** Stops, removes the drivers and frees the GPU memory. A load still running rejects. The canvas keeps its WebGL context
     *  and can take a new player afterwards. release: also give the context up, when the canvas is leaving the page: a
     *  browser allows about 16 at once and drops the oldest past that, which may be a character still showing. A canvas
     *  released this way takes no new player, unless it is made at once, in the same task (a framework's unmount and mount).
     *  Safari does not get the room back: reuse canvases there */
    dispose({ release }?: {
        release?: boolean;
    }): void;
    private stop;
    private draw;
    private onMove;
    private onLeave;
    private onLost;
}
