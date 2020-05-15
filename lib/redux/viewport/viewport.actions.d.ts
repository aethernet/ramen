export declare const SET_VIEWPORT_ZOOM = "SET_VIEWPORT_ZOOM";
export declare const SET_VIEWPORT_POS = "SET_VIEWPORT_POS";
export declare const START_PANNING = "START_PANNING";
export declare const STOP_PANNING = "STOP_PANNING";
export declare function setViewportZoom(zoom: number, x: number, y: number): {
    type: string;
    payload: {
        zoom: number;
        x: number;
        y: number;
    };
};
export declare function setViewportPos(x: number, y: number): {
    type: string;
    payload: {
        x: number;
        y: number;
    };
};
export declare function startPanning(x: number, y: number): {
    type: string;
    payload: {
        x: number;
        y: number;
    };
};
export declare function stopPanning(): {
    type: string;
};
