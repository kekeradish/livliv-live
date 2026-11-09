export declare const BRAND_MARK = "LivLiv";
export declare const CORAL = "#ff4d5e";
export declare const LOGO_BOX: readonly [27, 44, 430, 133];
export declare const LETTERS = "M101.5 62.5V141.5Q101.5 158.5 115.5 158.5M145 107.5V158.5M176.3 107.5L200.5 158.5L224.7 107.5M257.5 62.5V141.5Q257.5 158.5 271.5 158.5M303 107.5V158.5M335.3 107.5L359.5 158.5L383.7 107.5";
export declare const BLUSH = "M40.5 122L49.5 142.1M60.5 122L69.5 142.1M421.5 122L412.5 142.1M441.5 122L432.5 142.1";
export declare const EYE: {
    cx: number;
    cy: number;
    r: number;
};
export declare const WINK = "M293.5 69H312.5A8 8 0 0 1 312.5 85H293.5A8 8 0 0 1 293.5 69Z";
/** Free-plan watermark, sized by the frame's shorter side so a portrait and a landscape frame carry the same mark: a
 *  light logo over the character (`center` of the shorter side wide, its middle at `centerY` of the height, above where
 *  subtitles reach; all white: its coral dots would read as marks on a face in a close-up; a soft shadow `centerBlur` of
 *  its own height so it still shows on white) plus the solid coloured one in a corner (`corner` wide, at least
 *  `cornerMin` CSS px, `margin` from both edges, at least 12 CSS px). The owner's own text mark takes the same corner,
 *  `text` of the shorter side tall (at least 12 CSS px). <Watermark> on livliv.ai and drawWatermark() in recordings and
 *  the SDK draw it from these numbers. Until 2026-10-21: center 0.62 at 0.6, alpha 0.38, coral dots. Until 2026-10-31:
 *  center 0.45 at 0.7, alpha 0.2; the corner logo 5 % of the frame's height (29 % of a portrait video's width, 9 % of a
 *  landscape one's), 0.45 of its own height from the edges; the text 2.2 % of the height in videos, 13 px elsewhere. */
export declare const WATERMARK: {
    center: number;
    centerY: number;
    centerAlpha: number;
    centerShadow: string;
    centerBlur: number;
    corner: number;
    cornerMin: number;
    margin: number;
    text: number;
    top: number;
};
/** How open the eye is at time `ms` (1 = open), on the same 5.5 s cycle as the CSS blink in <Logo>. */
export declare function eyeOpen(ms: number): number;
/** Draws the mark with its bottom-right corner at (right, bottom), `height` px tall; `accent`: its eyes and blush;
 *  `edge`: an outline that wide (in the logo's own units, its letters are 25) in `edgeColor` around all of it. */
export declare function drawLogo(g: CanvasRenderingContext2D, right: number, bottom: number, height: number, color: string, ms?: number, accent?: string, edge?: number, edgeColor?: string): void;
/** Where the corner mark goes in a w × h frame (see WATERMARK): its right edge, and its bottom edge, or with `top` its top
 *  edge: a portrait video's mark sits top right, `WATERMARK.top` of the height down, since Douyin and TikTok cover the
 *  bottom quarter (caption, name), the right edge from about the middle down (their buttons) and the top tenth (their
 *  tabs); elsewhere (a captioned sticker) `top` is the margin from the top edge. `px`: frame pixels per CSS pixel (the
 *  smallest sizes; the SDK draws on a high-DPI canvas). `logo`: the corner logo's height; `text`: the text's size. */
export declare function cornerSpot(w: number, h: number, top?: boolean, px?: number): {
    right: number;
    y: number;
    top: boolean;
    logo: number;
    text: number;
};
/** The solid logo in the corner alone: the free plan's screenshots and stickers, and part of drawWatermark. `outline`:
 *  a dark edge instead of the soft shadow, for pictures with one-bit alpha (GIF stickers) */
export declare function drawCornerLogo(g: CanvasRenderingContext2D, w: number, h: number, ms?: number, px?: number, top?: boolean, outline?: boolean): void;
/** The owner's own text mark (a paid plan's) in the corner mark's place. */
export declare function drawMarkText(g: CanvasRenderingContext2D, w: number, h: number, text: string, px?: number, top?: boolean): void;
/** Draws the free-plan watermark (see WATERMARK) onto a w × h frame; the canvas twin of <Watermark>. `px` and `top`:
 *  as cornerSpot */
export declare function drawWatermark(g: CanvasRenderingContext2D, w: number, h: number, ms?: number, px?: number, top?: boolean): void;
