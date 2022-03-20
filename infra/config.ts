export interface Config {
    cdnProtectionHeaderName: string;
    rootDomain: string;
    internalAppSubdomain: string;
    cdnAppSubdomain: string;
    elastic: Elastic;
    enclaveCertPCR8: string;
}

export interface Elastic {
    apmEndpoint: string;
}
