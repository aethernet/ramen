import React__default, { memo, createElement, useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual, Provider } from 'react-redux';
import styled, { css, createGlobalStyle } from 'styled-components';
import undoable, { ActionCreators, groupByActionTypes, excludeAction } from 'redux-undo';
import Selection from '@simonwep/selection-js';
import get from 'lodash.get';
import AlloyFinger from 'alloyfinger';
import Draggable from 'react-draggable';
import produce from 'immer';
import { combineReducers, applyMiddleware, createStore, compose } from 'redux';

const lightTheme = {
    fontName: "Helvetica, Oswald, sans-serif",
    fontSize: "12px",
    borderRadius: "4px",
    borderWidth: "2px",
    textColor: "#4A5967",
    textSecondary: "#96A1A9",
    borderColor: "#D9E1E7",
    editorBackground: "#FAFCFE",
    editorBackgroundMuted: "#96A1A9",
    nodeBackground: "rgba(238, 242, 245, .8)",
    nodeBackgroundSelected: "rgba(217, 239, 255, 0.8)",
    nodeBorderSelected: "#29abe1",
    pinBorder: "#333",
    noodleColor: "#333",
    inputBackground: "#ffffff",
};
const darkTheme = {
    fontName: "Helvetica, Oswald, sans-serif",
    fontSize: "12px",
    borderRadius: "2px",
    borderWidth: "2px",
    textColor: "#dce2e6",
    textSecondary: "#96A1A9",
    borderColor: "#3c4955",
    editorBackground: "#14222D",
    editorBackgroundMuted: "#96A1A9",
    nodeBackground: "rgba(45, 58, 71, 0.9)",
    nodeBackgroundSelected: "rgba(16, 78, 104, 0.8)",
    nodeBorderSelected: "#29abe1",
    pinBorder: "#dce2e6",
    noodleColor: "#dce2e6",
    inputBackground: "#14222D",
};

const EditorBackground = styled.div `
  height: ${(props) => props.height ? `${props.height}px` : "100%"};
  width: ${(props) => props.width ? `${props.width}px` : "100%"};
  position: relative;
  background-image: radial-gradient(${({ theme }) => (theme.editorBackgroundMuted || lightTheme.editorBackgroundMuted)}, transparent 10%);
  background-color: ${({ theme }) => (theme.editorBackground || lightTheme.editorBackground)};
  background-size: 1.5rem 1.5rem;
`;
function Background(props) {
    const editorId = useSelector((state) => state.references.editorId);
    return (createElement(EditorBackground, Object.assign({}, props, { id: editorId })));
}
var EditorBackground$1 = memo(Background);

const BASE_EDITOR_ID = "ramen-editor";
const BASE_VIEWPORT_ID = "ramen-viewport";
const NODE_CLASSNAME = "ramen-node";
const NOODLE_CLASSNAME = "ramen-noodle";
const NODE_WIDTH = 200;
const NODE_HEADER_HEIGHT = 60;
const FIELD_HEIGHT = 42;
const PIN_RADIUS = 8;
const types = {
    FIELD: "FIELD",
};
const DEFAULT_CONTROL_TYPE = "InputControl";

const INIT_CONNECTIONS = "INIT_CONNECTIONS";
const SET_CONNECTIONS = "SET_CONNECTIONS";
const DELETE_CONNECTION = "DELETE_CONNECTION";
const CREATE_CONNECTION = "CREATE_CONNECTION";
function initConnections(connections) {
    const payload = { connections };
    return { type: INIT_CONNECTIONS, payload };
}
function deleteConnection(connectionId) {
    const payload = { connectionId };
    return { type: DELETE_CONNECTION, payload };
}
function createConnection(connection) {
    const payload = { connection };
    return { type: CREATE_CONNECTION, payload };
}
function setConnections(connections) {
    const payload = { connections };
    return { type: SET_CONNECTIONS, payload };
}

const SET_PENDING_CONNECTION_END_POS = "SET_PENDING_CONNECTION_END_POS";
const SET_PENDING_CONNECTION_ORIGIN = "SET_PENDING_CONNECTION_ORIGIN";
function setPendingConnectionEndPos(endPos) {
    const payload = { endPos };
    return { type: SET_PENDING_CONNECTION_END_POS, payload };
}
function setPendingConnectionOrigin(connectionOrigin) {
    const payload = { connectionOrigin };
    return { type: SET_PENDING_CONNECTION_ORIGIN, payload };
}

function getEditor(state) {
    return state.editor;
}
function getPendingConnection(state) {
    return state.editor.pendingConnectionOrigin;
}

// TODO: remove the editor events component in favor of events fired directly from the components:
// editor background, fields
function EditorEvents() {
    const dispatch = useDispatch();
    const pendingConnectionOrigin = useSelector(getPendingConnection);
    const editorId = useSelector((state) => state.references.editorId);
    useEffect(() => {
        const editor = document.getElementById(editorId);
        function onPointerDownField(targetData) {
            const fieldId = targetData.fieldid;
            const isInput = targetData.isinput;
            const nodeId = targetData.nodeid;
            if (fieldId && isInput !== "true") {
                dispatch(setPendingConnectionOrigin({ originField: fieldId, originNode: nodeId }));
            }
        }
        /**
         * start dragging noodle
         * @param e
         */
        function onPointerDown(e) {
            const target = e.target;
            const type = target.dataset.type;
            if (type === types.FIELD) {
                e.stopPropagation();
                e.preventDefault();
                onPointerDownField(target.dataset);
            }
        }
        /**
         * stop dragging noodle
         * @param e
         */
        function onPointerUp(e) {
            //This hack fix the connection issue on mobile safari. Without it touch patching is not possible (event.target = pointerdown target instead of pointerup, unknwn reason, no time to investigate further)
            const targetDomElm = document.querySelector("div[data-type=FIELD][data-isInput=true]:hover");
            if (!targetDomElm) {
                e.stopPropagation();
                e.preventDefault();
                dispatch(setPendingConnectionOrigin(null));
                return;
            }
            const target = targetDomElm;
            const fieldId = target.dataset.fieldid;
            const isInput = target.dataset.isinput;
            const nodeId = target.dataset.nodeid;
            if ((!fieldId || isInput !== "true") && pendingConnectionOrigin) {
                e.stopPropagation();
                e.preventDefault();
                dispatch(setPendingConnectionOrigin(null));
            }
            if (fieldId && isInput === "true" && pendingConnectionOrigin) {
                e.stopPropagation();
                e.preventDefault();
                dispatch(createConnection({ ...pendingConnectionOrigin, targetField: fieldId, targetNode: nodeId }));
                dispatch(setPendingConnectionOrigin(null));
            }
        }
        function onPointerMove(e) {
            if (pendingConnectionOrigin) {
                e.stopPropagation();
                e.preventDefault();
                dispatch(setPendingConnectionEndPos({ x: e.x, y: e.y }));
            }
        }
        editor.addEventListener("pointerdown", onPointerDown);
        editor.addEventListener("pointerup", onPointerUp);
        editor.addEventListener("pointermove", onPointerMove);
        return () => {
            editor.removeEventListener("pointerdown", onPointerDown);
            editor.removeEventListener("pointerup", onPointerUp);
            editor.removeEventListener("pointermove", onPointerMove);
        };
    }, [pendingConnectionOrigin]);
    return null;
}

