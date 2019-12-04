import { IGraph, ISchema } from "../../src/types";

export const schema: ISchema = {
  nodeTypes: {
    number: {
      fields: {
        out: [
          {
            id: "number",
            name: "Number",
            type: "numberSocket",
          },
        ],
      },
    },
  },
  socketTypes: {
    numberSocket: {
      color: "#29abe1",
      validTargets: [
        "numberSocket",
      ],
    },
  },
};

export const graph: IGraph = {
  nodes: [
    {
      id: "0",
      x: 100,
      y: 50,
      type: "number",
    },
  ],
  connections: [],
};