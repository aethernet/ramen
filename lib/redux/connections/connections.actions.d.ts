import { IGraphConnection } from "./connections.types";
export declare const INIT_CONNECTIONS = "INIT_CONNECTIONS";
export declare const SET_CONNECTIONS = "SET_CONNECTIONS";
export declare const DELETE_CONNECTION = "DELETE_CONNECTION";
export declare const CREATE_CONNECTION = "CREATE_CONNECTION";
export declare function initConnections(connections: IGraphConnection[]): {
    type: string;
    payload: {
        connections: IGraphConnection[];
    };
};
export declare function deleteConnection(connectionId: string): {
    type: string;
    payload: {
        connectionId: string;
    };
};
export declare function createConnection(connection: IGraphConnection): {
    type: string;
    payload: {
        connection: IGraphConnection;
    };
};
export declare function setConnections(connections: IGraphConnection[]): {
    type: string;
    payload: {
        connections: IGraphConnection[];
    };
};
