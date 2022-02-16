export interface Constants {
    cdnProtectionHeaderName: string;
    rootDomain: string;
    internalAppSubdomain: string;
    cdnAppSubdomain: string;
    elastic: Elastic
}

export interface Elastic {
    apmEndpoint: string;
    cloudId: string;
}
