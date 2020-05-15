import { ISchema } from "./schema.types";
export declare const SET_SCHEMA = "SET_SCHEMA";
export declare function setSchema(newSchema: ISchema): {
    type: string;
    payload: {
        newSchema: ISchema;
    };
};
