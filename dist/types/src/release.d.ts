/** gives up the canvas's context, one task from now: losing and restoring within one task does nothing in Chromium and
 *  WebKit, and that is just what a framework's unmount and mount of the same canvas is (React's StrictMode). A player made
 *  on the canvas before then keeps it (see claimCanvas). A canvas without a WebGL context has nothing to give up */
export declare function releaseCanvas(canvas: HTMLCanvasElement, gl: WebGLRenderingContext | WebGL2RenderingContext | null): void;
/** a new player on this canvas: a release still to come is off; one that has happened cannot be undone */
export declare function claimCanvas(canvas: HTMLCanvasElement): void;
