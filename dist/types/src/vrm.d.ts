import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Body, BodyExpression, BodyMeta, Pose } from './body.js';
/** what a VRM may hold before it is decoded: a real avatar stays far below these (VRoid: about 27 M pixels) */
export declare const VRM_LIMITS: {
    json: number;
    textureSide: number;
    texels: number;
    vertices: number;
};
export interface VrmBodyOptions {
    /** given the GLTFLoader before it reads a file: for compressed files, register your decoders here (setDRACOLoader,
     *  setMeshoptDecoder, setKTX2Loader). The player itself ships none */
    configureLoader?: (loader: GLTFLoader) => void;
}
/** the terms a VRM's author set (its meta, 1.0 and 0.x said alike, the file's own words in `raw`). A page playing other
 *  people's avatars should show them and keep to them */
export interface VrmTerms extends BodyMeta {
    /** the spec the file follows: '1' or '0' */
    spec: string;
    /** who may play the avatar: only its author, people the author licensed, or everyone */
    use: 'author' | 'licensed' | 'everyone' | null;
    /** the avatar in commercial work. 1.0 has grades, 0.x only allow and disallow */
    commercial: 'disallow' | 'personal non-profit' | 'personal profit' | 'allow' | 'corporation' | null;
    violence: boolean | null;
    sexual: boolean | null;
    /** passing the file on, and changing it (1.0; null in 0.x, whose terms are in its licence) */
    redistribution: boolean | null;
    modification: string | null;
    raw: Record<string, unknown>;
}
export declare class VrmBody implements Body {
    readonly format = "vrm";
    private options;
    /** VRM 0.x stands facing the other way, turned round by three-vrm: rotations about X and Z count the other way round */
    private flip;
    /** the file has only one blink, for both eyes */
    private blinkBoth;
    /** the expressions the file adds to the preset ones: the id it goes by here -> its name in the file */
    private custom;
    private THREE;
    private vrm;
    private scene;
    private camera;
    private renderer;
    private gl;
    private bones;
    /** the framing: the world height shown (m), and its center */
    private frame;
    private has;
    private canvas;
    private headAt;
    private width;
    constructor(options?: VrmBodyOptions);
    attach(canvas: HTMLCanvasElement): void;
    context(): WebGL2RenderingContext | null;
    load(files: Map<string, Blob>): Promise<{
        name: string;
        expressions: BodyExpression[];
        meta: VrmTerms | undefined;
    }>;
    /** the camera where the framing fits the canvas's aspect */
    private place;
    render(canvas: HTMLCanvasElement, { params: P, move, expr }: Pose, w: number, h: number, dt: number): void;
    head(): {
        rx: number;
        ry: number;
        x: number;
        y: number;
    };
    dispose(): void;
}
