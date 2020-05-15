/// <reference path="../src/typings.d.ts" />
/// <reference types="redux-undo" />
import { IRamenEvents } from "../types";
declare function configureStore(preloadedState: any, events: IRamenEvents): import("redux").Store<import("redux").CombinedState<{
    references: any;
    editor: any;
    viewport: any;
    selection: any;
    schema: any;
    history: import("redux-undo").StateWithHistory<import("redux").CombinedState<{
        connections: any;
        nodes: any;
    }>>;
}>, import("redux").AnyAction>;
export default configureStore;