/** returns the id of the viewport
 */
function getViewportId(state) {
    return state.references.viewportId;
}
/** returns the id of the editor
 */
function getEditorId(state) {
    return state.references.editorId;
}

function getViewport(state) {
    return state.viewport;
}
function getViewportZoom(state) {
    return state.viewport.zoom;
}

const Viewport = styled.div `
  height: 100%;
  width: 100%;
  overflow: hidden;
`;
const EditorWrapperBackground = styled.div.attrs(({ xPos, yPos, scale }) => ({
    style: {
        transform: `translate(${xPos}px, ${yPos}px) scale(${scale})`,
    }
})) `
  display: inline-block;
  ${(props) => !props.width && "width: 100%;"};
  transform-origin: 0px 0px 0px;
`;

function useKeyEvents(viewport) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (!viewport)
            return;
        // handle ctrl + z, ctrl + y
        function onKeyDown(e) {
            if (e.ctrlKey && e.keyCode === 90) {
                dispatch(ActionCreators.undo());
            }
            if (e.ctrlKey && e.keyCode === 89) {
                dispatch(ActionCreators.redo());
            }
        }
        viewport.addEventListener("keydown", onKeyDown);
        return () => {
            viewport.removeEventListener("keydown", onKeyDown);
        };
    }, [viewport]);
}

const SET_SELECTION = "SET_SELECTION";
function setSelection(selection) {
    const payload = { selection };
    return { type: SET_SELECTION, payload };
}

function isValidSelectionStart(evt) {
    const selectionClassName = get(evt, "selected[0].classList");
    if (selectionClassName &&
        (selectionClassName.contains(NODE_CLASSNAME) ||
            selectionClassName.contains(NOODLE_CLASSNAME))) {
        return false;
    }
    return true;
}
function useSelection(viewport) {
    const dispatch = useDispatch();
    const [isSelecting, setSelecting] = useState(false);
    // reset selection when clicking the viewport (when not selecting anything)
    useEffect(() => {
        if (!viewport)
            return;
        function resetSelection(e) {
            if (!isSelecting && e.target.tagName === "svg")
                dispatch(setSelection([]));
        }
        viewport.addEventListener("pointerdown", resetSelection);
        return () => {
            viewport.removeEventListener("pointerdown", resetSelection);
        };
    }, [viewport, isSelecting]);
    // create a new selection object bound to our local viewport
    useEffect(() => {
        if (!viewport)
            return;
        const selection = new Selection({
            selectables: [`.${NODE_CLASSNAME}`, `.${NOODLE_CLASSNAME}`],
            startareas: [`#${viewport.id}`],
            singleClick: false,
        });
        function beforeSelection(evt) {
            return evt.oe.target.tagName !== "INPUT"
                && evt.oe.target.tagName !== "TEXTAREA";
        }
        function startSelection(evt) {
            if (isValidSelectionStart(evt)) {
                setSelecting(true);
            }
            else {
                selection.cancel();
            }
        }
        function stopSelection(evt) {
            setSelecting(false);
            dispatch(setSelection(evt.selected.map((selected) => `${selected.id}`)));
        }
        selection
            .on("beforestart", beforeSelection)
            .on("start", startSelection)
            .on("stop", stopSelection);
        return () => {
            selection.destroy();
        };
    }, [viewport]);
    return null;
}

const SET_VIEWPORT_ZOOM = "SET_VIEWPORT_ZOOM";
const SET_VIEWPORT_POS = "SET_VIEWPORT_POS";
const SET_VIEWPORT_POS_DELTA = "SET_VIEWPORT_POS_DELTA";
const START_PANNING = "START_PANNING";
const STOP_PANNING = "STOP_PANNING";
function setViewportZoom(zoom, x, y) {
    const payload = { zoom, x, y };
    return { type: SET_VIEWPORT_ZOOM, payload };
}
function setViewportPosDelta(x, y) {
    const payload = { x, y };
    return { type: SET_VIEWPORT_POS_DELTA, payload };
}

function useZoomingAndPanning(canZoom, canPan, viewport) {
    const dispatch = useDispatch();
    const isPanning = useSelector((state) => state.viewport.isPanning, shallowEqual);
    useEffect(() => {
        if (!viewport)
            return;
        const af = new AlloyFinger(viewport, {});
        // zoom on alt + scroll
        function onWheelScroll(e) {
            e.preventDefault();
            if (e.altKey && canZoom)
                dispatch(setViewportZoom(e.deltaY, e.clientX, e.clientY));
            else if (canPan) {
                dispatch(setViewportPosDelta(e.deltaX, e.deltaY));
            }
        }
        function onPinch(e) {
            const zoom = 1 - e.zoom;
            if (zoom < -0.5 || zoom > 0.5) //prevent accidental zoom when drag
                dispatch(setViewportZoom(zoom * 3, e.pageX, e.pageY));
        }
        function ontwoFingerPressMove(e) {
            dispatch(setViewportPosDelta(-e.deltaX, -e.deltaY));
        }
        // //FIXME: this doesnt work
        // function onPointerMove(e: MouseEvent) {
        //   if (!isPanning && !e.buttons) return
        //   if (!isPanning) dispatch(startPanning(e.pageX, e.pageY))
        //   if (isPanning && (!e.altKey || !e.buttons)) dispatch(stopPanning())
        //   if (isPanning) dispatch(setViewportPos(e.pageX, e.pageY))
        //   e.preventDefault()
        //   e.stopPropagation()
        // }
        viewport.addEventListener("wheel", onWheelScroll);
        if (canPan) {
            af.on("twoFingerPressMove", ontwoFingerPressMove);
        }
        if (canZoom) {
            af.on("pinch", onPinch);
        }
        return () => {
            viewport.removeEventListener("wheel", onWheelScroll);
            af.destroy();
        };
    }, [canZoom, viewport]);
    return null;
}

