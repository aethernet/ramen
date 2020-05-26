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
import AlloyFinger from "alloyfinger"

let temp0 = {}

function useZoomingAndPanning(canZoom: boolean, canPan: boolean, viewport: any): null {
  const dispatch = useDispatch();

  const isPanning = useSelector(
    (state: IStoreState) => state.viewport.isPanning,
    shallowEqual
  )

  React.useEffect(() => {
    if (!viewport) return;

    const  af = new AlloyFinger(viewport, {});

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

    function onPinch(e: TouchEvent) {
      const zoom = 1-e.zoom
      if(zoom < -0.5 || zoom > 0.5) //prevent accidental zoom when drag
        dispatch(setViewportZoom(zoom*3, e.pageX, e.pageY))
    }

    function ontwoFingerPressMove(e: TouchEvent) {
      dispatch(setViewportPosDelta(-e.deltaX, -e.deltaY))
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
    if(canPan){
      af.on("twoFingerPressMove", ontwoFingerPressMove);
    }
    if(canZoom){
      af.on("pinch", onPinch);
    }

    return () => {
      viewport.removeEventListener("wheel", onWheelScroll);
      af.destroy();
    };

  }, [canZoom, viewport]);

  return null;
}

export default useZoomingAndPanning;
