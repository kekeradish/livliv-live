import { LivelyIdle } from './runtime/idle.js';
import { type Params } from './runtime/params.js';
import type { Puppet } from './runtime/puppet.js';
/** the keys the idle motion sets (with it on, your values for these are not used); its smile is added to yours */
export declare const IDLE_KEYS: readonly ["angleX", "angleY", "angleZ", "eyeLOpen", "eyeROpen", "eyeBallX", "eyeBallY", "browLY", "browRY", "bodyX", "bodyZ", "breath"];
/** what pointAt reads of a puppet: where the head is drawn (a BodyPlayer passes its body's head in canvas shares) */
export type Seen = Pick<Puppet, 'model' | 'lastView'>;
export declare class Idle {
    readonly lv: LivelyIdle;
    private P;
    /** the 'turn' style's input, which the idle keeps while a face tracker drives (what tracking shows stays as it was) */
    private turn;
    /** lookAt's target holds the attention: the pointer is not followed meanwhile */
    private held;
    constructor();
    /** one frame of the idle motion into P: the keys it sets, and its smile over P's */
    apply(P: Params, t: number, dt: number, now: {
        busy: boolean;
        tracked: boolean;
        faceFree: boolean;
    }): void;
    /** after the frame: the head as shown, everything over the idle included (the body follows it) */
    shown(P: Params): void;
    /** the pointer at (x, y), CSS px from the canvas's top left (w × h its CSS size); on: it counts as on the stage (off,
     *  the character looks back) */
    pointer(p: Seen, x: number, y: number, w: number, h: number, on: boolean): void;
    /** the pointer left the page */
    leave(): void;
    /** looks toward (x, y), each -1..1 from the canvas center (y up), and keeps looking there; null lets go */
    lookAt(p: Seen, x: number | null, y: number, w: number, h: number): void;
    blink(t: number): void;
}