function EditorWrapper(props) {
    const { xPos, yPos, zoom } = useSelector(getViewport, shallowEqual);
    return (React__default.createElement(EditorWrapperBackground, { xPos: xPos, yPos: yPos, scale: zoom }, props.children));
}
/** provides zooming and panning functionality
 * @param props
 */
function EditorViewport(props) {
    const { children } = props;
    const { canPan = true, canZoom = true } = props;
    const viewportRef = useRef(null);
    const [viewport, setViewport] = React__default.useState(null);
    const viewportId = useSelector(getViewportId, shallowEqual);
    React__default.useEffect(() => {
        if (viewportRef.current && !viewport) {
            setViewport(viewportRef.current);
        }
    }, [viewportRef]);
    // zoom functionality
    useZoomingAndPanning(canZoom, canPan, viewport);
    // key binds
    useKeyEvents(viewport);
    // selection events
    useSelection(viewport);
    return (React__default.createElement(Viewport, { id: viewportId, ref: viewportRef, tabIndex: viewportId },
        React__default.createElement(EditorWrapper, null, children)));
}
var EditorViewport$1 = React__default.memo(EditorViewport, (prevProps, nextProps) => {
    return prevProps.canPan === nextProps.canPan
        && prevProps.canZoom === nextProps.canZoom;
});

const INIT_NODES = "INIT_NODES";
const SET_NODES = "SET_NODES";
const SET_NODE_POSITION = "SET_NODE_POSITION";
const DRAG_NODES = "DRAG_NODES";
const DROP_NODE = "DROP_NODE";
function initNodes(nodes) {
    const payload = { nodes };
    return { type: INIT_NODES, payload };
}
function setNodes(nodes) {
    const payload = { nodes };
    return { type: SET_NODES, payload };
}
function dragNodes(nodeIds, position) {
    const payload = { nodeIds, position };
    return { type: DRAG_NODES, payload };
}
// this function is used to delimitate different nodes being dragged
function dropNode(nodeId, position) {
    const payload = { nodeId, position };
    return { type: DROP_NODE, payload };
}

/** returns an array with all nodes
 */
function getNodes(state) {
    return Object.values(state.history.present.nodes) || [];
}
/** returns a node given a node id
 * @param nodeId
 */
function getNode(state, nodeId) {
    return state.history.present.nodes[nodeId];
}

/** returns an array with the ids of selected elements
 */
function getSelection(state) {
    return state.selection || {};
}
// export function canDragSelect(state: IStoreState): boolean {
//   const canSelect = !pendingConnectionOrigin
// }

/** returns the schema of a node
 * @param nodeId
 */
function getNodeSchema(state, nodeId) {
    const node = getNode(state, nodeId);
    return get(state, `schema.nodeTypes[${get(node, "type")}]`);
}
/** returns a node given a node id
 * @param nodeId
 */
function getFieldSchema(state, nodeId, fieldId) {
    return get(getNodeSchema(state, nodeId), `fields`, [])
        .find((field) => field.id === fieldId) || {};
}
function getNodeType(state, nodeType) {
    return get(state, `schema.nodeTypes.${nodeType}`, {});
}
function getDataType(state, dataType) {
    return get(state, `schema.dataTypes.${dataType}`, {});
}
function getControlProps(state, dataType) {
    return get(state, `schema.dataTypes.${dataType}.controlProps`, {});
}

/** returns the connection map as an array
 * @param state
 */
function getConnections(state) {
    return Object.values(state.history.present.connections) || [];
}
/** returns the a connection given an id
 * @param state
 */
function getConnectionById(state, connectionId) {
    return state.history.present.connections[connectionId];
}
/** returns true if the field as an input that is connected
 * @param fieldId
 */
function isFieldInputConnected(state, nodeId, fieldId) {
    return Object.values(state.history.present.connections).some((connection) => (connection.targetField === fieldId && connection.targetNode === nodeId));
}
/** given a connection return the start of it in x, y coordinates
 * @param connection
 */
function getConnectionStart(state, connection) {
    if (!connection)
        return null;
    const node = getNode(state, connection.originNode);
    const nodeSchema = getNodeSchema(state, connection.originNode);
    const fieldIdx = get(nodeSchema, "fields", [])
        .findIndex((pin) => pin.id === connection.originField);
    if (!node || !nodeSchema || fieldIdx === -1)
        return null;
    const y = node.y + (fieldIdx * FIELD_HEIGHT) + NODE_HEADER_HEIGHT + (FIELD_HEIGHT / 2);
    const x = node.x + (nodeSchema.width || NODE_WIDTH);
    return { x, y };
}
/** given a connection return the end of it in x, y coordinates
 * @param connection
 */
function getConnectionEnd(state, connection) {
    if (!connection)
        return null;
    const node = getNode(state, connection.targetNode);
    const nodeSchema = get(state, `schema.nodeTypes[${get(node, "type")}]`);
    const fieldIdx = get(nodeSchema, "fields", [])
        .findIndex((pin) => pin.id === connection.targetField);
    if (!node || !nodeSchema || fieldIdx === -1)
        return null;
    const y = node.y + (fieldIdx * FIELD_HEIGHT) + NODE_HEADER_HEIGHT + (FIELD_HEIGHT / 2);
    const x = node.x;
    return { x, y };
}
/** returns true if the schema allows for such a connection
 * @param state
 * @param connection
 */
function isValidConnection(state, connection) {
    const { originNode, originField, targetNode, targetField } = connection;
    const originDataType = getFieldSchema(state, originNode, originField).dataType;
    const targetDataType = getFieldSchema(state, targetNode, targetField).dataType;
    if (!get(state, `schema.dataTypes[${originDataType}].validTargets`))
        return true;
    return get(state, `schema.dataTypes[${originDataType}].validTargets`, []).includes(targetDataType);
}

const StyledInput = styled.input `
  flex: 1;
  border: 1px solid ${({ theme }) => theme.borderColor || lightTheme.borderColor};
  background: ${({ theme }) => theme.inputBackground || lightTheme.inputBackground};
  border-radius: 4px;
  height: 28px;
  align-self: center;
  min-width: 0;
  color: ${({ theme }) => theme.textColor || lightTheme.textColor};
  padding: 0 8px;
  font-size: .9rem;
`;
const ControlBackground = styled.div `
  display: flex;
  height: 100%;
  overflow: hidden;
  span {
    color: ${({ theme }) => theme.textSecondary || lightTheme.textSecondary};
    margin-right: 2rem;
  }
`;

function DefaultControl(props) {
    const { name, ...rest } = props;
    const onInputClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    return (createElement(ControlBackground, { className: "noDrag" },
        createElement(StyledInput, Object.assign({ onClick: onInputClick, placeholder: name }, rest))));
}

