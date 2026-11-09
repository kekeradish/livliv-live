import { type Params } from './params.js';
export type ActionId = 'nod' | 'shake' | 'tilt' | 'hop' | 'shy' | 'away';
export declare class ActionPlayer {
    /** out: seconds since it was replaced by the same action pressed again (it fades out over 0.15 s), else -1 */
    private playing;
    /** away: on; auto: entered because no face was seen (leaves by itself when one is back) */
    away: boolean;
    auto: boolean;
    /** how far into the away pose (0..1) */
    awayW: number;
    private off;
    y: number;
    play(id: ActionId): void;
    setAway(on: boolean, auto?: boolean): void;
    get busy(): boolean;
    /** offsets to add this frame; `y` holds the vertical move */
    update(dt: number): Partial<Params>;
    /** the away pose at time t (breathing slower than awake) */
    awayPose(t: number): Partial<Params>;
}
