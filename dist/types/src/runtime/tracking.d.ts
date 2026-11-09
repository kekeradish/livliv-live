import { type Params } from './params.js';
import { TraceRecorder } from './trace.js';
type Landmarker = import('@mediapipe/tasks-vision').FaceLandmarker;
export declare const V = "1.1.1";
/** where those files are: livliv.ai serves them itself; the SDK points elsewhere (setFaceModelFiles) before loading */
declare const FILES: {
    wasm: string;
    model: string;
};
export declare function setFaceModelFiles(f: Partial<typeof FILES>): void;
/** where starting the camera is: downloading the model (progress 0..1; the first time only), preparing it (compiling,
 *  the GPU), the camera (the permission prompt, the first picture) */
export type StartStep = {
    step: 'download';
    progress: number;
} | {
    step: 'prepare';
} | {
    step: 'camera';
};
/** The face model, loaded once per page and kept: every tracker and every camera toggle reuses it. Call it early
 *  (hovering the camera button, the live dialog) and the camera opens without waiting for it. The files are read with
 *  progress and land in the HTTP cache, where the live window, opened in another tab, finds them */
export declare function loadFaceModel(onProgress?: (p: number) => void, ticket?: object): Promise<Landmarker>;
/** a face unseen this long (s) is lost: the player hands the character back to its idle motion */
export declare const LOST_AFTER = 0.4;
/** a head pose (angles), the head's position in front of the camera (px, py, pz: cm, y up, z larger = closer) and the
 *  resting blink scores of the user's own left / right eye (narrow eyes, glasses rest well above 0). In the current
 *  view's terms; stored, x, z and px are in the mirrored view's (they flip with it) */
type Pose = {
    x: number;
    y: number;
    z: number;
    px: number;
    py: number;
    pz: number;
    bl: number;
    br: number;
};
export declare class FaceTracker {
    video: HTMLVideoElement;
    lm?: Landmarker;
    stream?: MediaStream;
    last: number;
    target: Partial<Params>;
    mouthGain: number;
    exprGain: number;
    /** like a mirror (default): turn to your left and the character turns toward the screen's left. Off: it turns the
     *  way you do, as if it were you seen from the front (left/right, tilt, gaze and which eye blinks swap) */
    mirror: boolean;
    /** the user's natural pose (calibrated) is 'front': its angles are subtracted, its blink scores are 'eyes open' */
    zero: Pose;
    raw: {
        x: number;
        y: number;
        z: number;
    };
    /** the head's position relative to the calibrated one (cm, smoothed; x in the view's terms): the player moves the
     *  character with it. Zero until a resting position is known */
    pos: {
        x: number;
        y: number;
        z: number;
    };
    /** how much the head's sideways position also leans the body (the live setting `follow`, 0..2) */
    follow: number;
    /** process every n-th camera frame (power saving: 2) */
    every: number;
    /** detections per second at most. The model runs on the main thread, inside the frame: 14-16 ms each on an M4 with a
     *  busy machine, so on a phone it can take the frame rate with it. 'auto': a detection takes at most half of the main
     *  thread's time, by what the last ones took, and never under 5 a second (a face is lost after LOST_AFTER). Unset: every
     *  new camera frame, as livliv.ai has always done */
    maxFps?: number | 'auto';
    /** how long a detection takes (ms, smoothed) and when the next may run */
    private detectMs;
    private detectAt;
    /** set: calibration is remembered on this device for this character (localStorage), and found again next time */
    calibId?: string;
    calibrated: boolean;
    /** a calibration saved before positions were part of it: the resting position is taken on the next still second */
    private posKnown;
    private frameNo;
    /** the eye turned away from the camera reads half closed (a wink that isn't): 'turn' links the eyes once the head
     *  turns past ~12°, 'always' links them all the time, 'off' never */
    blinkSync: 'turn' | 'always' | 'off';
    ok: boolean;
    private stopped;
    /** while start() runs: what it is waiting for */
    onStep?: (s: StartStep) => void;
    /** seconds since a face was last seen (Infinity before the first); faces seen per second; the picture too dark */
    lostFor: number;
    fps: number;
    dark: boolean;
    /** '' (camera), 'rec' (camera, recorded), 'synth' / 'synth-narrow', or the URL of a recording (see trace.ts) */
    trace: string;
    rec?: TraceRecorder;
    private src?;
    private stats?;
    private recent;
    private seenAt;
    private counted;
    private countAt;
    private light?;
    private f;
    /** the current pose becomes 'front' (the last few frames, so one noisy frame doesn't decide it) */
    calibrate(): void;
    /** smoothing, 0 (quick, shakier) .. 1 (steady, slower); 0.5 is what the head filters were tuned to. Both the cutoff at
     *  rest and how fast it opens with speed scale (the cutoff alone barely changes the jitter: noise opens the filter).
     *  Synthetic trace, offline: 0 -> jitter 0.33°, lag 36 ms; 0.5 -> 0.19°, 56 ms; 1 -> 0.09°, 96 ms */
    setSmoothing(s: number): void;
    setMirror(on: boolean): void;
    start(): Promise<void>;
    /** the camera goes off; the face model stays loaded for the next time (loadFaceModel) */
    stop(): void;
    /** Poll once per frame; returns true while a face is seen. */
    poll(): boolean;
    /** after the frame's params are final: numbers for a synthetic run (trace.ts) */
    observe(P: Params): void;
    private read;
    /** the median of a few still frames becomes 'front', 'here' and 'eyes open' */
    private setZero;
    /** remembered for the next time on this device (not for traces) */
    private save;
    private restore;
    /** once a second: the mean brightness of a 32x24 copy of the camera picture (dark below ~40 of 255, with hysteresis) */
    private checkLight;
    apply(P: Params, dt: number): void;
}
export {};
