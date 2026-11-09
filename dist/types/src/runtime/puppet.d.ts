import { type Labels, type ModelFiles, type ModelMeta } from './format.js';
import { PARAM_RANGES, defaultParams, smooth, type Params } from './params.js';
export { PARAM_RANGES, defaultParams, smooth, type Params };
export interface LayerDef {
    id: string;
    name: string;
    texture: string;
    frames?: string[];
    mask?: string;
    /** the mouth's frames by name: closed, half, open (and round, wide in newer builds); older builds have no list */
    visemes?: string[];
    /** an expression patch as drawn while the character talks: without its own mouth; older builds have none */
    talk?: string;
    x: number;
    y: number;
    w: number;
    h: number;
    group: 'head' | 'body' | 'hair_back' | 'hair_side' | 'hair_front' | 'hair_inner';
    depth: number;
    role?: string;
    pivot?: [number, number];
    clip?: string;
    range?: [number, number];
    param?: string;
    /** an expression patch that changed the brows ("redrawn"): the neutral `brows` layer fades out under it, and the
     *  layer of role `expr_brows` with the same param (that expression's brow zone) fades in over the bangs */
    brows?: string;
    /** the brows that expression drew, matted, drawn above the bangs after the brows layers while it shows:
     *  where a frown or raised brows moved them, outside the `expr_brows` zone, the patch under the bangs showed them in
     *  pieces between the strands */
    brow_tex?: string;
    /** a .webp copy exists next to each of this layer's PNGs (much smaller) */
    webp?: boolean;
    /** chains (rig.chains ids) that bend this layer: each vertex takes them by its distance to their lines (a strand,
     *  a twin tail, a cord). Its hair springs are off: the chains replace them */
    bones?: string[];
    /** the whole layer hangs from this point and moves as the head does there (turned with its roll), instead of
     *  following the head's surface vertex by vertex: a twin tail tied at its ribbon, a lock hanging from behind the jaw */
    rigid?: [number, number];
    /** role blush: its opacity by expression (smile, or an expression layer's param), summed */
    blush?: Record<string, number>;
    /** shown only with these expressions (opacity: weight x the expression, summed, at most 1) / faded out by them: a
     *  drooping ahoge drawn for sad in place of the upright one */
    show?: Record<string, number>;
    hide?: Record<string, number>;
    /** front hair: how far out from the head's centre (share of the head ellipse) its depth stays whole before fading to
     *  none at the outline; 0.55 when missing. Deep bangs need it smaller, or their side edge slides over the hair behind */
    fall?: number;
    /** a hair layer: where (share of the head ellipse) its depth has faded to none (1 when missing: the head's outline).
     *  Past 1 the hair round the head turns with it, not only the hair over it; side / back hair use
     *  `fall` for where the fade starts too (0.7 when missing) */
    fall_end?: number;
}
type Box = [number, number, number, number];
/** model.json's `format` and the newest `version` this runtime reads (format.ts). The models livliv.ai
 *  builds are v3 (`livemaker-puppet`), an export v4: both arrive here as
 *  ModelDef, the v3 shape */
