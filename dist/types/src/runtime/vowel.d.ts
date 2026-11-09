export declare class VowelCue {
    center: number;
    value: number;
    private seen;
    /** one frame: `power` the linear power spectrum (bin k at k * hz), `level` its loudness 0..1, `dt` seconds since the
     *  last frame. Returns the smoothed cue -1 (round) .. +1 (wide) */
    push(power: ArrayLike<number>, hz: number, level: number, dt: number): number;
    reset(): void;
}
/** the cue for a clip at `fps` frames a second, given its mouth envelope (same frames, `lead` frames ahead of the
 *  sound like the envelope): what the chat's voice works out as each sentence comes in (speech.ts), frames `from` to
 *  `to` into `out` (all of them by default). Window ~21 ms (Blackman), like the microphone's analyser. `cue` carries the
 *  voice's balance from one frame to the next and from one sentence to the next */
export declare function vowelTrack(x: Float32Array, sr: number, env: Float32Array, fps: number, lead?: number, cue?: VowelCue, from?: number, to?: number, out?: Float32Array<ArrayBuffer>): Float32Array;
