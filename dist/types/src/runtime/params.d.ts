export type Params = {
    angleX: number;
    angleY: number;
    angleZ: number;
    eyeLOpen: number;
    eyeROpen: number;
    eyeBallX: number;
    eyeBallY: number;
    browLY: number;
    browRY: number;
    mouthOpen: number;
    smile: number;
    /** the voice's vowel (vowel.ts): -1 round (o, u) .. +1 wide (i, e), 0 neither */
    vowel: number;
    bodyX: number;
    bodyZ: number;
    breath: number;
};
export declare const defaultParams: () => Params;
export declare const PARAM_RANGES: Record<keyof Params, [number, number]>;
export declare const smooth: (a: number, b: number, x: number) => number;
