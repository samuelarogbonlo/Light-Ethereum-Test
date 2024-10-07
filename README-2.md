# Lightly ETH Take-Home Technical

## Overview
This project is to provide infrastructure as code (IaC) for an Ethereum Light Client, deploy then answer some conceptual questions.

### Requirements
- Machine Dependencies: Ubuntu 20.04 LTS, AWS CLI, Helios Ethereum Light Client,
- Added Technologies: CDKTF, Ansible, Docker.
- Configuration Details: AWS VPC, EC2 instance configurations, Holesky Network, Consensus and Execution RPC endpoints, 8345 RPC Port configuration, Security Groups, Systemd service.

## Implementation
- Run `npm install` to install the dependencies.
- Run `cdktf deploy` to deploy the infrastructure.

**Requirements for Ethereum Light Client Infrastructure**
- MUST provision an EC2 instance with an Ethereum Light Client running as a systemctl service.
- MUST use Terraform CDK to define the infrastructure.
    - R1: What os will you use for the EC2 instance? Why?
    > **_Answer_**
    > - I used Ubuntu 20.04 LTS. Most blockchain infrastructure and Ethereum-related software are optimized for Linux. Also, linux is highly customizable and secure which makes it ideal for automated setups, especially in DevOps and cloud environments

    - R2: What instance type will you use? Why?

    > **_Answer_**
    > - I used t2.micro. It is the smallest instance type available on AWS and it is free tier eligible. It is suitable for testing and development purposes.

- MUST use Ansible to provision the infrastructure.
    - R3: List the dependencies for the Ethereum Light Client that you will need to provision.

    > **_Answer_**
    > The dependencies are as follows:
    > - System packages like curl, wget, unzip.
    > - Helios Ethereum Light Client
    > - Systemd service for the Ethereum Light Client
    > - JSON-RPC API for the Ethereum Light Client
    > - Ansible role
    > - Terraform CDK
    > - AWS CLI

- MAY use any Ethereum Light Client.
    - R4: What Ethereum Light Client will you use? Why?

    > **_Answer_**
    > - I used Helios Ethereum Light Client. It is a lightweight Ethereum Light Client that is easy to set up and use. It is also open-source and has a large community of developers. Also, many other Ethereum Light Clients options have deprecated or are not actively maintained. Helios allows for JSON-RPC exposure, fast syncing and operates in s trustless mode.

- MUST expose ETH JSON-RPC on port 8545 to the public.
    - R5: What configurations will you need to manage to expose the JSON-RPC?
    > **_Answer_**
    > - To expose the JSON-RPC on port 8545 to the public, we need to configure the firewall to allow incoming traffic on port 8545. We can do this by adding a security group rule that allows inbound traffic on port 8545. We can also configure the EC2 instance to use a public IP address, which will allow us to access the JSON-RPC from the internet. Then lastly, we had the systemd service file for Helios includes the necessary parameters to start the service with the JSON-RPC exposed.

- MAY someday need to provide an observability solution.
    - R6: What observability solution would you use? Why?
    > **_Answer_**
    > The observability solution will include the following:
    > - **Prometheus:** Ideal for collecting metrics from both the system (EC2 instance) and the Helios client. It's lightweight, integrates well with cloud environments like AWS, and can monitor CPU, memory, and network usage alongside custom application metrics.
    > - **Grafana:** Provides a powerful, customizable dashboard for visualizing Prometheus metrics. It’s user-friendly and supports alerts, helping you monitor the performance and availability of the Ethereum Light Client in real-time.
    > - **PagerDuty:** This integrates well with Prometheus for real-time alerting and incident management. It provides on-call scheduling, escalation policies, and multi-channel alerts (SMS, phone calls, emails, etc.), ensuring that critical issues like node downtime or performance degradation are quickly addressed.

- MAY someday need to provide a CI/CD pipeline for the infrastructure.
    - R7: What CI/CD pipeline would you use? Why?

    > **_Answer_**
    > The CI/CD pipeline recommendation setup will be as thus:
    > - **GitHub Actions:** Since the project likely resides in a GitHub repository, GitHub Actions provides seamless integration for automating testing, building, and deploying the Ethereum Light Client infrastructure. It supports a wide variety of workflows, including testing Ansible playbooks, deploying Terraform configurations, and integrating with AWS services.
    > - **Terraform Cloud:** It integrates well with the CDKTF to provision and manage your AWS resources, which of course will ensure consistency and scalability. It provides reliable state management for your infrastructure, avoiding issues like state file conflicts.

