import type { Host } from './base.js';
export interface LipSyncOptions {
    /** how much the voice also moves the head, brows and eyes: 0 (off) .. 2, default 1. Not while a face is tracked */
    motion?: number;
    /** hop a little on syllables, like a PNGTuber (default false) */
    bounce?: boolean;
}
export interface LipSync {
    /** the mouth openness the voice gives now, 0..1 */
    readonly level: number;
    /** mouth sensitivity (default 1) */
    gain: number;
    /** stops listening (a stream or element you passed in stays yours, and keeps playing) */
    stop(): void;
}
export interface Speech {
    /** queues a clip (a URL, or audio bytes); it plays right after the ones before it */
    say(clip: string | Blob | ArrayBuffer): void;
    /** silence now: what plays stops, what is still loading is dropped */
    stop(): void;
    /** call inside a user gesture (a click, a key press) before the first say(), or browsers keep the sound blocked */
    unlock(): void;
    /** something is playing or still loading */
    readonly busy: boolean;
    /** called when the last clip has played */
    onIdle?: () => void;
    /** stops, and removes the lip sync from the player */
    dispose(): void;
}
/** Lip sync to live audio: the microphone (no source; asks for permission), a MediaStream, or an <audio> / <video>
 *  element. An element is routed through Web Audio for good once passed here (browsers allow it once per element): it
 *  keeps playing through the speakers after stop() */
export declare function startLipSync(player: Host, source?: MediaStream | HTMLMediaElement, options?: LipSyncOptions): Promise<LipSync>;
/** Speech clips with lip sync (TTS replies): say() queues each one */
export declare function createSpeech(player: Host, options?: LipSyncOptions): Speech;
