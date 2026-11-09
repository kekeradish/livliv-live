export declare class Mark {
    /** the logo (the free plan's watermark), or `text` in the corner (the owner's own), or nothing */
    private logo;
    private text;
    private gl;
    private prog;
    private vao;
    private buf;
    private tex;
    private c;
    /** what the texture holds now: size, text and (the logo's first i is an eye that blinks) how open the eye is */
    private drawn;
    constructor(gl: WebGL2RenderingContext);
    /** what to draw: a package's meta.watermark kind ("livliv": the logo; "text": `text`; "none"). center: the logo also
     *  light over the character (the free plan's); false, in the corner only (meta.watermark.center: the featured
     *  characters) */
    set(kind: 'livliv' | 'text' | 'none', text: string | null, center?: boolean): void;
    private center;
    /** over the frame just rendered; `dpr`: drawing-buffer pixels per CSS pixel, so the mark is as big as on livliv.ai */
    draw(now: number, dpr: number): void;
    dispose(): void;
}
