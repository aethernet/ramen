## Connecting Nodes

Before we can get started with connections, let's add a new node to the mix. This new node will have
a different type, it will accept two numbers and return a number.

Our schema now looks like this:

```js
const schema = {
  nodeTypes: {
    numberNode: {
      name: "My Node",
      fields: [
        {
          id: "field1",
          dataType: "number",
          output: true,
        }
      ]
    },
    additionNode: {
      name: "Addition",
      fields: [
        {
          id: "number1",
          dataType: "number",
          input: true,
        },
        {
          id: "number2",
          dataType: "number",
          input: true,
        },
        {
          id: "result",
          dataType: "number",
          output: true,
        },
      ],
    },
  },
  dataTypes: {
    number: {
      name: "Number",
      color: "#7454a1"
    },
  },
};
```

Let add a an addition node to our graph:

```js
const graph = {
  nodes: [
    {
      id: "0",
      x: 100,
      y: 50,
      type: "numberNode",
    },
    {
      id: "1",
      x: 200,
      y: 50,
      type: "additionNode",
    }
  ],
  connections: [],
};
```

With these changes, you should see the graph below. You can now connect two nodes by dragging and dropping. You can also add a connection manually in the `graph.connections` array. Connections have the following format:

```
{
  originNode: "0",
  originField: "field1",
  targetNode: "1",
  targetField: "number1",
}
```

The connection above connects the output field (`field1`) of our numberNode (`0`) to the first input field (`number1`) of our additionNode (`1`).