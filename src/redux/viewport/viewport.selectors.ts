import { IStoreState } from "../types";

export function getViewport(state: IStoreState) {
  return state.viewport;
}

export function getViewportZoom(state: IStoreState) {
  return state.viewport.zoom;
}

export function getViewportPos(state: IStoreState) {
  return {
    xPos: state.viewport.xPos,
    yPos: state.viewport.yPos
  }
}