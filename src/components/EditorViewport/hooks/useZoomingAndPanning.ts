import * as React from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import {
  setViewportZoom,
  setViewportPos,
  startPanning,
  stopPanning,
} from "../../../redux/viewport/viewport.actions"
import { IStoreState } from "../../../redux/types";
import { getViewportPos } from "../../../redux/viewport/viewport.selectors";

function useZoomingAndPanning(canZoom: boolean, canPan: boolean, viewport: any): null {
  const dispatch = useDispatch();

  const isPanning = useSelector(
    (state: IStoreState) => state.viewport.isPanning,
    shallowEqual
  )

  const viewPortPos = useSelector(
    (state: IStoreState) => ({
      xPos: state.viewport.xPos,
      yPos: state.viewport.yPos
    }), shallowEqual
  )

  React.useEffect(() => {
    if (!viewport) return;

    // zoom on alt + scroll
    function onWheelScroll(e: WheelEvent) {
      e.preventDefault();
      if (event.altKey && canZoom)
        dispatch(setViewportZoom(e.deltaY, e.clientX, e.clientY))
      else if (canPan) {
        console.log("panning": viewPortPos.xPos, e.deltaX, viewPortPos.yPos, e.deltaY, viewPortPos.xPos - e.deltaX, viewPortPos.yPos - e.deltaY)
        dispatch(
          setViewportPos(viewPortPos.xPos - e.deltaX, viewPortPos.yPos - e.deltaY)
        )
      }
    }

    viewport.addEventListener("wheel", onWheelScroll);

    return () => {
      viewport.removeEventListener("wheel", onWheelScroll);
    };

  }, [canZoom, viewport]);

  return null;
}

export default useZoomingAndPanning;
