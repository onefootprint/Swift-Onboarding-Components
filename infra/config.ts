export interface Config {
    cdnProtectionHeaderName: string;
    rootDomain: string;
    internalAppSubdomain: string;
    cdnAppSubdomain: string;
    elastic: Elastic;
    enclaveCertPCR8: string;
    containers: Containers;
    rpId: string;
    workos: Workos;
    twilio: Twilio;
    sendgrid: Sendgrid;
    sentryUrl: string;
}

export interface Elastic {
    apmEndpoint: string;
}

export interface Containers {
    apiVersion: string;
    enclaveVersion: string;
}

export interface Workos {
    defaultOrg: string,
    clientId: string,
}

export interface Twilio {
    accountSid: string,
    phoneNumber: string,
    integrationTestPhoneNumber: string,
}

export interface Sendgrid {
    fromEmail: string
}