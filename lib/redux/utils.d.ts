/** Build a reducer that triggers a handler when a case matches an action type
 * @param initialState
 * @param handlers
 */
export declare function createReducer(initialState: any, handlers: any): (state: any, action: any) => any;
export declare function makeConnectionId(connection: any): string;
export declare function arrayToMap(array: any[]): any;
export declare function stringArrayToMap(array: any[]): any;
export declare function connectionsToMap(array: any[]): any;
