import { IStoreState } from "../types";
/** returns an array with all nodes
 */
export declare function getNodes(state: IStoreState): import("./nodes.types").IGraphNode[];
/** returns a node given a node id
 * @param nodeId
 */
export declare function getNode(state: IStoreState, nodeId: string): import("./nodes.types").IGraphNode;