### Warm-up Programming Tasks

#### P1
The below method provides an AMI image for an EC2 instance by region. Errors resulting from this lookup could be made more clear. How?

> **_Answer_**
> - The error handling can be improved by adding a check for the region in the amiMapping object. If the region is not found, the method can throw an error with a more descriptive message. See the updated code below:

```typescript
export function getAmiIdByRegion(region: string): string {
    const amiId = amiMapping[region];
    if (!amiId) {
        throw new Error(`No AMI ID found for region: ${region}`);
    }
    return amiId;
}
```

### IaC Implementation Tasks

#### I1
Our custom scope provides a method `getAwsVpc`. Explain how this method works and correct the faulty CIDR block.

> **_Answer_**
> - A more appropriate CIDR block for a typical VPC would be in the range of /16 to /24, depending on the number of IP addresses you need. For example, "172.16.0.0/16" provides 65,536 IP addresses, which is standard for a VPC. This correction ensures the CIDR block is within the allowable range and appropriate for typical use cases in a cloud environment.

```typescript
const vpc = new AwsVpc(this, `${alias}-vpc`, {
    cidrBlock: "172.16.0.0/2", // I1
    provider,
    tags: {
        Name: alias
    },
    enableDnsHostnames: true,
    enableDnsSupport: true
});
```

#### I2
Our custom scope provides a method `getNextAvailableSubnet`. First, explain how this method is used. Then, notice that the method is missing resource deployments relevant to the `RouteTable`. Add these.
> **_Answer_**
> - The `getNextAvailableSubnet` method is responsible for dynamically creating and configuring an AWS subnet in the next available CIDR block within a VPC. It is used in CIDR Block Assignment as it calls `this._nextCidrBlock()` to generate the next available CIDR block for the new subnet which ensures each subnet gets a unique block of IP addresses. It also creates an alias for the subnet based on the VPC alias and the generated CIDR block, retrieeves the AWS provider, VPC, and internet gateway, and then creates a new AwsSubnet resource with the generated CIDR block, linked to the VPC ID.

```typescript
    public getNextAvailableSubnet(availabilityZone: string = "a"): AwsSubnet {
        const cidr = this._nextCidrBlock(); // e.g., "172.16.1.0/24"
        const alias = `${this.getAwsVpcAlias()}-${cidr.split(".").join("-")}`;
        const awsProvider = this.getAwsProvider();
        const vpc = this.getAwsVpc();
        const internetGateway = this.getAwsInternetGateway();

        const subnet = new AwsSubnet(this, `${alias}-subnet`, {
            cidrBlock: cidr, // Use the CIDR as returned, e.g., "172.16.1.0/24"
            vpcId: vpc.id,
            provider: awsProvider,
            mapPublicIpOnLaunch: true,
            availabilityZone: `${this.getAwsRegion()}${availabilityZone}`,
        });

        const routeTable = new RouteTable(this, `${alias}-route-table`, {
            vpcId: vpc.id,
            provider: awsProvider,
        });

        // I2 - Add a route to the internet gateway
        new Route(this, `${alias}-route`, {
            routeTableId: routeTable.id,
            destinationCidrBlock: '0.0.0.0/0',
            gatewayId: internetGateway.id,
            provider: awsProvider,
        });

        // Associate the route table with the subnet
        new RouteTableAssociation(this, `${alias}-route-table-association`, {
            subnetId: subnet.id,
            routeTableId: routeTable.id,
            provider: awsProvider,
        });

        return subnet;
    }
```

## Other Tasks
For I3 - I6, please refer to the code base as they have all being addressed.

### Cloud Infrastructure Questions

#### C1
Explain the role of an Internet Gateway.
> **_Answer_**
> - An Internet Gateway (IGW) is critical for allowing instances in your VPC to communicate with the internet. It essentially acts as a bridge that lets traffic flow between the public internet and your resources with public IP addresses inside the VPC. Without it, there’s no external connectivity for your instances.

