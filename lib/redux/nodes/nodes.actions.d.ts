import { IPosition } from "../../types";
import { IGraphNode, ISetNodeLocationResult } from "./nodes.types";
export declare const INIT_NODES = "INIT_NODES";
export declare const SET_NODES = "SET_NODES";
export declare const SET_NODE_POSITION = "SET_NODE_POSITION";
export declare const DRAG_NODES = "DRAG_NODES";
export declare const DRAG_NODE = "DRAG_NODE";
export declare const DROP_NODE = "DROP_NODE";
export declare function initNodes(nodes: IGraphNode[]): {
    type: string;
    payload: {
        nodes: IGraphNode[];
    };
};
export declare function setNodes(nodes: IGraphNode[]): {
    type: string;
    payload: {
        nodes: IGraphNode[];
    };
};
export declare function dragNodes(nodeIds: string[], position: IPosition): {
    type: string;
    payload: {
        nodeIds: string[];
        position: IPosition;
    };
};
export declare function setNodePosition(nodeId: string, position: IPosition): ISetNodeLocationResult;
export declare function dropNode(nodeId: string, position: IPosition): ISetNodeLocationResult;
