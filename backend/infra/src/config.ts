export interface Config {
  resources: Resources;
  domain: Domains;
  elastic: Elastic;
  enclave: Enclave;
  containers: Containers;
  rpId: string;
  workos: Workos;
  twilio: Twilio;
  s3: S3;
  sendgrid: Sendgrid;
  sentryUrl: string;
  deletionProtection: boolean;
  airplane: Airplane;
}

export interface Domains {
  base: string;
  prefix: string;
  frontendBase: string;
  assets: string;
}

export interface Resources {
  memoryMB: number;
  cpuUnits: number;
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
}

export interface Elastic {
  id: string;
  apmEndpoint: string;
  heartbeatCloudId: string;
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

export interface S3 {
  documentImagesBucketNamePrefix: string;
}

export interface Sendgrid {
  fromEmail: string;
}

export interface Airplane {
  teamId: string;
}

export interface Enclave {
  certPCR8: string;
  encryptionSealedIkek: string;
  signingSealedIkek: string;
}
