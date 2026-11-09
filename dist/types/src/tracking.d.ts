import { type StartStep } from './runtime/tracking.js';
import type { Host } from './base.js';
export type { StartStep };
export interface FaceModelFiles {
    /** the folder of MediaPipe's wasm files (vision_wasm_internal.js / .wasm and the nosimd pair). Default: jsDelivr's
     *  copy of @mediapipe/tasks-vision 1.1.1. Host them yourself in production */
    wasmUrl?: string;
    /** face_landmarker.task. Default: Google's model bucket */
    modelUrl?: string;
}
export interface FaceTrackingOptions extends FaceModelFiles {
    /** move like a mirror image (default true): turn left and the character turns to the screen's left */
    mirror?: boolean;
    /** 0 (quick, shakier) .. 1 (steady, slower); default 0.5 */
    smoothing?: number;
    /** how much leaning toward / away from the camera moves the character, 0 (default) .. 2 */
    follow?: number;
    /** how many times a second to look for the face at most. 'auto' (default): as often as the camera gives a new picture,
     *  until that would take over half of the page's main thread (the model runs there); then less, 5 at least */
    maxFps?: number | 'auto';
    /** keep the calibration (the user's resting pose) on this device under this name (localStorage) */
    remember?: string;
    /** what starting waits for: the download (progress 0..1, first time only), preparing the model, the camera */
    onProgress?: (step: StartStep) => void;
    /** play a recorded face trace (a URL) or 'synth' (a built-in 24 s loop: turns, a nod, a lost face, a blink, talking)
     *  instead of the camera: tests without anyone in front of one */
    trace?: string;
}
export interface FaceTracking {
    /** a face is seen now */
    readonly face: boolean;
    /** faces seen per second */
    readonly fps: number;
    /** the picture is too dark to track well */
    readonly dark: boolean;
    mirror: boolean;
    /** the user's current pose becomes "facing front" (it also calibrates itself on the first still second) */
    calibrate(): void;
    /** camera off, the character back to its idle motion (the face model stays loaded for the next start) */
    stop(): void;
}
/** Downloads the face model ahead of time (on hover over a camera button, say), so starting is quick. Once per page */
export declare function preloadFaceModel(options?: FaceModelFiles & {
    onProgress?: (p: number) => void;
}): Promise<void>;
/** Asks for the camera and drives the character with the face it sees. While no face is seen, the character eases back
 *  to its idle motion */
export declare function startFaceTracking(player: Host, options?: FaceTrackingOptions): Promise<FaceTracking>;
