/**
 * normalize the scroll behavior across browsers
 * @param delta
 */
export declare function normalizeScroll(delta: number): 1 | -1;
/** enrich viewport actions
 * @param store
 */
declare const viewportMiddleware: (store: any) => (next: any) => (action: any) => any;
export default viewportMiddleware;
