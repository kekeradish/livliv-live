import { type Params } from './params.js';
export declare class TalkMotion {
    /** strength, 0 (off) to 2 */
    amount: number;
    bounce: boolean;
    /** set for one update after a pause in talking: the caller starts a blink */
    pauseBlink: boolean;
    /** how much the character is talking now (0..1): rises fast, fades over about a second after the last syllable */
    act: number;
    /** how far to move the picture up, as a share of its height. Half-body characters are cut off at the bottom
     *  edge, so a hop must never lift that edge into view: with bounce on the character sits lower by the most a hop
     *  reaches, and a hop only brings it back up to where it was (always <= 0) */
    hop: number;
    stats: {
        onsets: number;
        nods: number;
        brows: number;
        blinks: number;
    };
    private armed;
    private valley;
    private peak;
    private quiet;
    private sinceNod;
    private sinceBrow;
    private nod;
    private lift;
    private browAge;
    private dir;
    private aim;
    private phase;
    private t;
    private off;
    /** level: the mouth openness the voice drives (0..1), once per frame. Returns offsets to add to the idle pose */
    update(level: number, dt: number, P: Params): Partial<Params>;
    reset(): void;
}
