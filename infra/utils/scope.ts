import { Construct } from "constructs";
import { Region, Regions } from "./region";
import {
    AwsProvider,
} from "@cdktf/provider-aws/lib/provider";
import { Vpc as AwsVpc } from "@cdktf/provider-aws/lib/vpc";
import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway";
import { Subnet as AwsSubnet } from "@cdktf/provider-aws/lib/subnet";
import { Route } from "@cdktf/provider-aws/lib/route";
import { RouteTable } from "@cdktf/provider-aws/lib/route-table";
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association";
import * as os from "os";
import { readFileSync } from "fs";

export type ScopeConfig = {
    region: Region;
};

export type AwsScopeMembers = {
    provider?: AwsProvider;
    vpc?: AwsVpc;
    lastAllocatedCidr?: string;
    internetGateway?: InternetGateway;
};

export class Scope extends Construct {
    name: string;
    config: ScopeConfig;
    public static readonly startingCidr: string = "172.16.0.0/24";

    constructor(scope: Construct, name: string, config: ScopeConfig) {
        super(scope, name);
        this.config = config;
        this.name = name;

        this.initialize();
    }

    /**
     * Gets the context for the current scope.
     * @returns
     */
    private getContext(): any {
        return this.node.tryGetContext(this.name);
    }

    getRegion(): Region {
        return this.config.region;
    }

    public initialize(): void {
        if (!this.node.tryGetContext(this.name)) this.node.setContext(this.name, {});
    }

    public getAwsRegion(): string {
        return Regions.toAwsRegion(this.getRegion());
    }

    public getAwsProviderAlias(): string {
        return [this.getRegion(), this.name].join("-");
    }

    public getAwsVpcAlias(): string {
        return this.getAwsProviderAlias();
    }

    private _getAwsProvider(): AwsProvider | undefined {
        return (this.getContext()[this.getAwsProviderAlias()] as AwsScopeMembers | undefined)
            ?.provider;
    }

    private _getAwsVpc(): AwsVpc | undefined {
        return (this.getContext()[this.getAwsVpcAlias()] as AwsScopeMembers | undefined)?.vpc;
    }

    private _getInternetGateway(): InternetGateway | undefined {
        return (this.getContext()[this.getAwsVpcAlias()] as AwsScopeMembers | undefined)
            ?.internetGateway;
    }

    public getAwsProvider(): AwsProvider {
        const existingProvider = this._getAwsProvider();
        if (existingProvider) return existingProvider;

        const alias = this.getAwsProviderAlias();
        const provider = new AwsProvider(this, `${alias}-provider`, {
            region: this.getAwsRegion(),
            alias,
        });

        this.getContext()[alias] = {
            provider,
            vpc: this._getAwsVpc(),
            lastAllocatedCidr: this.getLastAllocatedCidr(),
            internetGateway: this._getInternetGateway(),
        } as AwsScopeMembers;

        return provider;
    }

    public getAwsVpc(): AwsVpc {
        const existingVpc = this._getAwsVpc();
        if (existingVpc) return existingVpc;

        const provider = this.getAwsProvider();

        const alias = this.getAwsVpcAlias();
        const vpc = new AwsVpc(this, `${alias}-vpc`, {
            cidrBlock: "172.16.0.0/16", // Corrected CIDR block (I1)
            provider,
            tags: {
                Name: alias,
            },
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });

        const internetGateway = new InternetGateway(this, `${alias}-internet-gateway`, {
            vpcId: vpc.id,
            provider,
        });

        this.getContext()[alias] = {
            provider: provider,
            lastAllocatedCidr: this.getLastAllocatedCidr(),
            internetGateway: internetGateway,
            vpc,
        } as AwsScopeMembers;

        return vpc;
    }

    public getAwsInternetGateway(): InternetGateway {
        this.getAwsVpc();
        return this._getInternetGateway() as InternetGateway;
    }

    private _getLastAllocatedCidr(): string | undefined {
        return (this.getContext()[this.getAwsVpcAlias()] as AwsScopeMembers | undefined)
            ?.lastAllocatedCidr;
    }

    private _setLastAllocatedCidr(cidr: string): void {
        const alias = this.getAwsVpcAlias();
        this.getContext()[alias] = {
            provider: this._getAwsProvider(),
            vpc: this._getAwsVpc(),
            lastAllocatedCidr: cidr,
            internetGateway: this._getInternetGateway(),
        };
    }

    public getLastAllocatedCidr(): string {
        const existingCidr = this._getLastAllocatedCidr();
        if (existingCidr) return existingCidr;

        this._setLastAllocatedCidr(Scope.startingCidr);

        return Scope.startingCidr;
    }

    private _nextCidrBlock(): string {
        const ipParts = this.getLastAllocatedCidr().split('.');
        const thirdOctet = parseInt(ipParts[2]);

        if (thirdOctet < 255) {
            ipParts[2] = (thirdOctet + 1).toString();
        } else {
            throw new Error("CIDR allocation exceeded for this VPC.");
        }

        const newCidr = ipParts.join('.');
        this._setLastAllocatedCidr(newCidr);
        return `${newCidr}/24`; // Ensure the subnet mask is included
    }

    public getNextAvailableSubnet(availabilityZone: string = "a"): AwsSubnet {
        const cidr = this._nextCidrBlock();
        const alias = `${this.getAwsVpcAlias()}-${cidr.split(".").join("-")}`;
        const awsProvider = this.getAwsProvider();
        const vpc = this.getAwsVpc();
        const internetGateway = this.getAwsInternetGateway();

        const subnet = new AwsSubnet(this, `${alias}-subnet`, {
            cidrBlock: cidr,
            vpcId: vpc.id,
            provider: awsProvider,
            mapPublicIpOnLaunch: true,
            availabilityZone: `${this.getAwsRegion()}${availabilityZone}`,
        });

        const routeTable = new RouteTable(this, `${alias}-route-table`, {
            vpcId: vpc.id,
            provider: awsProvider,
        });

        // Add a route to the internet gateway (I2)
        new Route(this, `${alias}-route`, {
            routeTableId: routeTable.id,
            destinationCidrBlock: '0.0.0.0/0',
            gatewayId: internetGateway.id,
            provider: awsProvider,
        });

        // Associate the route table with the subnet (I2)
        new RouteTableAssociation(this, `${alias}-route-table-association`, {
            subnetId: subnet.id,
            routeTableId: routeTable.id,
            provider: awsProvider,
        });

        return subnet;
    }

    public getPubKey(name: string): string {
        const location = `${this.getPrivateKeyLocation(name)}.pub`;
        return readFileSync(location, "utf-8");
    }

    public getPrivateKeyLocation(name: string): string {
        const homedir = os.homedir();
        return `${homedir}/.ssh/mvlbs/${name}`;
    }
}
