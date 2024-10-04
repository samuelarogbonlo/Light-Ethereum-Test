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
            return "t3.micro";
        case Size.sm:
            return "t3.medium";
        case Size.md:
            return "t3.large";
        case Size.lg:
            return "t3.xlarge";
        case Size.xl:
            return "t3.2xlarge";
        case Size.xxl:
            return "c5.4xlarge";
        default:
            return "t3.micro";
    }
}

export function sizeToStorageSize(size: Size): number {
    switch (size) {
        case Size.xs:
            return 4; // GiB
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
