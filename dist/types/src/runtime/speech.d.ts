/** one queued sentence, as its caller hears about it: onStart when its first sound reaches the listener, then exactly
 *  one of onEnd (heard to the end) or onFail (no sound came, or stop() dropped it) */
export type ClipHooks = {
    onStart?: () => void;
    onEnd?: () => void;
    onFail?: () => void;
};
export declare class SpeechPlayer {
    private ctx;
    private gen;
    private loads;
    private order;
    private clips;
    private tail;
    private pending;
    private watchdog;
    private cue;
    private out;
    private volume;
    private owed;
    private ticker;
    /** called when the voice goes quiet: nothing playing and nothing left to load */
    onIdle?: () => void;
    /** called when the audio context starts or stops running (a browser's autoplay rule keeps it suspended until a tap) */
    onState?: () => void;
    /** the sound can be heard: the audio context is running */
    get running(): boolean;
    /** 0 (silent, still playing on time: a muted preview) .. 1 */
    setVolume(v: number): void;
    /** Create / resume the audio context. Call it inside a user gesture (tap, key press), or playback stays blocked. */
    unlock(): void;
    get busy(): boolean;
    /** queue one sentence; it plays right after the ones before it, from its first piece on */
    enqueue(url: string, hooks?: ClipHooks): void;
    /** silence now: stop what plays, drop what is still loading */
    stop(): void;
    /** mouth openness 0..1 for the frame being drawn */
    read(): number;
    /** the vowel for the frame being drawn: -1 round (o, u) .. +1 wide (i, e), 0 neither (vowel.ts) */
    vowel(): number;
    private at;
    dispose(): void;
    /** context time of the sound reaching the listener now (output latency included: Bluetooth adds 100-250 ms) */
    private heardTime;
    /** schedule the next piece of a sentence (the first one starts its clip) */
    private play;
    /** the hooked sentences that have started or ended being heard since the last look (every 25 ms while any is owed) */
    private tick;
    private begin;
    /** a hooked sentence is over: heard to the end, or not to be heard; told once */
    private settle;
    /** the clip's envelope and vowel for what has arrived: frames far enough from the end are final (the vowel's cue sees
     *  each once, in order), the last few are redone with the next piece */
    private update;
    /** a clip that is complete and has been played leaves once it has been heard */
    private retire;
    private check;
}
/** mouth openness per 1/FPS s for the samples `x` (one clip, or what has arrived of it) */
export declare function envelope(x: Float32Array, sr: number): Float32Array;
