import { KeyPair } from "@cdktf/provider-aws/lib/key-pair";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Subnet } from "@cdktf/provider-aws/lib/subnet";
import { resource } from "@cdktf/provider-null";
import { sizeToInstanceType, sizeToStorageSize, Size } from "./size";
import {
    SecurityGroupIngress
} from "@cdktf/provider-aws/lib/security-group";
import { Scope } from "./scope";
import { getAmiIdByRegion } from "./ami";

export type NodeConfig = {
    compute : Size,
    storage : Size,
    playbookPath : string,
    securityGroupIngress : SecurityGroupIngress[]
}

export class Node extends Scope {

    public readonly keyPair: KeyPair;
    public readonly securityGroup: SecurityGroup;
    public readonly subnet: Subnet;
    public readonly instance: Instance;
    public readonly ansibleProvisioner: resource.Resource;

    constructor(
        scope: Scope,
        name: string,
        {
            compute,
            storage,
            playbookPath,
            securityGroupIngress
        }: NodeConfig
    ) {
        super(scope, name, scope.config);
        const awsProvider = this.getAwsProvider();
        const vpc = this.getAwsVpc();
        this.subnet = this.getNextAvailableSubnet();
        // const playbookContent = fs.readFileSync(playbook, 'utf-8');

        const publicKey = this.getPubKey("aws_main");
        const privateKeyPath = this.getPrivateKeyLocation("aws_main");

        this.keyPair = new KeyPair(this, 'KeyPair', {
            publicKey,
            provider: awsProvider
        });

        const ami = getAmiIdByRegion(awsProvider.region ?? 'us-east-1');

        // Define a security group for the instance
        this.securityGroup = new SecurityGroup(this, `security-group`, {
            vpcId: vpc.id,
            description: `Security group for ${name} instance`,
            ingress: [
                { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
                { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
                { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
                ...securityGroupIngress
            ],
            egress: [
                { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }, // Allow all outbound
            ],
            provider: awsProvider
        });

        this.instance = new Instance(this, "instance", {
            ami: ami,
            instanceType: sizeToInstanceType(compute),
            subnetId: this.subnet.id,
            keyName: this.keyPair.keyName,
            tags: {
                Name: name
            },
            rootBlockDevice: {
                volumeSize: sizeToStorageSize(storage),
                volumeType: "gp2",
                deleteOnTermination: true
            },
            associatePublicIpAddress: true,
            vpcSecurityGroupIds: [this.securityGroup.id],
            provider: awsProvider,
        });


        // I5

    }

}