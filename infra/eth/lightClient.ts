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

export class EthLightClient extends Scope {

    public readonly nodeInstance: Node;

    constructor(scope: Scope, name: string) {

        super(scope, name, scope.config);

        this.nodeInstance = new Node(this, name, {
            compute: Size.xs, // Free Tier eligible
            storage: Size.xs, // 8 GiB storage
            playbookPath: path.join(__dirname, "light-client.yml"),
            securityGroupIngress: [
                // I6 - Expose port 8545
                {
                    protocol: "tcp",
                    fromPort: 8545,
                    toPort: 8545,
                    cidrBlocks: ["0.0.0.0/0"]
                }
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
