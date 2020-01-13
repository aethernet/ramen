import React, { useRef } from "react";
import { shallowEqual, useSelector } from "react-redux";

import { getViewportId } from "../../redux/references/references.selectors";
import { IStoreState } from "../../redux/types";
import { getViewport } from "../../redux/viewport/viewport.selectors";
import { EditorWrapperBackground, Viewport } from "./EditorViewport.styles";
import usePanning from "./hooks/usePanning";
import useZooming from "./hooks/useZooming";

function EditorWrapper(props: any) {
  const { xPos, yPos, zoom } = useSelector(getViewport, shallowEqual);
  return (
    <EditorWrapperBackground xPos={xPos} yPos={yPos} scale={zoom}>
      {props.children}
    </EditorWrapperBackground>
  );
}

/** provides zooming and panning functionality
 * @param props
 */
function EditorViewport(props: any) {
  const { children } = props;
  const { canPan = true, canZoom = true } = props;

  const viewportRef = useRef(null);
  const [viewport, setViewport] = React.useState(null);
  const viewportId = useSelector(getViewportId, shallowEqual);

  React.useEffect(() => {
    if (viewportRef.current && !viewport) {
      setViewport(viewportRef.current);
    }
  }, [viewportRef]);

  // zoom functionality
  useZooming(canZoom, viewport);

  // pan functionality
  usePanning(canPan, viewport);

  return (
    <Viewport id={viewportId} ref={viewportRef}>
      <EditorWrapper>
        {children}
      </EditorWrapper>
    </Viewport>
  );
}

export default React.memo(EditorViewport, (prevProps, nextProps) => {
  return prevProps.canPan === nextProps.canPan
    && prevProps.canZoom === nextProps.canZoom;
});