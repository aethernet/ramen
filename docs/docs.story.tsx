import { storiesOf } from "@storybook/react";

import ConnectionsDoc from "./chapters/Connections/Connections";
import ControlsDoc from "./chapters/Controls/Controls";
import FieldsDoc from "./chapters/Fields/Fields";
import GettingStarted from "./chapters/GettingStarted/GettingStarted";
import Nodes from "./chapters/Nodes/Nodes";
import Playground from "./chapters/Playground/Playground";
import StressTestControlled, { StressTest } from "./chapters/Playground/StressTest";
import Theming from "./chapters/Theming/Theming";
import WriteMe from "./chapters/WriteMe";

storiesOf("Documentation|Introduction", module)
  .add("Getting Started", GettingStarted)
  .add("Nodes", Nodes)
  .add("Fields", FieldsDoc)
  .add("Controls", ControlsDoc)
  .add("Connections", ConnectionsDoc);

storiesOf("Documentation|Customization", module)
  .add("Theming", Theming)
  .add("Replacing Components", WriteMe)
  .add("Custom Controls", WriteMe)
  .add("Extending Functionality", WriteMe);

storiesOf("Documentation|API", module)
  .add("Editor API", WriteMe)
  .add("Schema Definition", WriteMe)
  .add("Graph Definition", WriteMe);

storiesOf("Documentation|Playground", module)
  .add("Playground", Playground)
  .add("Stress Test", StressTest)
  .add("Stress Test Controlled", StressTestControlled);