import type { Params } from './puppet.js';
/** the blendshapes the tracker reads, in the order a Frame stores them */
export declare const BS: readonly ["eyeBlinkLeft", "eyeBlinkRight", "jawOpen", "eyeLookOutLeft", "eyeLookInRight", "eyeLookInLeft", "eyeLookOutRight", "eyeLookUpLeft", "eyeLookUpRight", "eyeLookDownLeft", "eyeLookDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight", "browDownLeft", "browDownRight", "mouthSmileLeft", "mouthSmileRight"];
/** landmarks kept: forehead top, upper and lower inner lip, chin (the lip gap over the face height) */
export declare const LM: readonly [10, 13, 14, 152];
/** one detection at `t` ms: the face transform (column-major 4x4), the BS scores, the LM points (x, y each).
 *  Neither m nor b: no face in this frame */
export type Frame = {
    t: number;
    m?: number[];
    b?: number[];
    l?: number[];
};
/** plays frames in a loop at their own pace; next() gives each frame once, when its time has come */
export declare class TraceSource {
    private t0;
    private i;
    readonly frames: Frame[];
    readonly synth: boolean;
    readonly dur: number;
    constructor(frames: Frame[], synth?: boolean);
    /** position in the trace (ms) */
    at(now: number): number;
    next(now: number): Frame | null;
}
export declare class TraceRecorder {
    frames: Frame[];
    private t0;
    push(f: Frame): void;
    save(): void;
}
/** a 24 s loop at 30 fps. Seconds: 0-4 still, 4-8 turning left and right, 8-10 looking down (at a phone), 10-12 no
 *  face, 12-15 still with a blink at 13 (as a webcam sees one: 0.35, 0.62, 0.45, 0.2 on four frames), 15-18 turned
 *  20° while the far eye reads half closed (a common misread),
 *  18-21 talking, 21-24 still while leaning 6 cm sideways and 5 cm toward the camera. Head noise ~0.5°, the order of MediaPipe's at rest. `narrow`: eyes that rest at a
 *  blink score of ~0.38 (narrow eyes, glasses), which the default mapping shows half closed */
export declare function synthTrace(narrow?: boolean): Frame[];
/** numbers from the puppet's final params over each loop of the synthetic trace */
export declare class SynthStats {
    private rows;
    private lastS;
    private mirror;
    constructor(mirror: () => boolean);
    observe(s: number, P: Params): void;
    private publish;
}
