# Light ETH Infrastructure 

## Overview
This project is to provide infrastructure as code (IaC) for an Ethereum Light Client.

- Configuration Details: AWS VPC, EC2 instance configurations, Holesky Network, Consensus and Execution RPC endpoints, 8345 RPC Port configuration, Security Groups, Systemd service.

## Implementation
- Run `aws configure` and follow the prompts
- You will also need to generate a public, private key pair to use with the EC2 instances. By default, the abstractions in the current code are set up to handle key operations for keyparis stored with a private key at `~/.ssh/mvlbs/aws_main` and a public key at `~/.ssh/mvlbs/aws_main.pub`. You may alter this if you see fit and put the right name in `node.ts`.
- Run `cdktf deploy --auto-approve` to deploy the infrastructure from the root directory.

## Requirements for Ethereum Light Client Infrastructure
- MUST provision an EC2 instance with an Ethereum Light Client running as a systemctl service.
- MUST use Terraform CDK to define the infrastructure.
- MUST use Ansible to provision the infrastructure.
- MAY use any Ethereum Light Client.
- MUST expose ETH JSON-RPC on port 8545 to the public.

## License
By contributing, you agree your contributions will be licensed under the [MIT License](link-to-license).
