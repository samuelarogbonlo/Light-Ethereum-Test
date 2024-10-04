export enum Region {
    // United States
    usw1 = "usw1",  // US West 1
    usw2 = "usw2",  // US West 2
    use1 = "use1",  // US East 1
    use2 = "use2",  // US East 2

    // Canada
    can1 = "can1",  // Canada Central

    // Europe
    euw1 = "euw1",  // Europe West 1
    euw2 = "euw2",  // Europe West 2
    euc1 = "euc1",  // Europe Central 1
    eun1 = "eun1",  // Europe North 1

    // Asia
    asw1 = "asw1",  // Asia West 1 (e.g., India)
    ase1 = "ase1",  // Asia East 1 (e.g., Hong Kong, Taiwan)
    ase2 = "ase2",  // Asia East 2 (e.g., Japan, Korea)
    ass1 = "ass1",  // Asia South 1 (e.g., Singapore)
    asn1 = "asn1",  // Asia North 1 (e.g., China)

    // Australia
    auw1 = "auw1",  // Australia West
    aue1 = "aue1",  // Australia East

    // South America
    sam1 = "sam1",  // South America 1 (e.g., Brazil)

    // Africa
    afr1 = "afr1",  // Africa North 1 (e.g., Egypt)
    afr2 = "afr2",  // Africa South 1 (e.g., South Africa)

    // Middle East
    mea1 = "mea1",  // Middle East 1 (e.g., UAE)
}

export class Regions {

    private static REGION_TO_AWS_REGION: { [region: string]: string } = {
        [Region.usw1] : "us-west-1",
        [Region.usw2] : "us-west-2",
        [Region.use1] : "us-east-1",
        [Region.use2] : "us-east-2",
        [Region.can1] : "ca-central-1",
        [Region.euw1] : "eu-west-1",
        [Region.euw2] : "eu-west-2",
        [Region.euc1] : "eu-central-1",
        [Region.eun1] : "eu-north-1",
        [Region.asw1] : "ap-south-1",
        [Region.ase1] : "ap-east-1",
        [Region.ase2] : "ap-northeast-2",
        [Region.ass1] : "ap-southeast-1",
        [Region.asn1] : "ap-northeast-1",
        [Region.auw1] : "ap-southeast-2",
        [Region.aue1] : "ap-southeast-2",
        [Region.sam1] : "sa-east-1",
        [Region.afr1] : "me-north-1",
        [Region.afr2] : "af-south-1",
        [Region.mea1] : "me-south-1",
    };

    static toAwsRegion(region: Region): string {
        return Regions.REGION_TO_AWS_REGION[region];
    }
}