export interface Config {
    cdnProtectionHeaderName: string;
    rootDomain: string;
    internalAppSubdomain: string;
    cdnAppSubdomain: string;
    elastic: Elastic;
    enclaveCertPCR8: string;
    containers: Containers;
    jumpBoxSSHPublicKey: string;
    rpId: string;
}

export interface Elastic {
    apmEndpoint: string;
}

export interface Containers {
    apiVersion: string;
    enclaveVersion: string;
}