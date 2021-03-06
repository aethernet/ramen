import { IStoreState } from "../types";
export declare function getViewport(state: IStoreState): import("./viewport.types").IViewportState;
export declare function getViewportZoom(state: IStoreState): number;
export declare function getViewportPos(state: IStoreState): {
    xPos: number;
    yPos: number;
};
