/**
 * middleware
 *
 * @param {*} store
 */
declare const editorMiddleware: (store: any) => (next: any) => (action: any) => any;
export default editorMiddleware;
