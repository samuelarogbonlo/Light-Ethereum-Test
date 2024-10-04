import { App } from "cdktf";
import { EthLightClientStack } from "./infra/eth";

const app = new App();
new EthLightClientStack(app, "eth-light-client-stack");
app.synth();