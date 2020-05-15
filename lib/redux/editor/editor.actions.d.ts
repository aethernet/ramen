import { IGraphConnectionOrigin } from "../connections/connections.types";
export declare const SET_PENDING_CONNECTION_END_POS = "SET_PENDING_CONNECTION_END_POS";
export declare const SET_PENDING_CONNECTION_ORIGIN = "SET_PENDING_CONNECTION_ORIGIN";
export declare const START_DRAGGING_NODE = "START_DRAGGING_NODE";
export declare const STOP_DRAGGING_NODE = "STOP_DRAGGING_NODE";
export declare function setPendingConnectionEndPos(endPos: any): {
    type: string;
    payload: {
        endPos: any;
    };
};
export declare function setPendingConnectionOrigin(connectionOrigin: IGraphConnectionOrigin): {
    type: string;
    payload: {
        connectionOrigin: IGraphConnectionOrigin;
    };
};
export declare function startDraggingNode(): {
    type: string;
};
export declare function stopDraggingNode(): {
    type: string;
};