export { FORMAT, FORMAT_VERSION, LEGACY_FORMAT, readModel } from './format.js';
/** a model as the runtime draws it: model.json v3 as it is, or v4 lowered to it (format.ts readModel) */
export interface ModelDef {
    format: string;
    version: number;
    name: string;
    canvas: [number, number];
    anchors: {
        head: {
            cx: number;
            cy: number;
            rx: number;
            ry: number;
        };
        face: Box;
        neck_y: number;
        top_y: number;
        bottom_y: number;
        /** the top of the choker or collar (drawn views of a multi-view character) */
        collar_y?: number;
        hair_root_y: number;
        eyes?: Box[];
        /** per eye; null: no brow found (under the bangs, or not told from the hair). Only builds with brow_lines move them */
        brows?: (Box | null)[];
        brow_lines?: (BrowLine | null)[];
        jaw?: {
            top: number;
            chin: number;
            half: number;
            open: number;
            round?: number;
            wide?: number;
        };
        chest?: {
            cx: number;
            cy: number;
            rx: number;
            ry: number;
        };
    };
    layers: LayerDef[];
    tuning?: Partial<Tuning>;
    /** labels: every language's name (v4), label the one picked for this page */
    expressions?: {
        id: string;
        label: string;
        labels?: Labels;
        key?: string;
    }[];
    /** class.input: what the build saw in the picture, read by lidCurveFits */
    profile?: {
        id: string;
        label: string;
        class?: {
            input?: {
                facing?: string;
                glasses?: boolean;
            };
        };
    };
    rig?: Partial<Rig>;
    /** the version of the layer images, added by the server: a hash of their names and bytes */
    tex?: string;
    /** head-turn keyforms measured from a generated video: a file next to model.json. Optional, an
     *  older player ignores it */
    keyforms?: string;
    /** the corner mark an exported package carries: "LivLiv" on the free plan, the owner's own text,
     *  or null. The SDK draws it; livliv.ai draws its own over the live window. A v4 package's is meta.watermark */
    watermark?: string | null;
    /** v4 only: the package's meta (author, license, generator, the mark it asks for) and its optional files */
    meta?: ModelMeta;
    files?: ModelFiles;
}
/** keyforms.json: for each key pose (angleX or angleY at `value`, at the model's turn / nod tuning of the time) one
 *  displacement field per layer group on a `cell` px grid, int16 dx, dy in `units` px, rows x cols, base64: "head" for
 *  every head layer, "hair" for every hair layer (one field, like the hair weights: no seam between two hair layers can
 *  open), or a layer's own id */
export interface KeyformFile {
    version: number;
    cell: number;
    cols: number;
    rows: number;
    units: number;
    turn: number;
    nod: number;
    /** param 'diag': a key only a caller weights (keyWeights), not an angle (the multi-view player's corners) */
    keys: {
        param: 'angleX' | 'angleY' | 'diag';
        value: number;
        fields: Record<string, string>;
        /** groups whose field is the head's, stored once (a field written three times tripled the file) */
        same?: string[];
    }[];
    /** per group, on the same grid (uint8, 255 = all of it, base64): how much of the measured pose a vertex takes, the
     *  rest staying as the rig puts it ("face only": the features move as measured, the face's outline as the rig) */
    mask?: Record<string, string>;
    /** 'hermite': each angle's two keys (-v, +v) blend so the motion's speed is the same on both sides of 0: linearly, a turn whose left and right keys differ changed speed as it crossed the front. Missing: linear */
    interp?: 'hermite';
}
/** per-category rig recipe written by the pipeline */
export type Rig = {
    yaw: number;
    pitch: number;
    roll: number;
    bulge: number;
    /** spring chains [k1, c1, gain, k2, c2]: the bangs', long hair's, and (optional) the side hair's: hair beside
     *  the face at head height takes it instead of the bangs' by how far out it lies (SIDE_AT); without it, the bangs' */
    hair: {
        front: number[];
        back: number[];
        side?: number[];
    };
    hair_limit: number;
    /** how much each chain [front, back, side] is thrown by the head's own acceleration: the face's centre on the
     *  head is the pivot, so a turn or nod leaves the hair behind and lets it swing back when the head stops, as a Cubism
     *  pendulum does. Missing: the chains only take the hair root's speed (gain) and the wind */
    hair_drive?: number[];
    wind: number;
    breath: number;
    sway: number;
    brow: number;
    /** torso: share of the head turn / tilt it follows, breathing amount, chest spring (0 = none) */
    body: {
        yaw: number;
        roll: number;
        breath: number;
        bust: number;
    };
    /** pieces that swing on their own (hand-rigged builds); optional */
    chains?: ChainDef[];
    /** how much a nod eases off toward the ends of its range (0.25 when missing); 0 keeps it linear, which a player
     *  blending puppets of several drawn views needs (they meet half way only if each moves in proportion) */
    pitch_ease?: number;
    /** the bulge's profile, 1 - r^(2 * bulge_shape) (1 when missing: a paraboloid). Above 1 the middle of the face is
     *  flatter and the cheeks steeper: the eyes keep their width on a turn while the face's sides foreshorten (per character) */
    bulge_shape?: number;
    /** how far the whole head drifts toward a turn / a nod, in head radii at a full one ([0.12, 0.08] when missing) */
    drift?: [number, number];
    /** the bulge's reach, in head radii sideways, up and down ([1, 1, 1] when missing: the skull ellipse). Past 1 the
     *  hair round the skull (crown, temples, ears, a hat) lies on the same rounded volume and turns with the face, and the
     *  face keeps its shape on a turn: the foreshortening is spread over the whole head instead of piling up at the face's
     *  edge (the rig template). A 4th value is the reach sideways low on the head: from the skull's middle down
     *  the sideways reach eases to it, reached at the 5th value (a share of the reach down; 1 when missing: at the chin),
     *  so what hangs beside the jaw and the neck stays with the body (v3) */
    bulge_extent?: [number, number, number] | [number, number, number, number] | [number, number, number, number, number];
    /** the neck twists with the head: under what chinFollow moves with the head, the neck's column takes
     *  `twist` of the head's sideways shift at the chin, fading to none `reach` face heights below the chin (0.45 when
     *  missing). Missing: the neck stays with the body, as before */
    neck?: {
        twist: number;
        reach?: number;
    };
    /** the jaw drop for builds whose edits measured none, as a share of the face height at the open frame (procJaw,
     *  0.015, when missing) */
    jaw?: number;
};
/** one swinging piece: a rope of points (root first, model px) pulled toward its drawn shape in the frame of what it
 *  hangs from, thrown by that root's acceleration, kept hanging down by gravity as far as `hang` says. Cubism's
 *  physics does the same with pendulums driving parameters; here the rope bends the layers' meshes directly */
