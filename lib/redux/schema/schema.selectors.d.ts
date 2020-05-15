import { IStoreState } from "../types";
export declare function getSchema(state: IStoreState): import("./schema.types").ISchema;
/** returns the schema of a node
 * @param nodeId
 */
export declare function getNodeSchema(state: IStoreState, nodeId: string): any;
/** returns a node given a node id
 * @param nodeId
 */
export declare function getFieldSchema(state: IStoreState, nodeId: string, fieldId: string): any;
export declare function getNodeType(state: IStoreState, nodeType: string): any;
export declare function getDataType(state: IStoreState, dataType: string): any;
export declare function getControlType(state: IStoreState, dataType: string): any;
export declare function getControlProps(state: IStoreState, dataType: string): any;
