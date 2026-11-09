import type { Body, Pose } from './body.js';
export declare const PNG_SLOTS: readonly [{
    readonly id: "closed";
    readonly label: "Mouth closed";
    readonly need: true;
}, {
    readonly id: "open";
    readonly label: "Mouth open";
    readonly need: true;
}, {
    readonly id: "blink";
    readonly label: "Eyes closed";
    readonly need: false;
}, {
    readonly id: "blink-open";
    readonly label: "Eyes closed, mouth open";
    readonly need: false;
}];
export type PngSlot = (typeof PNG_SLOTS)[number]['id'];
export declare class PngBody implements Body {
    readonly format = "png";
    private pics;
    private g;
    attach(canvas: HTMLCanvasElement): void;
    load(files: Map<string, Blob>): Promise<{
        name: string;
        expressions: never[];
    }>;
    render(canvas: HTMLCanvasElement, { params: P, move }: Pose, w: number, h: number): void;
    /** a picture's head: near the top, about the middle */
    head(): {
        x: number;
        y: number;
        rx: number;
        ry: number;
    };
    dispose(): void;
}