#### C2
We use a local public key to create an AWS key pair. What might be the security implications of this?
> **_Answer_**
> - When you use a local public key to create an AWS key pair, the private key stays on your machine. If that private key gets compromised—whether through malware, accidental sharing, or weak security practices—you’re giving potential attackers the keys to your instances. So, it’s critical to secure that private key carefully and restrict access to it.

#### C3
How would adjust the mask 192.7.12.3/24 to allow for 1000 hosts?
> **_Answer_**
> - The /24 subnet gives you 256 IP addresses, which isn’t enough for 1000 hosts. To accommodate that, you’d need to move to a /22 subnet. That gives you 1024 IP addresses, which should cover the need. So, something like 192.7.12.3/22 would get the job done.

#### C4
A server is showing degraded performance. You identify that a series of long-running TCP connections are consuming network resources. What might you do to mitigate this? What might you advise to the application developers?
> **_Answer_**
> - Well, to mitigate such issues, you might want to implement timeouts to close idle or long-running TCP connections. You can also limit the number of concurrent connections to the server using firewall rules or application-level configurations. You can also introduce load balancers to evenly distribute incoming traffic across multiple servers. Then lastly, you can monitor the network traffic and identify the source of the high traffic and put automatic scaling actions to handle the increased load.

In addition, you can advise the application developers to optimize their code to reduce the number of long-running TCP connections. They should also consider using connection pooling to reuse connections and reduce the overhead of establishing new connections.

#### C5
You are informed that you must update the infrastructure developed herein to apply a rolling update. How would you propose to do this?
> **_Answer_**
> - This can be done in multiple ways including exploring blue/green deployments, CI/CD pipeline for the infrastructure, and rolling updates. We can also implement a rolling update strategy where you gradually replace instances in a group with new instances, ensuring that the new instances are healthy before retiring the old ones.

Specifically in the case of our own infrastructure, a CI/CD pipeline for the infrastructure can be implemented to automate the process of updating the infrastructure. This pipeline can include steps for testing, building, and deploying the infrastructure. This would allow for a more controlled and automated process of updating the infrastructure. We can also add versioning and release notes to the infrastructure to track changes and provide context for updates.

### Conceptual Questions about the Blockchain

#### B1
Explain what an Ethereum Light Client is and how it would be used. What additional infrastructure might you need to support typical use cases?
> **_Answer_**
> - An Ethereum Light Client is a lightweight version of a full Ethereum node that only stores a subset of the blockchain data. An Ethereum Light Client doesn't store the full blockchain, just the headers, making it lightweight and faster. You’d use it where resources are limited and to support it, you'd need full nodes for data sync, some RPC endpoints, and monitoring to ensure uptime.

#### B2
You have deployed infrastructure for a delegated proof of stake (DPoS) blockchain. You identify that only a US-based validator nodes are producing blocks. What might be the cause?
> **_Answer_**
> - This could be due to the validator nodes being geographically concentrated in the US. This could be due to network latency, power outages, or other factors. To mitigate this, you could consider deploying validator nodes in multiple regions or using a decentralized network of validators - you need a more balanced distribution of votes or stake across regions.

#### B3
If all nodes in a blockchain network go offline at the same time, would the network be able to recover? Why or why not? Under what circumstances might it recover?
> **_Answer_**
> - If all nodes in a blockchain network go offline at the same time, the network would not be able to recover. This is because the network relies on the consensus of all nodes to maintain the integrity of the blockchain. Without any nodes to validate transactions or create new blocks, the network would be unable to function. However, the network can recover if nodes come back online with their data intact. If nodes lose state or backups, you'd need snapshots or external backups to restore the network.

#### B4
How might the infrastructure requirements for a blockchain node differ amongst these consensus algorithms: proof of work (PoW), proof of stake (PoS), delegated proof of stake (DPoS), and Proof of Space?
> **_Answer_**
> This is detailed as follows:
> - PoW: Heavy on computing power and energy.
> - PoS: Lighter on computation but requires reliable internet and staked assets.
> - DPoS: Similar to PoS but also needs strong networking for handling voting and consensus.
> - Proof of Space: Focuses on storage capacity over compute power