export interface Config {
  resources: Resources;
  db: Database;
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

export interface Database {
  deletionProtection: boolean;
  minAcus: number;
  maxAcus: number;
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
  resources: EnclaveResources;
}

export interface EnclaveResources {
  /// The underlying instance on which the enclave will run. The instance type affects how many
  // CPUs and how much RAM can be reserved for the enclave
  instance: string;
  cpus: number;
  memory: number;
  cid: number;
}
