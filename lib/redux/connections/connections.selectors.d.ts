import { IStoreState } from "../types";
import { IGraphConnection, IGraphConnectionOrigin, IGraphConnectionTarget } from "./connections.types";
/** returns the connection map as an array
 * @param state
 */
export declare function getConnections(state: IStoreState): IGraphConnection[];
/** returns the a connection given an id
 * @param state
 */
export declare function getConnectionById(state: IStoreState, connectionId: string): IGraphConnection;
/** returns true if the field as an input that is connected
 * @param fieldId
 */
export declare function isFieldInputConnected(state: IStoreState, nodeId: string, fieldId: string): boolean;
/** given a connection return the start of it in x, y coordinates
 * @param connection
 */
export declare function getConnectionStart(state: IStoreState, connection: IGraphConnectionOrigin): {
    x: any;
    y: number;
};
/** given a connection return the end of it in x, y coordinates
 * @param connection
 */
export declare function getConnectionEnd(state: IStoreState, connection: IGraphConnectionTarget): {
    x: number;
    y: number;
};
/** returns true if the schema allows for such a connection
 * @param state
 * @param connection
 */
export declare function isValidConnection(state: IStoreState, connection: IGraphConnection): any;
