import { IPosition } from "../../../../types";
export interface INoodleProps {
    id: number;
    start: IPosition;
    end: IPosition;
    onPointerDown?: () => void;
}
