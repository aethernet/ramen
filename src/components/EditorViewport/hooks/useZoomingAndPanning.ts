import * as React from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import {
  setViewportZoom,
  setViewportPos,
  setViewportPosDelta,
  startPanning,
  stopPanning,
} from "../../../redux/viewport/viewport.actions"
import { IStoreState } from "../../../redux/types";

function useZoomingAndPanning(canZoom: boolean, canPan: boolean, viewport: any): null {
  const dispatch = useDispatch();

  const isPanning = useSelector(
    (state: IStoreState) => state.viewport.isPanning,
    shallowEqual
  )

  React.useEffect(() => {
    if (!viewport) return;

    // zoom on alt + scroll
    function onWheelScroll(e: WheelEvent) {
      e.preventDefault();
      if (e.altKey && canZoom)
        dispatch(setViewportZoom(e.deltaY, e.clientX, e.clientY))
      else if (canPan) {
        dispatch(
          setViewportPosDelta(e.deltaX, e.deltaY)
        )
      }
    }

    //FIXME: this doesnt work
    function onPointerMove(e: MouseEvent) {
      console.log(e, isPanning)
      if (!isPanning && !e.altKey && !e.buttons) return
      if (!isPanning) dispatch(startPanning(e.pageX, e.pageY))
      if (isPanning && (!e.altKey || !e.buttons)) dispatch(stopPanning())
      if (isPanning) dispatch(setViewportPos(e.pageX, e.pageY))
      
      e.preventDefault()
      e.stopPropagation()
    }

    viewport.addEventListener("wheel", onWheelScroll);
    if(canPan){
      viewport.addEventListener("pointermove", onPointerMove);
    }

    return () => {
      viewport.removeEventListener("wheel", onWheelScroll);
      viewport.removeEventListener("pointermove", onPointerMove);
    };

  }, [canZoom, viewport]);

  return null;
}

export default useZoomingAndPanning;
