import type { Params, Puppet } from './puppet.js';
/** a keyframed track [[seconds, value], ...]: cubic through the keys, flat at the first and last */
type Track = [number, number][];
/** idle moves. Head / body tracks are degrees added to the wander's targets (so the springs smooth them too); eyeBall
 *  adds to the gaze; eye multiplies the eye opening; brow adds to both brows; breath replaces the breathing. A move
 *  mirrors at random (side: the sign of every X and Z track) */
type Move = {
    dur: number;
    tracks: Partial<Record<'angleX' | 'angleY' | 'angleZ' | 'bodyX' | 'bodyZ' | 'eyeBallX' | 'eyeBallY' | 'eye' | 'brow' | 'breath', Track>>;
};
export declare const IDLE_MOVES: Record<string, Move>;
/** how far the idle moves things. The defaults are livliv.ai's character pages'; its home
 *  page's is calmer and its body follows the head */
export type IdleStyle = {
    /** the head's and body's own wander (shares of their noise's degrees) */
    wander: number;
    /** how far the head turns toward the pointer (the eyes still look all the way) */
    look: number;
    /** how far the idle moves turn the head and body (their eyes, brows and breaths unchanged) */
    moves: number;
    /** the share of the head's turn and tilt, as shown (moods, moves and all), that the body takes on top of its own sway,
     *  about a quarter second later: a person's shoulders come along when they turn or tilt their head. The rig already
     *  turns and leans the torso with the head (puppet.ts stepBody, rig.body), at once and by little. The lean pivots
     *  below the hips and carries the head sideways with it, so it takes a smaller share */
    bodyTurn: number;
    bodyTilt: number;
    /** how the character follows the pointer: 'attend' (IDLE_STYLE's, so the players') or 'turn' (the
     *  head turns most of the way, as before). Missing, 'turn': a caller that sets a style of its own and drives `look`
     *  itself (LivLiv Stage) moves as it did until it asks for 'attend' */
    pointer?: 'attend' | 'turn';
    /** 'attend': the pointer resting on the face 1.2 s brings a smile the first time, then with this chance, at most every
     *  25 s (the whole-face swap at full strength, 1.6 s; never while an expression shows or the character talks). 0:
     *  never. (A smile as the character looked back read as a laugh at nothing) */
    smile?: number;
};
export declare const IDLE_STYLE: IdleStyle;
/** the pointer at (x, y), CSS px from the canvas's top left (w x h its CSS size), for the 'attend' style: its place round
 *  the face as drawn at rest in look units (the canvas's sides at ±1, the scale `look` has), its distance from the face's
 *  centre in face radii, and whether it is on the stage. A player calls it on every pointer move (on: false when it
 *  leaves) */
export declare function pointAt(lv: LivelyIdle, p: Puppet, x: number, y: number, w: number, h: number, on: boolean): void;
export declare class LivelyIdle {
    nextBlink: number;
    blinkT: number;
    blinkAt: number;
    look: {
        x: number;
        y: number;
    };
    blinkRate: number;
    nextSaccade: number;
    gaze: {
        x: number;
        y: number;
    };
    /** set by the caller while the character talks or plays an action: no idle move starts then, and one playing fades */
    busy: boolean;
    /** how much the idle moves move (0 turns them off) */
    moves: number;
    style: IdleStyle;
    /** the head as shown last frame, everything layered over the idle included (the player sets it): what the body follows */
    shown: {
        x: number;
        z: number;
    };
    /** the pointer for the 'attend' style (pointAt); `look` stays the 'turn' style's input. keep: a target of the caller's
     *  own (LivLiv Stage: the character who speaks), x, y in the same look units, that holds the attention however long it
     *  stays still (a pointer at rest lets go after ATTEND.hold) */
    pointer: {
        x: number;
        y: number;
        d: number;
        on: boolean;
        keep?: boolean;
    };
    /** set by the Driver while the webcam drives the character: this idle (what shows while no face is seen) keeps the
     *  'turn' style then, so what tracking shows stays exactly as it was */
    tracked: boolean;
    /** set by the Driver: no expression shows, so a smile (a whole face) may */
    faceFree: boolean;
    private smiling;
    /** 'attend': the pointer last frame and when it last moved, its speed (look units a second), whether it holds the
     *  attention and since when, the attention as the head and eyes follow it, the gaze target's slow follower (a big step
     *  away from it blinks), the soft squint, the tilt's side, and when the notice, the look back and a smile began */
    private att;
    /** the body's share of it, through two short lags */
    private fol;
    /** the move playing (name, seconds in, mirrored), and when the next one may start */
    move: {
        id: string;
        t: number;
        side: number;
        fade: number;
    } | null;
    nextMove: number;
    last: string;
    private s;
    /** the targets eased first (0.12 s): a saccade steps the head's target, and a spring pulled by a step starts with a jolt */
    private aim;
    private breathPhase;
    private breathPeriod;
    private double;
    private seed;
    private breath;
    apply(P: Params, t: number, dt: number): void;
    /** 'attend': this frame's pointer (onto the stage, moving, resting, gone) and where the attention goes */
    private attend;
    /** 'attend': the brows' lift (before the blink's dip and the idle move's) */
    private attendBrow;
}
export {};
