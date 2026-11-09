import type { ModelDef } from './puppet.js';
/** model.json's `format` and the newest `version` of it this player reads. A v4 file names, in `requires`, the
 *  features a player must have to draw it right (FEATURES: none in 4.0); fields it does not know it ignores */
export declare const FORMAT = "livliv-model", FORMAT_VERSION = 4;
/** the format every model built before v4 has, and exports made until then: read as it is, whatever comes later */
export declare const LEGACY_FORMAT = "livemaker-puppet", LEGACY_VERSION = 3;
export declare const FEATURES: readonly string[];
/** names by language (BCP 47 tag -> text): an expression's, a layer's */
export type Labels = Record<string, string>;
/** center (kind livliv only): false draws the logo in the corner alone, without the light one over the character (the
 *  featured characters); missing or true, both (the free plan's) */
export interface Watermark {
    kind: 'livliv' | 'text' | 'none';
    text?: string;
    center?: boolean;
}
/** v4's `meta`: who and what made the package, under what terms, and the mark it asks the player to draw */
export interface ModelMeta {
    generator: {
        name: string;
        build?: string;
    };
    created?: string;
    author?: {
        name: string;
        url?: string;
    };
    license?: {
        id: string;
        url?: string;
        text?: string;
    };
    watermark?: Watermark;
}
/** v4's `files`: the optional files in the package, by what they are for */
export interface ModelFiles {
    keyforms?: string;
    avatar?: string;
    cover?: string;
    preview?: string;
}
/** limits a package is held to before anything is fetched, and before its images reach the GPU. A
 *  model.json is untrusted input (a package from anyone): these keep a broken or hostile one from hanging the page or
 *  filling its memory. The largest models LivLiv has built use a tenth of them or less (53 layers, 73 images, 8.5 M
 *  texels, 1536 px, a 22 KB model.json, 3 MB of keyforms) */
export declare const LIMITS: {
    canvas: number;
    layers: number;
    images: number;
    expressions: number;
    eyes: number;
    chains: number;
    points: number;
    /** an image's side (px) and all the model's images' pixels */
    texture: number;
    texels: number;
    /** model.json and keyforms.json (bytes) */
    modelJson: number;
    keyforms: number;
    /** a layer's mesh covers its box on one lattice (latticeCell), whatever its image: the vertices of all the boxes, and of
     *  the layers bent by chains times how many bend them. The heaviest of 111 models here: 46 000 and 40 000 */
    vertices: number;
    skinned: number;
};
/** an error a player can tell apart by its `code` (the SDK's LivLivError); livliv.ai reads only the words */
export declare const coded: (code: string, message: string) => Error & {
    code: string;
};
/** the lattice every layer's mesh sits on, in model px (the same for all: see Puppet.buildLayer) */
export declare const latticeCell: (w: number, h: number) => number;
/** A model.json as the runtime draws it: v3 as it is (the same object), v4 lowered into a new one. Throws on anything
 *  else, on a newer version than this player reads, and on a feature in `requires` it does not have. `lang` picks the
 *  expressions' `label` from their names by language (all of them stay in `labels`). Reading a result again returns
 *  it as it is */
export declare function readModel(raw: unknown, lang?: string): ModelDef;
/** the page's language (the browser's), for picking names */
export declare function uiLang(): string;
/** a name in `lang`: that tag, its script (zh-TW -> zh-Hant), its language, then English, Chinese, any, `fallback` */
export declare function pickLabel(labels: Labels | undefined, lang: string, fallback: string): string;
/** the language a name was written in, as v4 stores a name it has in one language only: kana ja, hangul ko, han zh,
 *  anything else en */
export declare function langOf(text: string): string;