const PinContainer = styled.div `
  height: ${(props) => `${props.radius * 2}px`};
  width: ${(props) => `${props.radius * 2}px`};
  border-width: 2px;
  border-style: solid;
  border-color: transparent;
  align-self: center;
`;
const Pin = styled(PinContainer) `
  border-radius: ${(props) => `${props.radius * 2}px`};
  border-color: ${({ theme }) => theme.pinBorder || lightTheme.pinBorder};
  background: ${(props) => props.color || "#2D9CDB"};
  cursor: pointer;
`;
function getTransform({ isInput }) {
    return (props) => {
        const pinBorderWidth = parseInt(props.theme.borderWidth || lightTheme.borderWidth, 10);
        const transformX = (props.radius + pinBorderWidth);
        return `translate(${isInput ? "-" : ""}${transformX}px, -${pinBorderWidth}px)`;
    };
}
const InputPin = styled(Pin) `
  transform: ${getTransform({ isInput: true })};
`;
const OutputPin = styled(Pin) `
  transform: ${getTransform({ isInput: false })};
`;
const Background$1 = styled.div `
  height: ${(props) => props.height}px;
  display: flex;
  flex: 1;
  line-height: ${(props) => props.height}px;
  color: #96A1A9;
`;
const FieldContent = styled.div `
  overflow: hidden;
  display: flex;
  flex: 1;
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary || lightTheme.textSecondary};
  text-align: ${(props) => props.align};
  justify-content: ${(props) => props.align};

  > * {
    align-self: center;
  }
`;

function DefaultField(props) {
    const { input, output, children, height, color, fieldId, nodeId, className } = props;
    let align = "center";
    if (input && !output)
        align = "left";
    if (output && !input)
        align = "right";
    return (React__default.createElement(Background$1, { height: height, hasInput: input },
        input
            ? (React__default.createElement(InputPin, { "data-type": types.FIELD, "data-isinput": true, "data-fieldid": fieldId, "data-nodeid": nodeId, className: "noDrag", radius: PIN_RADIUS, color: color }))
            : React__default.createElement(PinContainer, { radius: PIN_RADIUS }),
        React__default.createElement(FieldContent, { align: align }, children),
        output
            ? (React__default.createElement(OutputPin, { "data-type": types.FIELD, "data-isinput": false, "data-fieldid": fieldId, "data-nodeid": nodeId, className: "noDrag", radius: PIN_RADIUS, color: color }))
            : React__default.createElement(PinContainer, { radius: PIN_RADIUS })));
}

const selected = css `
  background: ${({ theme }) => theme.nodeBackgroundSelected || lightTheme.nodeBackgroundSelected};
  border-color: ${({ theme }) => theme.nodeBorderSelected || lightTheme.nodeBorderSelected};
`;
const NodeWrapper = styled.div `
  display: inline-block;
  width: ${({ width }) => width}px;
  color: ${({ theme }) => theme.textColor || lightTheme.textColor};
  background: ${({ theme }) => theme.nodeBackground || lightTheme.nodeBackground};
  border-radius: ${({ theme }) => theme.borderRadius || lightTheme.borderRadius};
  min-height: 108px;
  border: ${({ theme }) => theme.borderWidth || lightTheme.borderWidth} solid ${({ theme }) => theme.borderColor || lightTheme.borderColor};
  ${(props) => props.selected && selected};
`;
const NodeTitle = styled.div `
  padding: 12px 8px;
  font-size: 1.1rem;
  height: 36px;
  text-align: left;
  box-sizing: content-box;
`;
const NodeSubtitle = styled.div `
  color: ${({ theme }) => theme.textSecondary || lightTheme.textSecondary};
  font-size: .9rem;
  text-align: left;
`;
const ControlWrapper = styled.span `
  display: flex;
  max-width: 100%;
`;

function getFieldControl(controls, controlType, dataTypeControlType) {
    const FieldControl = controls[controlType || dataTypeControlType || ""];
    if (FieldControl) {
        return FieldControl;
    }
    if (controlType === DEFAULT_CONTROL_TYPE || dataTypeControlType === DEFAULT_CONTROL_TYPE) {
        return DefaultControl;
    }
    return null;
}
function NodeField(props) {
    const { fieldId, nodeId, name, dataType, controlType, controlProps, fieldProps = {} } = props;
    const { hideControlOnInput, hasInput, hasOutput, controls = {} } = props;
    const fieldDataTypeDetails = useSelector((state) => getDataType(state, dataType), shallowEqual);
    const dataTypeControlProps = useSelector((state) => getControlProps(state, dataType), shallowEqual);
    const hasInputConnection = useSelector((state) => isFieldInputConnected(state, nodeId, fieldId), shallowEqual);
    const FieldControl = getFieldControl(controls, controlType, fieldDataTypeDetails.controlType);
    const fieldName = name || fieldDataTypeDetails.name;
    const customControlProps = { ...fieldProps, ...(controlProps || dataTypeControlProps || {}) };
    const hideControl = hideControlOnInput && hasInputConnection || !FieldControl;
    return (createElement(DefaultField, { nodeId: nodeId, fieldId: fieldId, color: fieldDataTypeDetails.color, key: fieldId, input: hasInput, output: hasOutput, height: FIELD_HEIGHT }, hideControl ? fieldName :
        createElement(ControlWrapper, { className: "noDrag" },
            createElement(FieldControl, Object.assign({ name: fieldName }, customControlProps)))));
}
const MemoizedNodeField = memo(NodeField, (prevProps, nextProps) => {
    return prevProps.fieldId === nextProps.fieldId
        && prevProps.name === nextProps.name
        && prevProps.dataType === nextProps.dataType
        && prevProps.controlType === nextProps.controlType
        && prevProps.controlProps === nextProps.controlProps
        && prevProps.isInput === nextProps.isInput
        && prevProps.isOutput === nextProps.isOutput
        && prevProps.hideControlOnInput === nextProps.hideControlOnInput;
});
function DefaultNode(props) {
    const { nodeId, className, style, type, onMouseUpFieldIn, selected = false, name, controls, nodeState = {}, ...rest } = props;
    const nodeType = useSelector((state) => getNodeType(state, type));
    const dispatch = useDispatch();
    const typeName = nodeType.name;
    const nodeWidth = nodeType.width || NODE_WIDTH;
    const nodeFields = get(nodeType, `fields`, [])
        .map((field) => (createElement(MemoizedNodeField, { key: field.id, fieldId: field.id, nodeId: nodeId, dataType: field.dataType, controlType: field.controlType, controlProps: field.controlProps, fieldProps: nodeState[field.id], controls: controls, hideControlOnInput: field.hideControlOnInput, name: field.name, hasInput: field.input, hasOutput: field.output })));
    return (createElement(NodeWrapper, Object.assign({}, rest, { id: nodeId, className: `${NODE_CLASSNAME} ${className || ""}`, style: style, width: nodeWidth, selected: selected, onPointerDown: () => {
            if (!selected)
                dispatch(setSelection([nodeId]));
        } }),
        createElement(NodeTitle, null,
            name || typeName,
            name && createElement(NodeSubtitle, null, typeName)),
        createElement("div", null, nodeFields)));
}
var DefaultNode$1 = memo(DefaultNode, (prevProps, nextProps) => {
    return prevProps.name === nextProps.name
        && prevProps.type === nextProps.type
        && prevProps.className === nextProps.className
        && prevProps.nodeId === nextProps.nodeId
        && prevProps.selected === nextProps.selected;
});

