/** One Euro filter (Casiez, Roussel, Vogel, CHI 2012): smooths hard while the signal holds still (no jitter) and
 *  less and less as it moves faster (little lag). minCutoff (Hz): smoothing at rest, lower is steadier; beta: how fast
 *  the cutoff rises with speed (per unit of the signal per second) */
export declare class OneEuro {
    minCutoff: number;
    beta: number;
    private x;
    private dx;
    constructor(minCutoff: number, beta: number);
    reset(): void;
    filter(v: number, dt: number): number;
}
