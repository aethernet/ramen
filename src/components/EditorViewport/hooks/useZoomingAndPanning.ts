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

//-> FIXME: THIS FALLBACK FOR MOUSE DOESNT WORK!!!
    // start pan on middle mouse button down
    function onPointerDown(e: MouseEvent) {
      if (isPanning) return
      if (e.button !== 1) return
      e.preventDefault()
      e.stopPropagation()
      dispatch(startPanning(e.pageX, e.pageY))
    }

    function onPointerMove(e: MouseEvent) {
      if (!isPanning) return
      e.preventDefault()
      e.stopPropagation()
      dispatch(setViewportPos(e.pageX, e.pageY))
    }

    // end pan on middle mouse button up
    function onPointerUp(e: MouseEvent) {
      if (!isPanning) return
      if (e.button !== 1) return
      e.preventDefault()
      e.stopPropagation()
      dispatch(stopPanning())
    }

    viewport.addEventListener("wheel", onWheelScroll);
    if(canPan){
      viewport.addEventListener("pointerdown", onPointerDown);
      viewport.addEventListener("pointerup", onPointerUp);
      viewport.addEventListener("pointermove", onPointerMove);
    }

    return () => {
      viewport.removeEventListener("wheel", onWheelScroll);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointermove", onPointerMove);
    };

  }, [canZoom, viewport]);

  return null;
}

export default useZoomingAndPanning;
