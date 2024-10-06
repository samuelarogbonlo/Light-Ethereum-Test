type AmiMapping = {
    [region: string]: string;
};

// Mapping of region to AMI IDs for amd64 architecture
const amiMapping: AmiMapping = {
    "sa-east-1": "ami-0f8b2ed5345954dcc",
    "us-west-1": "ami-0ea80799a59ad106b",
    "eu-west-1": "ami-0d940f23d527c3ab1",
    "ap-northeast-3": "ami-0e3b138e5b9b100af",
    "me-south-1": "ami-0e01027ae8e4b1a6a",
    "ap-south-1": "ami-03bb6d83c60fc5f7c",
    "eu-central-1": "ami-04d9351fa78a6efea",
    "eu-west-3": "ami-01b32e912c60acdfa",
    "ap-south-2": "ami-0183d80552093ddaf",
    "eu-west-2": "ami-0d18e50ca22537278",
    "eu-south-1": "ami-084a59e7796306f59",
    "il-central-1": "ami-06b23b0111e771393",
    "eu-north-1": "ami-00381a880aa48c6c6",
    "eu-central-2": "ami-0047ae4d115d25c8a",
    "eu-south-2": "ami-0a3c51f6e32b1fb78",
    "af-south-1": "ami-0579cc204825dd78a",
    "cn-north-1": "ami-0f7bb896a87239b62",
    "us-west-2": "ami-073ff6027d02b1312",
    "me-central-1": "ami-0b7c0b92a7027b0d1",
    "cn-northwest-1": "ami-0aafe8c5aa3ccc22d",
    "ca-central-1": "ami-09762846eb86feb95",
    "ap-northeast-1": "ami-00247e9dc9591c233",
    "ap-southeast-2": "ami-0d6f74b9139d26bf1",
    "ap-southeast-3": "ami-0b14a3ad70ead7235",
    "us-east-2": "ami-0f5daaa3a7fb3378b",
    "ap-east-1": "ami-047c2b27e29f3093e",
    "ap-northeast-2": "ami-0382ac14e5f06eb95",
    "ap-southeast-4": "ami-03d8e5045971c30b8",
    "us-east-1": "ami-07d9b9ddc6cd8dd30",
    "ap-southeast-1": "ami-0123c9b6bfb7eb962",
    "ca-west-1": "ami-0e8d86970420d328b",
};

// Function to get AMI ID by region for amd64 architecture
export function getAmiIdByRegion(region: string): string {
    const amiId = amiMapping[region];
    if (!amiId) {
        throw new Error(`No AMI ID found for region: ${region}`);
    }
    return amiId;
}