export interface ChainDef {
    id: string;
    /** what the root moves with: the head (at `depth`, like a head layer) or the torso */
    attach?: 'head' | 'body';
    depth?: number;
    points: [number, number][];
    /** pull toward the drawn shape at the root end and at the tip (1/s²): stiff roots, loose tips */
    k: [number, number];
    /** velocity damping (1/s) */
    damp: number;
    /** how far the root's acceleration throws it (1: like a free pendulum) */
    drive: number;
    /** 0: the shape turns with the head / torso; 1: it keeps hanging straight down when they tilt */
    hang: number;
    /** idle sway at the tip (model px) and its rate (Hz) */
    wind: number;
    freq?: number;
    /** how far a joint may leave its rest place (model px) */
    limit?: number;
    /** skinning falloff (model px): between two chains a vertex takes the nearer one */
    sigma?: number;
    /** how far from its line (model px) the chain still bends the layer, fading out to 1.6x that; none: the whole layer
     *  (a strand, a tail). With it a chain bends one part of a big layer (a side volume of the back hair) and the rest
     *  keeps the layer's hair springs */
    reach?: number;
    /** degrees the chain bends (around its root) at a full expression, by expression param: an ahoge drooping when sad */
    bias?: Record<string, number>;
}
export declare const defaultRig: () => Rig;
/** user-facing "feel" settings (livliv.ai's feel sliders); 1 = default. nod scales up / down on top of turn. hair is how
 *  freely the hair swings; hairFront (the bangs' springs) and hairBack (long hair's, and the swinging pieces': chains)
 *  each take its place when set, so a model saved with hair alone moves both as before.
 *  gaze: the share of the iris's travel it uses, 0-1. Less shows less of what a far look uncovers in the whites and fixes
 *  none of it; above 1 only shows more, so it stops at 1 */