const Wrap = styled.div `
  position: absolute;
  z-index: ${(props) => props.selected ? 120 : 100};
  cursor: move;
`;
function DragWrapper(props) {
    const { children, defaultX, defaultY, selected, onDrag, onStop } = props;
    const defaultPos = { x: defaultX, y: defaultY };
    const dispatch = useDispatch();
    const zoom = useSelector(getViewportZoom);
    const editorId = useSelector(getEditorId);
    return (createElement(Draggable, { scale: zoom, bounds: `#${editorId}`, position: defaultPos, cancel: ".noDrag", onDrag: onDrag, onStop: onStop },
        createElement(Wrap, { selected: selected }, children)));
}
var DragWrapper$1 = memo(DragWrapper, (prevProps, nextProps) => {
    return prevProps.defaultX === nextProps.defaultX
        && prevProps.defaultY === nextProps.defaultY
        && prevProps.nodeId === nextProps.nodeId
        && prevProps.selected === nextProps.selected;
});

function NodeLayer(props) {
    const nodes = useSelector(getNodes, shallowEqual);
    const selection = useSelector(getSelection, shallowEqual);
    const dispatch = useDispatch();
    return (createElement("div", { style: { position: "relative", height: "100%", width: "100%" } }, nodes.map((node) => (createElement(DragWrapper$1, { selected: selection[`${node.id}`], key: node.id, nodeId: node.id, defaultX: node.x, defaultY: node.y, onDrag: (e, { deltaX, deltaY }) => {
            dispatch(dragNodes(Object.keys(selection), { x: deltaX, y: deltaY }));
        }, onStop: (e, { x, y }) => {
            dispatch(dropNode(node.id, { x, y }));
        } },
        createElement(DefaultNode$1, { selected: selection[`${node.id}`], nodeId: node.id, name: node.name, type: node.type, controls: props.controls, nodeState: (props.graphState || {})[`${node.id}`] }))))));
}

/** Build a reducer that triggers a handler when a case matches an action type
 * @param initialState
 * @param handlers
 */
function createReducer(initialState, handlers) {
    return (state = initialState, action) => {
        const type = Object.keys(handlers).find((actionType) => get(action, "type") === actionType);
        if (!type)
            return state;
        return produce(state, (draft) => handlers[type](draft, action));
    };
}
function makeConnectionId(connection) {
    return Object.keys(connection).sort().map((val) => connection[val]).join("_");
}
function arrayToMap(array) {
    const map = array.reduce((map, item, idx) => {
        const { id } = item;
        const newItem = { ...item };
        newItem.idx = idx;
        map[id || idx] = newItem;
        return map;
    }, {});
    return map;
}
function stringArrayToMap(array) {
    const map = array.reduce((map, item) => {
        map[item] = true;
        return map;
    }, {});
    return map;
}
function connectionsToMap(array) {
    const map = array.reduce((map, item, idx) => {
        const id = makeConnectionId(item);
        const newItem = { ...item };
        map[id] = newItem;
        return map;
    }, {});
    return map;
}

