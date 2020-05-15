import { IRamenEvents } from "../types";
/**
 * event middleware to notify consumers of Ramen about state changes
 * @param events
 */
declare const eventsMiddleware: (events: IRamenEvents) => (store: any) => (next: any) => (action: any) => void;
export default eventsMiddleware;
