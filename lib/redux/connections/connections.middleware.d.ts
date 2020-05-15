/**
 * middleware
 *
 * @param {*} store
 */
declare const connectionMiddleware: (store: any) => (next: any) => (action: any) => any;
export default connectionMiddleware;
