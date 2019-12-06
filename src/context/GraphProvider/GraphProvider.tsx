import get from "lodash.get";
import * as React from "react";

import { FIELD_HEIGHT, NODE_HEADER_HEIGHT, NODE_WIDTH } from "../../constants";
import { IGraph, IGraphConnection, IGraphContext, IGraphNode, IGraphProviderProps, ILocation, ISchema, IGraphConnectionOrigin, ISchemaField } from "../../types";

export const GraphContext = React.createContext({} as IGraphContext);

const emptySchema: ISchema = {
  nodeTypes: {},
  dataTypes: {},
};

const emptyGraph: IGraph = {
  nodes: [],
  connections: [],
};

function GraphProvider(props: IGraphProviderProps) {
  const { children, graph, initialGraph, schema = emptySchema, onGraphChange = () => { } } = props;

  const [_graph, _setGraph] = React.useState(initialGraph || graph || emptyGraph);

  const useControlled = !!graph || graph === null;

  React.useEffect(() => {
    if (useControlled) _setGraph(graph);
  }, [graph]);

  /** change the internal graph state
   * @param {*} newGraph
   */
  function setGraph(newGraph: IGraph) {
    const graphData = { ..._graph, ...newGraph };
    onGraphChange(graphData);
    if (!useControlled) _setGraph(newGraph);
  }

  /** when dragging the node, update the node location in the editor state
   * updating the node location is necessary to re-render the noodles.
   * @param id
   * @param data
   */
  function updateNodeLocation(id: string, location: ILocation) {
    const rest: IGraphNode[] = [];
    let node: IGraphNode;

    _graph.nodes.forEach((_node) => {
      if (_node.id === id) node = _node;
      else rest.push(_node);
    });

    const newNode = { ...node, x: location.x, y: location.y };
    const newGraph = { ..._graph, nodes: [newNode, ...rest] };

    setGraph(newGraph);
  }

  /** returns a node given a node id
   * @param nodeId
   */
  function getNode(nodeId: string) {
    return _graph.nodes.find((node: IGraphNode) => node.id === nodeId);
  }

  /** returns a node given a node id
   * @param nodeId
   */
  function getFieldSchema(nodeId: string, fieldId: string) {
    const node = getNode(nodeId);
    if (!node) return null;
    const nodeType = node.type;
    return schema.nodeTypes[nodeType].fields.find((field: ISchemaField) => field.id === fieldId);
  }

  /** remove a connection
   * @param idx
   */
  function deleteConnection(idx: number) {
    const newConnections = _graph.connections.filter((_: any, _idx: number) => (_idx !== idx));
    const newGraph = { ..._graph, connections: newConnections };

    setGraph(newGraph);
  }

  /** check if a connection is valid
   * @param originDataType
   * @param targetDataType
   */
  function isValidConnection(connection: IGraphConnection) {
    const { originNode, originField, targetNode, targetField } = connection;
    const originDataType = getFieldSchema(originNode, originField).dataType;
    const targetDataType = getFieldSchema(targetNode, targetField).dataType;
    return get(schema, `dataTypes[${originDataType}].validTargets`, []).includes(targetDataType);
  }

  /** create a connection between two fields
   * @param connection
   */
  function createConnection(connection: IGraphConnection) {
    if (!isValidConnection(connection)) return;

    // TODO: avoid duplicate connections

    const newGraph = { ..._graph, connections: [connection, ..._graph.connections] };
    setGraph(newGraph);
  }

  /** given a connection return the start of it in x, y coordinates
   * @param connection
   */
  function getConnectionStart(connection: IGraphConnection | IGraphConnectionOrigin) {
    const node = getNode(connection.originNode);
    const nodeSchema = get(schema, `nodeTypes[${get(node, "type")}]`);
    const fieldIdx = get(nodeSchema, "fields", [])
      .findIndex((pin: any) => pin.id === connection.originField);

    if (!node || !nodeSchema || fieldIdx === -1) return null;

    const y = node.y + (fieldIdx * FIELD_HEIGHT) + NODE_HEADER_HEIGHT + (FIELD_HEIGHT / 2);
    const x = node.x + (nodeSchema.width || NODE_WIDTH);
    return { x, y };
  }

  /** given a connection return the end of it in x, y coordinates
   * @param connection
   */
  function getConnectionEnd(connection: IGraphConnection) {
    const node = getNode(connection.targetNode);
    const nodeSchema = get(schema, `nodeTypes[${get(node, "type")}]`);
    const fieldIdx = get(nodeSchema, "fields", [])
      .findIndex((pin: any) => pin.id === connection.targetField);

    if (!node || !nodeSchema || fieldIdx === -1) return null;

    const y = node.y + (fieldIdx * FIELD_HEIGHT) + NODE_HEADER_HEIGHT + (FIELD_HEIGHT / 2);
    const x = node.x;
    return { x, y };
  }

  /** returns true if the field as an input that is connected
   * @param fieldId
   */
  function isFieldInputConnected(nodeId: string, fieldId: string): boolean {
    return _graph.connections.some((connection) => (
      connection.targetField === fieldId && connection.targetNode === nodeId
    ));
  }

  const contextValues: IGraphContext = {
    graph: _graph,
    schema,
    setGraph,
    updateNodeLocation,
    createConnection,
    deleteConnection,
    getConnectionEnd,
    getConnectionStart,
    isFieldInputConnected,
  };

  return (
    <GraphContext.Provider value={contextValues}>
      {children}
    </GraphContext.Provider>
  );
}

export default GraphProvider;