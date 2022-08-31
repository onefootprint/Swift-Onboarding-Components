export interface Config {
  resources: Resources;
  domain: Domains;
  elastic: Elastic;
  enclaveCertPCR8: string;
  containers: Containers;
  rpId: string;
  workos: Workos;
  twilio: Twilio;
  sendgrid: Sendgrid;
  sentryUrl: string;
}

/**
 * Our header name for securing auth between cloudfront and internal load balancers
 */
export const CDN_PROTECTION_HEADER_NAME: string = 'X-Token-From-CloudFront';

export interface Domains {
  base: string;
  prefix: string;
}

export interface Resources {
  instances: number;
  memoryMB: number;
  cpuUnits: number;
}

export interface Elastic {
  apmEndpoint: string;
}

export interface Containers {
  apiVersion: string;
  enclaveVersion: string;
}

export interface Workos {
  defaultOrg: string;
  clientId: string;
}

export interface Twilio {
  accountSid: string;
  phoneNumber: string;
  integrationTestPhoneNumber: string;
}

export interface Sendgrid {
  fromEmail: string;
}