const NoodlePath = styled.path `
  stroke: ${({ theme }) => theme.noodleColor || lightTheme.noodleColor};
`;
function distance(start, end) {
    return Math.sqrt((end.x - start.x) * (end.x - start.x) +
        (end.y - start.y) * (end.y - start.y));
}
function bezierCurve(a, b, cp1x, cp1y, cp2x, cp2y, x, y) {
    return `M${a},${b} C${cp1x},${cp1y} ${cp2x},${cp2y}  ${x},${y}`;
}
function Noodle(props) {
    const { id, start, end, onPointerDown } = props;
    if (!start || !end)
        return null;
    const dist = distance(start, end);
    const cp1 = { x: start.x + dist * 0.15, y: start.y };
    const cp2 = { x: end.x - dist * 0.15, y: end.y };
    const pathString = bezierCurve(start.x, start.y, cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    return (React__default.createElement("g", null,
        React__default.createElement(NoodlePath, { id: `noodle-${id}`, className: "ramen-noodle", d: pathString, fill: "none", strokeWidth: "4" }),
        React__default.createElement("path", { onMouseDown: onPointerDown, d: pathString, fill: "none", stroke: "transparent", strokeWidth: "20", style: { cursor: "pointer" } })));
}
var Noodle$1 = React__default.memo(Noodle, (prevProps, nextProps) => {
    return nextProps.start && nextProps.end
        && prevProps.start && prevProps.end
        && prevProps.start.x === nextProps.start.x
        && prevProps.start.y === nextProps.start.y
        && prevProps.end.x === nextProps.end.x
        && prevProps.end.y === nextProps.end.y;
});

const Noodles = styled.svg `
  position: absolute;
  z-index: 90;
  height: ${(props) => props.height || "100%"};
  width: ${(props) => props.width || "100%"};
  top: 0;
  left: 0;
`;

/** fetch the connection start, end from the state. Map it to the Noodle object
 * @param props
 */
function NoodleWrapper(props) {
    const { id, connection } = props;
    const dispatch = useDispatch();
    const connectionStart = useSelector((state) => getConnectionStart(state, connection));
    const connectionEnd = useSelector((state) => getConnectionEnd(state, connection));
    return (React__default.createElement(Noodle$1, { id: id, start: connectionStart, end: connectionEnd, onPointerDown: () => {
            dispatch(deleteConnection(makeConnectionId(connection)));
            dispatch(setPendingConnectionOrigin(connection));
        } }));
}
/** incomplete connection
 * @param props
 */
function PendingConnection(props) {
    const { pendingConnectionEndPos, pendingConnectionOrigin, } = useSelector(getEditor, shallowEqual);
    const pendingConnectionStartPos = useSelector((state) => getConnectionStart(state, pendingConnectionOrigin), shallowEqual);
    if (!pendingConnectionOrigin)
        return null;
    return (React__default.createElement(Noodle$1, { id: -1, start: pendingConnectionStartPos, end: pendingConnectionEndPos }));
}
function NoodleLayer() {
    const connections = useSelector(getConnections, shallowEqual);
    return (React__default.createElement(Noodles, null,
        connections.map((connection, idx) => {
            return (React__default.createElement(NoodleWrapper, { key: idx, id: idx, connection: connection }));
        }),
        React__default.createElement(PendingConnection, null)));
}

const GlobalStyle = createGlobalStyle `
  .selection-area {
    background: #29abe1;
    border-radius: 2px;
    border: 2px solid #0c5371;
    opacity: .2;
  }
`;

const SET_SCHEMA = "SET_SCHEMA";
function setSchema(newSchema) {
    const payload = { newSchema };
    return { type: SET_SCHEMA, payload };
}

const INITIAL_STATE = {};
function createConnectionHandler(state, action) {
    const { connection } = action.payload;
    return {
        ...state,
        [makeConnectionId(connection)]: connection,
    };
}
function deleteConnectionHandler(state, action) {
    const { connectionId } = action.payload;
    const { [connectionId]: value, ...rest } = state;
    return { ...rest };
}
function replaceConnectionsHandler(state, action) {
    const { connections } = action.payload;
    return connectionsToMap(connections || []);
}
const connectionsReducer = createReducer(INITIAL_STATE, {
    [CREATE_CONNECTION]: createConnectionHandler,
    [DELETE_CONNECTION]: deleteConnectionHandler,
    [SET_CONNECTIONS]: replaceConnectionsHandler,
    [INIT_CONNECTIONS]: replaceConnectionsHandler,
});

const INITIAL_STATE$1 = {};
function nodePositionHandler(state, action) {
    const { nodeId, position } = action.payload;
    const newGraph = {
        ...state,
        [nodeId]: {
            ...state[nodeId],
            x: position.x,
            y: position.y,
        },
    };
    return newGraph;
}
function dragNodesHandler(state, action) {
    const { nodeIds, position } = action.payload;
    const nodes = nodeIds
        .filter((nodeId) => !!state[nodeId])
        .map((nodeId) => {
        let newX = state[nodeId].x + position.x;
        let newY = state[nodeId].y + position.y;
        // cap the node position to min values
        newX = newX < 0 ? 0 : newX;
        newY = newY < 0 ? 0 : newY;
        return ({
            ...state[nodeId],
            x: newX,
            y: newY,
        });
    })
        .reduce((acc, item) => {
        acc[`${item.id}`] = item;
        return acc;
    }, {});
    const newGraph = {
        ...state,
        ...nodes,
    };
    return newGraph;
}
function replaceNodesHandler(state, action) {
    const { nodes } = action.payload;
    return arrayToMap(nodes || []);
}
const nodesReducer = createReducer(INITIAL_STATE$1, {
    [SET_NODES]: replaceNodesHandler,
    [INIT_NODES]: replaceNodesHandler,
    [SET_NODE_POSITION]: nodePositionHandler,
    [DROP_NODE]: nodePositionHandler,
    [DRAG_NODES]: dragNodesHandler,
});

/** Track the ids of the editor and the viewport. In order to support multiple node editors in the
 * same page, their ids need to be different between instances.
 * @param state
 * @param action
 */
function referencesReducer(state = {}, action) {
    return state;
}

const INITIAL_STATE$2 = {
    pendingConnectionOrigin: null,
    pendingConnectionEndPos: null,
};
function pendingConnectionEndPosHandler(state, action) {
    const { endPos } = action.payload;
    return { ...state, pendingConnectionEndPos: endPos };
}
function pendingConnectionOriginHandler(state, action) {
    const { connectionOrigin } = action.payload;
    if (!connectionOrigin) {
        return { pendingConnectionEndPos: null, pendingConnectionOrigin: null };
    }
    return { ...state, pendingConnectionOrigin: connectionOrigin };
}
const editorReducer = createReducer(INITIAL_STATE$2, {
    [SET_PENDING_CONNECTION_END_POS]: pendingConnectionEndPosHandler,
    [SET_PENDING_CONNECTION_ORIGIN]: pendingConnectionOriginHandler,
});

const INITIAL_STATE$3 = {
    xPos: 0,
    yPos: 0,
    panOrigin: {
        x: 0,
        y: 0,
    },
    zoom: 1,
    settings: {
        canPan: true,
        canZoom: true,
        zoomSpeed: 6,
        minZoom: 0.5,
        maxZoom: 1.7,
        padding: 20,
    },
};
/** given a zoom action, update the zoom if within boundaries
 * @param state
 * @param action
 */
function zoomHandler(state, action) {
    const { zoom, x, y } = action.payload;
    return {
        ...state,
        zoom,
        xPos: x,
        yPos: y,
    };
}
/** given an action to pan, update the viewport location if within bounds
 * @param state
 * @param action
 */
function panHandler(state, action) {
    const { x, y } = action.payload;
    return {
        ...state,
        xPos: x,
        yPos: y,
    };
}
/** given an action to pan, update the viewport location if within bounds
 * @param state
 * @param action
 */
function panHandlerDelta(state, action) {
    const { x, y } = action.payload;
    return {
        ...state,
        xPos: x,
        yPos: y,
        panOrigin: {
            x: x,
            y: y,
        },
    };
}
/** initialize panning
 * @param state
 * @param action
 */
function panStartHandler(state, action) {
    const { x, y } = action.payload;
    return {
        ...state,
        isPanning: true,
        panOrigin: {
            x: x - state.xPos,
            y: y - state.yPos,
        },
    };
}
/** stop panning
 * @param state
 * @param action
 */
function panStopHandler(state) {
    return {
        ...state,
        isPanning: false,
        panOrigin: null,
    };
}
const viewportReducer = createReducer(INITIAL_STATE$3, {
    [SET_VIEWPORT_ZOOM]: zoomHandler,
    [SET_VIEWPORT_POS]: panHandler,
    [SET_VIEWPORT_POS_DELTA]: panHandlerDelta,
    [START_PANNING]: panStartHandler,
    [STOP_PANNING]: panStopHandler,
});

const INITIAL_STATE$4 = {};
function selectionHandler(state, action) {
    const { selection } = action.payload;
    const newSelection = stringArrayToMap(selection);
    return newSelection;
}
const selectionReducer = createReducer(INITIAL_STATE$4, {
    [SET_SELECTION]: selectionHandler,
});

const initialSchemaState = {};
function setSchemaHandler(state, action) {
    const { newSchema } = action.payload;
    return { ...state, ...newSchema };
}
const schemaReducer = createReducer(initialSchemaState, {
    [SET_SCHEMA]: setSchemaHandler,
});

/**
 * event middleware to notify consumers of Ramen about state changes
 * @param events
 */
const eventsMiddleware = (events) => (store) => (next) => (action) => {
    const type = get(action, "type", "");
    if (type === DELETE_CONNECTION) {
        events.onConnectionDelete(getConnectionById(store.getState(), action.payload.connectionId));
    }
    // first, update the store, then trigger the events
    next(action);
    const storeState = store.getState();
    if (type === CREATE_CONNECTION) {
        if (isValidConnection(storeState, action.payload.connection)) {
            events.onConnectionCreate(action.payload.connection);
        }
    }
    if (type === DROP_NODE) {
        events.onNodePositionChange(action.payload.nodeId, action.payload.position);
    }
    if (type === CREATE_CONNECTION ||
        type === DELETE_CONNECTION ||
        type === ActionCreators.undo() ||
        type === ActionCreators.redo() ||
        type === DROP_NODE) {
        events.onGraphChange({
            nodes: getNodes(storeState),
            connections: getConnections(storeState),
        });
    }
    if (type === SET_SELECTION) {
        events.onSelection(action.payload.selection);
    }
};

/** when a noodle is dragged, calculate its end position based on the current viewport state
 *
 * @param state
 * @param action
 */
function transformMoveAction(state, action) {
    const viewport = document.getElementById(getViewportId(state));
    const { endPos } = action.payload;
    const viewportState = getViewport(state);
    const viewportRect = viewport.getBoundingClientRect();
    const newMousePos = {
        x: ((endPos.x - viewportRect.left - viewportState.xPos) / viewportState.zoom),
        y: ((endPos.y - viewportRect.top - viewportState.yPos) / viewportState.zoom),
    };
    const newAction = { ...action, payload: { endPos: newMousePos } };
    return newAction;
}
/**
 * middleware
 *
 * @param {*} store
 */
const editorMiddleware = (store) => (next) => (action) => {
    const type = get(action, "type", "");
    const storeState = store.getState();
    // update dragged noodle end pos with viewport state
    if (type === SET_PENDING_CONNECTION_END_POS) {
        if (getPendingConnection(storeState)) {
            // refocus on the viewport, this solves issues with undo/redo
            const viewport = document.getElementById(getViewportId(storeState));
            if (viewport)
                viewport.focus();
            //
            return next(transformMoveAction(storeState, action));
        }
    }
    // refocus on the viewport, this solves issues with undo/redo
    if (type === SET_PENDING_CONNECTION_ORIGIN) {
        const viewport = document.getElementById(getViewportId(storeState));
        if (viewport)
            viewport.focus();
    }
    return next(action);
};

const MAX_X = 0;
const MAX_Y = 0;
/**
 * normalize the scroll behavior across browsers
 * @param delta
 */
function normalizeScroll(delta) {
    const direction = delta > 0 ? -1 : 1;
    return direction;
}
/** given an action to zoom the viewport, calculate the new zoom level and position for the viewport
 * return a new action with this information, or a ZOOM_BLOCKED action if no zoom action
 * can be performed
 * @param state
 * @param action
 */
function transformZoomAction(state, action) {
    const { zoom: zoomMovement, x, y } = action.payload;
    const { settings, zoom, xPos, yPos } = get(state, "viewport");
    const { viewportId, editorId } = get(state, "references");
    const scrollSpeed = normalizeScroll(zoomMovement);
    const delta = (scrollSpeed ? scrollSpeed / 120 : scrollSpeed / 3) * settings.zoomSpeed;
    const zoomChange = zoom * (1 + delta);
    if (zoomChange >= settings.minZoom && zoomChange <= settings.maxZoom) {
        const editor = document.getElementById(editorId);
        const viewport = document.getElementById(viewportId);
        const viewportRect = viewport.getBoundingClientRect();
        const minX = -editor.offsetWidth + settings.padding;
        const minY = -editor.offsetHeight + settings.padding;
        const xPosChange = (viewportRect.left - x) * delta;
        const yPosChange = (viewportRect.top - y) * delta;
        const minXBoundary = -Math.abs(minX * zoomChange + viewport.offsetWidth);
        const minYBoundary = -Math.abs(minY * zoomChange + viewport.offsetHeight);
        const d = (zoom - zoomChange) / ((zoom - zoomChange) || 1);
        let newXPos = (xPos + xPosChange) * d;
        let newYPos = (yPos + yPosChange) * d;
        if (newXPos >= MAX_X)
            newXPos = MAX_X;
        else if (newXPos < minXBoundary)
            newXPos = minXBoundary;
        if (newYPos >= MAX_Y)
            newYPos = MAX_Y;
        else if (newYPos < minYBoundary)
            newYPos = minYBoundary;
        return {
            ...action,
            payload: {
                zoom: zoomChange,
                x: newXPos,
                y: newYPos,
            },
        };
    }
    return { type: "ZOOM_BLOCKED" };
}
/** given an action to pan the viewport, calculate the new position for the viewport
 * @param state
 * @param action
 */
function transformPanAction(state, action) {
    const { x, y } = action.payload;
    const { settings, panOrigin, zoom } = get(state, "viewport");
    const { viewportId, editorId } = get(state, "references");
    const delta = [x - panOrigin.x, y - panOrigin.y];
    let newXPos = delta[0];
    let newYPos = delta[1];
    const editor = document.getElementById(editorId);
    const viewport = document.getElementById(viewportId);
    const minX = -editor.offsetWidth + get(settings, "padding", 0);
    const minY = -editor.offsetHeight + get(settings, "padding", 0);
    const minXBoundary = -Math.abs(minX * zoom + viewport.offsetWidth);
    const minYBoundary = -Math.abs(minY * zoom + viewport.offsetHeight);
    if (newXPos > MAX_X)
        newXPos = MAX_X;
    else if (newXPos < minXBoundary)
        newXPos = minXBoundary;
    if (newYPos > MAX_Y)
        newYPos = MAX_Y;
    else if (newYPos < minYBoundary)
        newYPos = minYBoundary;
    return {
        ...action,
        payload: {
            x: newXPos,
            y: newYPos,
        },
    };
}
/** given an delta to pan the viewport, calculate the new position for the viewport
 * @param state
 * @param action
 */
function transformPanDeltaAction(state, action) {
    const { x, y } = action.payload;
    const { settings, panOrigin, zoom } = get(state, "viewport");
    const { viewportId, editorId } = get(state, "references");
    const delta = [panOrigin.x - x, panOrigin.y - y];
    let newXPos = delta[0];
    let newYPos = delta[1];
    const editor = document.getElementById(editorId);
    const viewport = document.getElementById(viewportId);
    const minX = -editor.offsetWidth + get(settings, "padding", 0);
    const minY = -editor.offsetHeight + get(settings, "padding", 0);
    const minXBoundary = -Math.abs(minX * zoom + viewport.offsetWidth);
    const minYBoundary = -Math.abs(minY * zoom + viewport.offsetHeight);
    if (newXPos > MAX_X)
        newXPos = MAX_X;
    else if (newXPos < minXBoundary)
        newXPos = minXBoundary;
    if (newYPos > MAX_Y) {
        newYPos = MAX_Y;
    }
    else if (newYPos < minYBoundary) {
        newYPos = minYBoundary;
    }
    return {
        ...action,
        payload: {
            x: newXPos,
            y: newYPos,
        },
    };
}
/** enrich viewport actions
 * @param store
 */
const viewportMiddleware = (store) => (next) => (action) => {
    const storeState = store.getState();
    if (action.type === SET_VIEWPORT_ZOOM) {
        return next(transformZoomAction(storeState, action));
    }
    if (action.type === SET_VIEWPORT_POS) {
        const { isPanning } = storeState.viewport;
        if (!isPanning)
            return;
        return next(transformPanAction(storeState, action));
    }
    if (action.type === SET_VIEWPORT_POS_DELTA) {
        return next(transformPanDeltaAction(storeState, action));
    }
    return next(action);
};

/**
 * middleware
 *
 * @param {*} store
 */
const connectionMiddleware = (store) => (next) => (action) => {
    const type = get(action, "type", "");
    const storeState = store.getState();
    // validate connection attempt
    if (type === CREATE_CONNECTION) {
        if (isValidConnection(storeState, action.payload.connection)) {
            return next(action);
        }
        return;
    }
    if (type === DELETE_CONNECTION) {
        // refocus on the viewport, this solves issues with undo/redo
        document.getElementById(getViewportId(storeState)).focus();
    }
    return next(action);
};

const undoableReducers = combineReducers({
    connections: connectionsReducer,
    nodes: nodesReducer,
});
const rootReducer = combineReducers({
    references: referencesReducer,
    editor: editorReducer,
    viewport: viewportReducer,
    selection: selectionReducer,
    schema: schemaReducer,
    history: undoable(undoableReducers, {
        ignoreInitialState: true,
        groupBy: groupByActionTypes([SET_NODES, SET_CONNECTIONS]),
        filter: excludeAction([
            INIT_NODES,
            INIT_CONNECTIONS,
            DRAG_NODES,
            SET_SCHEMA,
            SET_SELECTION,
            SET_PENDING_CONNECTION_ORIGIN,
        ]),
    }),
});
function configureStore(preloadedState, events) {
    const middlewares = [
        connectionMiddleware,
        viewportMiddleware,
        editorMiddleware,
        eventsMiddleware(events),
    ];
    const middlewareEnhancer = applyMiddleware(...middlewares);
    const enhancers = [
        middlewareEnhancer,
    ];
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const composedEnhancers = composeEnhancers(...enhancers);
    const store = createStore(rootReducer, preloadedState, composedEnhancers);
    return store;
}

let namespace = 0;
/** The ramen provider encapsulates the store provider
 * @param props
 */
function RamenProvider(props) {
    const { initialGraph = {}, graph, initialEditorState, schema, children } = props;
    const { onConnectionCreate, onConnectionDelete, onGraphChange, onNodePositionChange, onSelection } = props;
    const [store, setStore] = React__default.useState(null);
    // on load, initialize a new store with a namespace
    // the namespace is used to differentiate between editor instances
    // this is necessary in order to have multiple editors in the same page
    React__default.useEffect(() => {
        namespace = namespace + 1;
        const references = {
            editorId: `${BASE_EDITOR_ID}-${namespace}`,
            viewportId: `${BASE_VIEWPORT_ID}-${namespace}`,
        };
        const presentState = {
            nodes: arrayToMap((initialGraph || graph).nodes || []),
            connections: connectionsToMap((initialGraph || graph).connections || []),
        };
        const history = {
            past: [],
            present: presentState,
            future: [],
        };
        const initialState = {
            selection: {},
            editor: initialEditorState,
            schema,
            references,
            history,
        };
        const events = {
            onGraphChange,
            onConnectionCreate,
            onConnectionDelete,
            onNodePositionChange,
            onSelection,
        };
        const store = configureStore(initialState, events);
        setStore(store);
    }, []);
    // if the schema property changes, update the graph
    React__default.useEffect(() => {
        if (!store)
            return;
        store.dispatch(setSchema(schema));
    }, [store, schema]);
    // if the graph property changes, update the graph
    React__default.useEffect(() => {
        if (!store || !graph)
            return;
        store.dispatch(initNodes(graph.nodes));
        store.dispatch(initConnections(graph.connections));
    }, [store, graph]);
    //
    // create an action on first load to avoid user undoing to empty state
    React__default.useEffect(() => {
        if (!store)
            return;
        store.dispatch(setNodes(getNodes(store.getState())));
        store.dispatch(setConnections(getConnections(store.getState())));
    }, [store]);
    if (!store)
        return null;
    return (React__default.createElement(Provider, { store: store }, children));
}

const fn = () => { };
function Ramen(props) {
    const { initialGraph, initialEditorState, graph, graphState, schema, height, width, canZoom = true, canPan = true, controls, children, onGraphChange = fn, onConnectionCreate = fn, onConnectionDelete = fn, onNodePositionChange = fn, onSelection = fn, } = props;
    return (createElement(RamenProvider, { onSelection: onSelection, onGraphChange: onGraphChange, onConnectionCreate: onConnectionCreate, onConnectionDelete: onConnectionDelete, onNodePositionChange: onNodePositionChange, initialEditorState: initialEditorState, initialGraph: initialGraph, schema: schema, graph: graph },
        createElement(EditorViewport$1, { canZoom: canZoom, canPan: canPan },
            createElement(EditorBackground$1, { height: height, width: width },
                children,
                createElement(NoodleLayer, null),
                createElement(NodeLayer, { controls: controls, graphState: graphState }),
                createElement(EditorEvents, null),
                createElement(GlobalStyle, null)))));
}

export default Ramen;
export { darkTheme, lightTheme };
