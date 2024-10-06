export enum Size {
    xs = "xs",
    sm = "sm",
    md = "md",
    lg = "lg",
    xl = "xl",
    xxl = "xxl",
}

export function sizeToInstanceType(size: Size): string {
    switch (size) {
        case Size.xs:
            return "t2.micro"; // Free Tier eligible
        case Size.sm:
            return "t3.small";
        case Size.md:
            return "t3.medium";
        case Size.lg:
            return "t3.large";
        case Size.xl:
            return "t3.xlarge";
        case Size.xxl:
            return "t3.2xlarge";
        default:
            return "t2.micro";
    }
}

export function sizeToStorageSize(size: Size): number {
    switch (size) {
        case Size.xs:
            return 8; // GiB, Free Tier eligible
        case Size.sm:
            return 16; // GiB
        case Size.md:
            return 32; // GiB
        case Size.lg:
            return 64; // GiB
        case Size.xl:
            return 256; // GiB
        case Size.xxl:
            return 512; // GiB
        default:
            return 8; // Default to 8 GiB if unknown
    }
}
