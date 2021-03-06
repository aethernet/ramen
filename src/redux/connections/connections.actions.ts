import { IGraphConnection } from "./connections.types";

export const INIT_CONNECTIONS = "INIT_CONNECTIONS";
export const SET_CONNECTIONS = "SET_CONNECTIONS";
export const DELETE_CONNECTION = "DELETE_CONNECTION";
export const CREATE_CONNECTION = "CREATE_CONNECTION";

export function initConnections(connections: IGraphConnection[]) {
  const payload = { connections };
  return { type: INIT_CONNECTIONS, payload };
}

export function deleteConnection(connectionId: string) {
  const payload = { connectionId };
  return { type: DELETE_CONNECTION, payload };
}

export function createConnection(connection: IGraphConnection) {
  const payload = { connection };
  return { type: CREATE_CONNECTION, payload };
}

export function setConnections(connections: IGraphConnection[]) {
  const payload = { connections };
  return { type: SET_CONNECTIONS, payload };
}
