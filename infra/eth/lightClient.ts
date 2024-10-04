import {
    Scope,
    Node,
    Size,
    Region
} from "../utils";
import * as path from "path";
import {
    NullProvider
  } from "@cdktf/provider-null/lib/provider";
  import {
    RandomProvider
  } from "@cdktf/provider-random/lib/provider";
import {
    TerraformStack
} from "cdktf";
import { Construct } from "constructs";

// I6
export class EthLightClient extends Scope {

    public readonly nodeInstance: Node;

    constructor(scope: Scope, name: string) {

        super(scope, name, scope.config);

        this.nodeInstance = new Node(this, name, {
            compute: Size.md,
            storage: Size.lg,
            playbookPath: path.join(__dirname, "light-client.yml"),
            securityGroupIngress: [
            ]
        });

    }
}

export class EthLightClientStack extends TerraformStack {

    constructor(scope: Construct, id: string, region: Region = Region.use1) {
        super(scope, id);

        // top-level providers
        new NullProvider(this, "null-provider");
        new RandomProvider(this, "random-provider");

        const ethLightClientScope = new Scope(this, "eth-light-client-scope", {
            region
        });
        new EthLightClient(
            ethLightClientScope, "eth-light-client"
        );

    }
}