export declare class VoiceMeter {
    ctx?: AudioContext;
    an?: AnalyserNode;
    stream?: MediaStream;
    buf: Float32Array<ArrayBuffer>;
    level: number;
    gain: number;
    /** -1 round (o, u) .. +1 wide (i, e), 0 neither; updated by read() */
    vowel: number;
    private spec?;
    private db;
    private pw;
    private cue;
    private floor;
    private peak;
    private last;
    private el?;
    /** the page's own element (start), and what the meter plugged into it */
    private tap?;
    /** the voice as a stream, for recording it alongside */
    out?: MediaStream;
    /** file: play this audio (looped, audible) instead of listening to the microphone: tests without anyone talking.
     *  The SDK also passes a stream (a call's remote voice: listened to, not played) or an <audio> / <video> element the
     *  page plays itself (its sound goes on through the speakers) */
    start(file?: string | MediaStream | HTMLMediaElement): Promise<void>;
    /** (a stream the page passed in stays on: it is theirs) */
    stop(): void;
    /** 0..1 mouth openness, smoothed; call once per frame */
    read(): number;
}
