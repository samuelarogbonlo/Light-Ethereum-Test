import { App } from "cdktf";
import { EthLightClientStack } from "./infra/eth/lightClient";
import { Region } from "./infra/utils/";

const app = new App();
new EthLightClientStack(app, "eth-light-client-stack", Region.use1);
app.synth();