export type Tuning = {
    turn: number;
    nod: number;
    hair: number;
    blink: number;
    expr: number;
    mouth: number;
    breath: number;
    hairFront?: number;
    hairBack?: number;
    gaze: number;
};
export declare const defaultTuning: () => Tuning;
interface GLLayer {
    def: LayerDef;
    tex: WebGLTexture;
    frames: WebGLTexture[];
    mask?: WebGLTexture;
    talk?: WebGLTexture;
    browTex?: WebGLTexture;
    vao: WebGLVertexArrayObject;
    pos: WebGLBuffer;
    uvs: WebGLBuffer;
    tris: WebGLBuffer;
    count: number;
    rest: Float32Array;
    out: Float32Array;
    /** the mesh's triangles (vertex indices, the index buffer's) */
    tri: Uint32Array;
    /** the main texture's size in texels */
    tw: number;
    th: number;
    /** the GL buffer holds `out` as deform left it (several renders of one frame, as the multi-view player does, upload
     *  it once: re-uploading a buffer a draw still uses waited on that draw, 94 ms a frame drawing one puppet thrice) */
    uploaded?: boolean;
    wHead: Float32Array;
    wPhys1: Float32Array;
    wPhys2: Float32Array;
    dep: Float32Array;
    wFront: Float32Array;
    wBrow: Float32Array;
    browSide: Int8Array;
    wJaw: Float32Array;
    /** the most the brow field moves each vertex (model px; Infinity: no cap), from brow_lines' cap */
    browCap: Float32Array;
    /** body (neckFollow): how much of the head's roll each vertex takes about the neck */
    wNeck?: Float32Array;
    /** body (rig.neck): how much of the head's sideways shift at the chin each vertex takes */
    wTwist?: Float32Array;
    /** brows drawn over the bangs: per vertex how far it moves as the front hair does instead of as the head
     *  (fol; folB for the brows an expression drew, browTex, drawn from outB), and the front hair's weights there (alt:
     *  dep, wHead, wPhys1, wPhys2, wFront per vertex) */
    fol?: Float32Array;
    folB?: Float32Array;
    outB?: Float32Array;
    alt?: Float32Array;
    stencilRef: number;
    /** eye patch and iris (lidCurve): per vertex, the height its column squashes toward, the closed lash the lid layer draws */
    pivY?: Float32Array;
    /** iris (lidCurve): that height at the iris's centre, where irisLid's drop is measured */
    pivC?: number;
    /** iris: how far it sits off its eye patch this frame (model px, at most 1): 0 at rest, where the stencil cuts it as
     *  always; above it the soft mask takes over (softIris). Eye patch: the channel of the mask texture its whites
     *  were drawn into this frame, -1 none (the stencil) */
    soft: number;
    maskCh: number;
    /** per keyform (Puppet.keys order): how far each vertex sits from where the rig alone puts it at that key pose */
    kf?: (Float32Array | null)[];
    /** the chains bending it (LayerDef.bones), and for brows over chained bangs the bangs' chains (alt) */
    skin?: Skin;
    altSkin?: Skin;
}
interface Skin {
    B: number;
    c: Int16Array;
    seg: Int16Array;
    t: Float32Array;
    ux: Float32Array;
    uy: Float32Array;
    w: Float32Array;
    /** per vertex, how much of the chains it takes in all (0: out of their reach, skipped) */
    sum: Float32Array;
}
interface ChainRun {
    def: ChainDef;
    /** rest joints, current and previous joints (the root's frame, model px), segment lengths, arc length (0..1) */
    R: Float32Array;
    p: Float32Array;
    q: Float32Array;
    len: Float32Array;
    s: Float32Array;
    /** per joint: displacement from rest and how far the rope turned there (rad) */
    disp: Float32Array;
    beta: Float32Array;
    /** the root in the world, its velocity, its smoothed acceleration, and the turn of its frame (rad) */
    W: [number, number];
    V: [number, number];
    acc: [number, number];
    rho: number;
    started: boolean;
    phase: number;
    /** any joint off its rest place (else the chain bends nothing and its layers skip it) */
    moving: boolean;
}
/** cap (optional): per sample the most the brow may move there (model px), where it lies under opaque bangs */
export type BrowLine = {
    x: number[];
    bottom: number[];
    lid: number[];
    cap?: number[];
};
/** what a caller may give a load: see Puppet.load */
interface LoadExtras {
    signal?: AbortSignal;
    onImage?: (came: number, of: number) => void;
}
interface Spring {
    x: number;
    y: number;
    vx: number;
    vy: number;
}
type Group = 'front' | 'back' | 'side';
export declare class Puppet {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
    model: ModelDef;
    layers: GLLayer[];
    byId: Map<string, GLLayer>;
    params: Params;
    prog: WebGLProgram;
    uView: WebGLUniformLocation;
    uAlpha: WebGLUniformLocation;
    uTex: WebGLUniformLocation;
    uCut: WebGLUniformLocation;
    uMode: WebGLUniformLocation;
    uMaskOff: WebGLUniformLocation;
    uMaskSel: WebGLUniformLocation;
    uSoft: WebGLUniformLocation;
    /** softIris: the whites of the eyes whose iris moved, drawn as they show this frame over the eyes' box (a channel
     *  each), and that box's size as allocated (it only grows) */
    maskFb: WebGLFramebuffer | null;
    maskTex: WebGLTexture | null;
    maskSize: [number, number];
    /** per hair group a 2-segment chain [root->mid, mid->tip]: the bangs', long hair's (side hair takes either by where it
     *  lies, place()'s f), and the side hair's when the rig has one (rig.hair.side) */
    chains: Record<Group, [Spring, Spring]>;
    lastHead: {
        x: number;
        y: number;
        roll: number;
    };
    /** rig.hair_drive's pivot: the face's centre on the head, its smoothed velocity and acceleration (model px, s) */
    drive: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        ax: number;
        ay: number;
        started: boolean;
    };
    /** smoothed torso pose (degrees): the body lags the head */
    body: {
        yaw: number;
        roll: number;
    };
    /** chest spring: position / velocity, relative to the chest anchor's rigid motion */
    bust: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        px: number;
        py: number;
    };
    time: number;
    background: [number, number, number, number];
    zoom: number;
    panY: number;
    /** where the user put the character, on top of zoom / panY: x, y as shares of the canvas width / height (y up), s a
     *  scale around the canvas center (dragging and zooming in the live window) */
    view: {
        x: number;
        y: number;
        s: number;
    };
    /** automatic movement on top of that, same units (talking hops, head position, actions). It never lifts a bottom
     *  edge the drawing is cut off at (half-body characters) above where `view` alone puts it: render() moves the
     *  picture down by whatever it would show */
    move: {
        x: number;
        y: number;
        s: number;
    };
    /** the drawing reaches its bottom edge (cut off there): set on load from anchors.bottom_y */
    cutBottom: boolean;
    /** device pixels per CSS pixel at most (the power-saving mode draws at 1) */
    maxDpr: number;
    /** draw at exactly this many pixels (a video's frame) instead of the canvas's size on the page */
    size: [number, number] | null;
    physicsScale: number;
    hidden: Set<string>;
    tuning: Tuning;
    rig: Rig;
    /** extra expression weights by layer param name (smile lives in params) */
    expr: Record<string, number>;
    /** displayed smile: eases toward params.smile so switching it never pops */
    smileShown: number;
    /** mouth frame shown (0 the picture's own mouth, 1 half, 2 open, then round / wide / shut where the build has them, see vis): follows
     *  mouthOpen and vowel with hysteresis and a minimum hold, and switches at once. Any fade between two different
     *  drawings shows both half transparent (a pale double mouth), and while talking the frames change so often that a
     *  ~70 ms fade meant the mouth was nearly always mid-fade.
     *  mouthW: each frame's weight for the jaw, which eases after the frame in ~40 ms */
    mouthFrame: number;
    mouthW: number[];
    mouthHeld: number;
    /** loudness level (0 closed, 1 half, 2 open) and vowel shape of the frame shown: the states the hysteresis runs from */
    mouthAmp: number;
    mouthShape: '' | 'round' | 'wide';
    /** frame index of the round / wide mouth, when the build has them, and of the closed mouth a picture drawn with
     *  its mouth open talks with between syllables */
    vis: {
        round?: number;
        wide?: number;
        shut?: number;
    };
    /** each frame's kind (closed, half, open, round, wide) and jaw drop (model px) */
    frameKind: string[];
    frameJaw: number[];
    /** jaw drop for builds whose edits measured none (most in newer builds: the open edits rarely move the drawn jaw line), as a
     *  share of the face height at the open frame (half 0.45, round 0.7, wide 0.35 of it). 1.5 %: the chin line moves
     *  4-8 px, no gap at the neck on the 20 shown characters open / turned / tilted. 0 turns it off; set before load() */
    procJaw: number;
    /** the chin as one piece while talking and nodding: the mouth frames hold
     *  the original lower face round the mouth (and on some builds the chin line): they follow the jaw like the face, the
     *  frame's own squeeze fading out toward the chin; the neck right under the chin follows the head and the jaw, so the
     *  drawn chin shadow stays under the chin. false: as before. Set before load() */
    chinFollow: boolean;
    /** how far below the chin the neck still follows the head, as a share of the face height (chinFollow) */
    chinNeck: number;
    /** across, from the face's centre line: the neck follows fully within the first share of the face width and not at
     *  all past the second (chinFollow) */
    chinNeckX: [number, number];
    /** the shoulders by the neck tilt with the head's roll this much, fading out within neckFollowY face heights
     *  below the neck line and from neckFollowX face widths across; 0: still, as before. Set before load() */
    neckFollow: number;
    neckFollowY: number;
    neckFollowX: [number, number];
    /** time left of 'talking' (TALK_LATCH after the last half / open frame) */
    talkLeft: number;
    /** center the view on the head (eval / close-up shots) */
    focusHead: boolean;
    /** the model's keyforms (param, value, and the tuning they were measured at); kfOff: the rig alone (while measuring
     *  it, and for side-by-side comparisons) */
    keys: {
        param: 'angleX' | 'angleY' | 'diag';
        value: number;
        scale: number;
    }[];
    /** keyforms.json's interp 'hermite': per key, the key on the other side of 0 of the same angle (-1: none) */
    private kfPair;
    kfOff: boolean;
    /** each key's weight (Puppet.keys order) set by the caller instead of taken from the angle: a player switching
     *  between puppets of drawn views morphs each toward the other's layout over a fixed time */
    keyWeights: number[] | null;
    /** draw only the layers this accepts (a player composing one picture from several puppets: the hair of one, the face
     *  of another); null draws all */
    only: ((d: LayerDef) => boolean) | null;
    /** draw the mask layers (roles hole, edge, edge_wide: moved like any layer, never drawn otherwise) */
    masks: boolean;
    /** a half-closed eye squashes toward the closed lash its lid layer draws, column by column, on the models lidCurveFits
     *  allows; false: toward one height per eye on every model, as before (for comparisons). Set before load() */
    lidCurve: boolean;
    /** a half-closed eye covers the iris like a lid: the eye patch and its whites squash as before; the iris above
     *  the line they squash toward keeps its shape, drops irisDrop of the way its centre would have gone (the pupil
     *  stays in the slit) and goes under the upper lid, the part below squashes with the lower lid (its round bottom
     *  stays on the lower lash: cut there instead, a big iris came out a box at 45 %). Only irises with gaze travel: one
     *  without fills its eye (a chibi's bead, a mascot's pupil), and cut flat by an undrawn lid it read as a dark bar;
     *  it squashes whole, as before. false: every iris squashes with its patch, flat (for comparisons) */
    irisLid: boolean;
    irisDrop: number;
    /** an iris off its eye patch (a glance, a blink) is cut by the whites' alpha, antialiased; false: by the 1-bit
     *  stencil at mask alpha 0.5 everywhere, stepped along the cut (for comparisons). At rest it is the
     *  stencil either way, so the rest pose stays as built */
    softIris: boolean;
    /** a look toward the nose stops the iris's inner edge at the drawn inner corner, where the whites end: past it
     *  the whites' straight end cut the iris. Its far edge travels on, so the iris narrows as an eyeball
     *  turning does, to irisNasalNarrow of its width at most, and then stops whole (1: stops whole at the corner, the eyes
     *  diverge). Outward, up and down as before; false: the build's travel both ways (for comparisons) */
    irisNasal: boolean;
    irisNasalNarrow: number;
    /** per eye side (L / R): its iris's room toward the nose, measured at load */
    private nasal;
    /** the model's swinging pieces (rig.chains), simulated in update() */
    chainRuns: ChainRun[];
    /** a model with swinging chains (rig.chains): its highlights follow the gaze and sparkle */
    get chained(): boolean;
    /** multi-view players (one puppet per drawn view): leave out the body (a side view drawn over the front one keeps the
     *  front's torso) or everything but the body (the front's head once the side view has taken over) */
    bodyHidden: boolean;
    headHidden: boolean;
    /** the last frame's view transform (render): scale x / y, offset x / y in clip space, and the drawing buffer size */
    lastView: [number, number, number, number, number, number];
    constructor(canvas: HTMLCanvasElement);
    /** baseUrl: the model's folder, or its model.json (the SDK: any name ending in .json); the images are read relative to
     *  it. png: load the lossless layer PNGs even where a WebP copy exists (eval: rest-pose PSNR is scored against the
     *  source, and quality-92 WebP alone costs 1.3–6.4 dB on line art). pack: try the server's textures.bin first (an
     *  exported package has none: the SDK turns it off rather than ask for it and get a 404). signal: calls the load off
     *  until the model starts going in, which then happens at once and whole; it rejects with the signal's reason and the
     *  model before stays. onImage: each image that has come in, of how many */
    load(baseUrl: string, { png, pack: usePack, signal, onImage }?: {
        png?: boolean;
        pack?: boolean;
    } & LoadExtras): Promise<void>;
    /** a model from anywhere (the SDK: files the user picked): its model.json, and each image it names by its path there */
    loadModel(raw: ModelDef, image: (path: string) => Promise<HTMLImageElement>, { png, keyforms: keyformsComing, signal, onImage }?: {
        png?: boolean;
        keyforms?: KeyformFile | Promise<KeyformFile | undefined>;
    } & LoadExtras): Promise<void>;
    /** the model in place of the one before, or, if anything throws on the way (its layers, its keyforms, the GPU out of
     *  memory), the one before exactly as it was: its layers on the GPU, every field, every spring. All in one go: no frame
     *  runs in between. The GPU holds both for that moment */
    private install;
    private build;
    /** each key pose's fields, as a per-vertex offset from the rig's own pose at that key: measured once here with the
     *  springs at rest, the torso settled and the face neutral, so at the key the character stands exactly as in the clip
     *  and everything else (physics, blinks, mouth, brows, roll) keeps moving on top of it */
    private prepareKeyforms;
    dispose(): void;
    private freeLayers;
    private freeMask;
    private texture;
    private buildLayer;
    /** each vertex's place on the chains `ids` (rig.chains): its nearest point on each chain's line (segment, how far
     *  along), its offset from there, and a weight by distance (a Gaussian of sigma, normalised over the chains) */
    private skinOf;
    /** a vertex's offset from the chains bending it (world px), into o */
    private skinOffset;
    /** where a chain's root is in the world and how far its frame is turned (rad), into o: [x, y, rho] */
    private chainRoot;
    /** how opaque an expression patch (or its brows) is drawn */
    private exprAlpha;
    /** a layer's opacity from its show / hide expressions (1 without them) */
    private moodAlpha;
    /** whether render() will draw the layer this frame (deform() skips the rest) */
    private shown;
    /** an expression's weight as shown (smile eases, the others are set by the page) */
    private exprValue;
    /** every chain one step: verlet rope pulled toward its drawn shape (counter-turned by the tilt as far as it hangs,
     *  bent by expressions, swayed by wind), thrown by its root's acceleration, its segments kept at length */
    private stepChains;
    /** the head's turn, nod and roll as sines and cosines: the same for every vertex of a frame, so worked out once per
     *  pose (it was six trig calls per vertex, the biggest part of a frame) */
    private hxC;
    private headTrig;
    private headXform;
    /** rigid torso motion at (x, y): breathing, turn-follow, lean; plus the chest bump when `bust` */
    private bodyOffset;
    /** torso lags the head; the chest spring lags the torso (only when the rig asks for it) */
    private stepBody;
    /** closed mouth, no hold pending (a new model, a test starting a clip) */
    resetMouth(): void;
    private stepMouth;
    /** how far frame `i` is along with mouthOpen `m` (0..1): within a frame the opening keeps moving a little */
    private frameEase;
    private stepPhysics;
    /** one frame: time, physics, the mesh. `mesh` false keeps the physics going without moving the mesh (a puppet not
     *  drawn this frame: the multi-view player's drawn views, only one or two of which show at a time) */
    update(dt: number, mesh?: boolean): void;
    /** every layer's vertices at the current params, springs and torso: into each layer's out */
    private deform;
    private drawLayer;
    /** softIris: the whites of each eye whose iris sits off it (a glance, a blink), as they show this frame, into a
     *  channel each (maskCh) of a texture over their box in drawing-buffer pixels; the iris is then drawn times them
     *  (uMode 2) instead of through the stencil, whose 1-bit cut at alpha 0.5 is a staircase wherever the iris crosses
     *  it. First thing in the frame: switching framebuffers half way through costs a tiled GPU a store and a
     *  reload of the canvas */
    private drawMasks;
    render(): void;
    /** a point on the canvas (CSS px from its top-left) in model px, as the last frame drew it */
    canvasToModel(px: number, py: number): [number, number];
    /** a flick at model point (x, y): every chain passing near it is thrown, the nearest joint hardest (a tap on a twin
     *  tail, the ahoge, a cord). Returns how many chains it moved */
    poke(x: number, y: number, strength?: number): number;
    /** springs back to rest (eval / screenshots must not inherit wind sway) */
    resetPhysics(): void;
    snapshot(): string;
}
/** textures.bin of the model at baseUrl at its images' version (tex), as load() asks for it: a page that knows the
 *  version beforehand can start fetching it before the player loads */
export declare function packUrl(baseUrl: string, tag: string): string;
/** an image from the pack (or a file the user picked), decoded like any other (the same Image path, so the textures come
 *  out the same) */
export declare function loadBlob(b: Blob): Promise<HTMLImageElement>;
export declare function loadImage(src: string): Promise<HTMLImageElement>;
/** lidCurve's models: front-view anime and painterly characters, whose closed eye is a drawn row of lashes. Not chibi or
 *  mascot (the closed eye is an arc or a bead: the fitted line came out tilted and the eye closed into a lemon or a half
 *  moon), not glasses (the frame may sit in the lid layer), not turned builds: those were not checked */
export declare function lidCurveFits(m: ModelDef): boolean;
/** the classic idle: a few sines and a first-order follow. The player's own (livliv.ai's
 *  pages use a livelier one) */
export declare class IdleDriver {
    nextBlink: number;
    blinkT: number;
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
    apply(P: Params, t: number, dt: number): void;
}
