# Stage 1: Pull the AWS CLI from the official Amazon image
FROM amazon/aws-cli as aws-cli

# Stage 2: Set up your main image
FROM ubuntu:latest

WORKDIR /usr/src/app

ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl software-properties-common && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install cdktf-cli
RUN npm install -g cdktf-cli

# Install required packages
RUN apt-get update && apt-get install -y gnupg wget lsb-release unzip python3 python3-pip rsync

# Add HashiCorp's GPG key
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

# Add HashiCorp's apt repository
RUN echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" > /etc/apt/sources.list.d/hashicorp.list

# Update apt and install Terraform
RUN apt-get update && apt-get install -y terraform

# Copy AWS CLI from the AWS CLI stage
COPY --from=aws-cli /usr/local/aws-cli/ /usr/local/aws-cli/

# Ensure the AWS CLI binary is in the PATH
ENV PATH="/usr/local/aws-cli/v2/current/bin:$PATH"

# Add AWS environment variable setup to bashrc
RUN echo '\n# Set AWS environment variables from the AWS CLI configuration' >> /root/.bashrc && \
    echo 'export AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)' >> /root/.bashrc && \
    echo 'export AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)' >> /root/.bashrc && \
    echo 'export AWS_DEFAULT_REGION=$(aws configure get region)' >> /root/.bashrc && \
    echo 'export AWS_REGION=$AWS_DEFAULT_REGION' >> /root/.bashrc

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

RUN apt install software-properties-common
RUN add-apt-repository --yes --update ppa:ansible/ansible
RUN apt install ansible -y

# Echo completion message
RUN echo "complete"

# Start the shell
CMD ["/bin/bash"]
