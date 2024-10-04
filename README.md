# Lightly ETH Take-Home Technical
- **Duration:** 1:30 - 2:15
- **Overview:** Provide infrastructure as code (IaC) for an Ethereum Light Client and answer some conceptual questions.
- We fully expect you to use LLM support! We're more interested in what your answers reveal about your approach.
- This technical comes in **FIVE PARTS**:
    - A series of requirements-based questions, called out in this document with [R#]
    - Warm-up programming tasks, called out in code and in this document with [W#].
    - IaC implementation tasks, called out in code and in this document with [I#].
    - Cloud infrastructure questions, called out in code and in this document with [C#].
    - Conceptual questions about the blockchain, called out in code and in this document with [B#].

## Getting Started
Before we dive into the technical, let's get familiar with the code base and go over how to work with it.

### Development Environment

#### Cloud Credentials
We will be using AWS for this technical. You will need to have an AWS account and have your credentials set up on your local machine. If you don't have an AWS account, you can create one [here](https://aws.amazon.com/). All elements of this exercise can be completed within the AWS Free Tier.

You will need to authenticate the AWS CLI to complete this technical. You can do this by running `aws configure` and following the prompts.

You will also need to generate a public, private key pair to use with the EC2 instances. By default, the abstractions in the current code are set up to handle key operations for keyparis stored with a private key at `~/.ssh/mvlbs/<key-name>` and a public key at `~/.ssh/mvlbs/<key-name>.pub`. You may alter this if you see fit.

#### Dependencies
We've provided a VsCode devcontainer definition in [`./devcontainer/maintainer`](./.devcontainer/maintainer) to make this easy. If you're comfortable working with VsCode, simply reopen this project in the container. Otherwise, you may use the `Dockerfile` in said directory as a guide to set up your own development environment.

The container will mount as follows:

```shell
"source=${localEnv:HOME}/.aws,target=/root/.aws,type=bind",
"source=${localEnv:HOME}/.ssh,target=/root/.ssh,type=bind",
"source=${localEnv:HOME}/.gitconfig,target=/root/.gitconfig,type=bind",
```

This should allow you to use your host's AWS credentials and SSH keys in the container.

### Technologies and Code Organization

#### Technologies for IaC
Ultimately, in this technical, we want you ship infrastructure as code (IaC) for an Ethereum Light Client that uses:

- [Terraform CDK](https://learn.hashicorp.com/tutorials/terraform/cdktf) to define the infrastructure on AWS.
- [Ansible](https://www.ansible.com/) to provision the infrastructure.

We leave the joice of what to use for the Ethereum Light Client to you. However, it must run as a systemctl service on an EC2 instance. 

We will reiterate these requirements in the [Requirements](#requirements) section.

#### Code Organization
It is easiest to understand the code by reading from `main.ts` in the root of the project. This file is the entry point for the Terraform CDK. It defines the infrastructure and provisions it using Ansible.

[`main.ts`](./main.ts) deploys and Ethereum Light Client stack from [`./infra/eth`](./infra/eth).

[`./infra/eth`](./infra/eth) relies on a series of abstractions from [`./infra/util`](./infra/util) to define the infrastructure. It is an exercise for the reader to understand how these abstractions work.

[`./infra/eth`](./infra/eth) applies to this infrastructure an ansible playbook defined at [`./infra/eth/light-client.yml`](./infra/eth/light-client.yml) to define the infrastructure. 

## The Assessment
Let's get into the assessment!

### Requirements
Below are a series of requirements, we'd like for you to break these out into sub-requirements. The sub-requirements should indicate things like:
- machine dependencies;
- added technologies;
- configuration details;
- clarifying questions that would need to be answered in the real world.

**Requirements for Ethereum Light Client Infrastructure**
- MUST provision an EC2 instance with an Ethereum Light Client running as a systemctl service.
- MUST use Terraform CDK to define the infrastructure.
    - R1: What os will you use for the EC2 instance? Why?
    - R2: What instance type will you use? Why?
- MUST use Ansible to provision the infrastructure.
    - R3: List the dependencies for the Ethereum Light Client that you will need to provision.
- MAY use any Ethereum Light Client.
    - R4: What Ethereum Light Client will you use? Why?
- MUST expose ETH JSON-RPC on port 8545 to the public.
    - R5: What configurations will you need to manage to expose the JSON-RPC?
- MAY someday need to provide an observability solution. 
    - R6: What observability solution would you use? Why?
- MAY someday need to provide a CI/CD pipeline for the infrastructure.
    - R7: What CI/CD pipeline would you use? Why?

**Practical Requirements for This Technical**
- The Terraform stack and the Ansible playbook MUST run jointly without intervention or error.
- The Ethereum Light Client MUST be running as a systemctl service on the EC2 instance with an active status.
- We must be able to run the following curl command from our local machine and get a valid response:
    ```shell
    curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://<public-ip>:8545
    ```

### Warm-up Programming Tasks

#### P1
The below method provides an AMI image for an EC2 instance by region. Errors resulting from this lookup could be made more clear. How?

```typescript
export function getAmiIdByRegion(region: string): string | undefined {
    // P1
    return amiMapping[region];
}
```

### IaC Implementation Tasks

#### I1
Our custom scope provides a method `getAwsVpc`. Explain how this method works and correct the faulty CIDR block. 

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

```typescript
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
        availabilityZone: `${this.getAwsRegion()}${availabilityZone}`
    });

    const routeTable = new RouteTable(this, `${alias}-route-table`, {
        vpcId: vpc.id,
        provider: awsProvider
    });

    // I2
    // What should go here?...

}
```

#### I3
Currently, the compute and storage settings for the EC2 instance are hard-coded not in the free tier. Justify the settings you choose or make them free-tier eligible.

#### I4
We've left the Ansible playbook for the Ethereum Light Client incomplete. Complete it.

#### I5
You need to call the Ansible playbook from the Terraform CDK. Update the code

#### I6
You need to expose the JSON-RPC on port 8545. Update the code.

### Cloud Infrastructure Questions

#### C1
Explain the role of an Internet Gateway.

#### C2
We use a local public key to create an AWS key pair. What might be the security implications of this?

#### C3
How would adjust the mask 192.7.12.3/24 to allow for 1000 hosts?

#### C4
A server is showing degraded performance. You identify that a series of long-running TCP connections are consuming network resources. What might you do to mitigate this? What might you advise to the application developers?

#### C5
You are informed that you must update the infrastructure developed herein to apply a rolling update. How would you propose to do this?

### Conceptual Questions about the Blockchain

#### B1
Explain what an Ethereum Light Client is and how it would be used. What additional infrastructure might you need to support typical use cases?

#### B2
You have deployed infrastructure for a delegated proof of stake (DPoS) blockchain. You identify that only a US-based validator nodes are producing blocks. What might be the cause?

#### B3
If all nodes in a blockchain network go offline at the same time, would the network be able to recover? Why or why not? Under what circumstances might it recover?

#### B4
How might the infrastructure requirements for a blockchain node differ amongst these consensus algorithms: proof of work (PoW), proof of stake (PoS), delegated proof of stake (DPoS), and Proof of Space?
