import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionCreators } from "redux-undo";

import { types } from "../../constants";
import { createConnection } from "../../redux/connections/connections.actions";
import { setPendingConnectionEndPos, setPendingConnectionOrigin } from "../../redux/editor/editor.actions";
import { getPendingConnection } from "../../redux/editor/editor.selectors";
import { IStoreState } from "../../redux/types";

// TODO: remove the editor events component in favor of events fired directly from the components:
// editor background, fields

function EditorEvents(): null {

  const dispatch = useDispatch();

  const pendingConnectionOrigin = useSelector(getPendingConnection);
  const editorId = useSelector((state: IStoreState) => state.references.editorId);

  React.useEffect(() => {
    const editor = document.getElementById(editorId);

    function onPointerDownField(targetData: any) {
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
    function onPointerDown(e: MouseEvent) {
      const target = e.target as HTMLInputElement;
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
    function onPointerUp(e: MouseEvent) {
      //This hack fix the connection issue on mobile safari. Without it touch patching is not possible (event.target = pointerdown target instead of pointerup, unknwn reason, no time to investigate further)
      const targetDomElm = document.querySelector("div[data-type=FIELD][data-isInput=true]:hover")
      if (!targetDomElm) {
        e.stopPropagation();
        e.preventDefault();
        dispatch(setPendingConnectionOrigin(null));
      }
      
      const target = targetDomElm as HTMLInputElement;
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

    function onPointerMove(e: MouseEvent) {
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

export default EditorEvents;
