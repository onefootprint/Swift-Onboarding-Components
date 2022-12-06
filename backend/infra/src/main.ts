import * as sg from './sg';
import { Region } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as certs from './certs';
import * as pulumi from '@pulumi/pulumi';
import * as cdn from './cdn';
import * as secrets from './secrets';
import { Config } from './config';
import * as svc from './service';
import * as enclaveKey from './enclave_key';
import * as db from './db';
import * as vpcUtil from './vpc';
import * as hmacSigningKey from './hmac_key';
import * as s3 from './s3';
import { GetStackMetadata } from './stack_metadata';
import * as nitroService from './nitro_service';
import * as dns from './dns';

/**
 * Convenient type to pass shared global resources
 */
export type GlobalState = {
  region: Region;
  provider: aws.Provider;
  vpc: vpcUtil.FootprintVpc;
  constants: Config;
  secretsStore: secrets.StaticSecrets;
  enclaveKeyConfig: enclaveKey.EnclaveKeyDescriptor;
  hmacSigningKeyConfig: hmacSigningKey.HmacSigningKeyDescriptor;
  database: db.DatabaseOutput;
  dnsConfig: dns.DnsConfig;
  coreSecurityGroups: sg.CoreSecurityGroups;
  buckets: s3.S3Buckets;
};

/**
 * Main infra entry point
 */
export default async function main() {
  let config = new pulumi.Config();
  let constants = config.requireObject<Config>('constants');

  const stackMetadata = GetStackMetadata();

  // NOTE: we currently do not deploy in other regions
  // however the infra is architcted to support multiple regions
  // with the exception of the database which will either need
  // cross-region replication or VPC peering across region (TODO)
  const primaryRegion = Region.USEast1;
  const otherRegions: Region[] = [];

  // Setup our DNS config
  const dnsConfig = await dns.LoadDnsConfig(constants);

  const { region, vpc, provider } = await vpcUtil.CreateRegionalVPC(
    stackMetadata,
    primaryRegion,
    constants,
    dnsConfig,
  );

  // setup our enclave/hmac keys
  const enclaveKeyConfig = await enclaveKey.Initialize(constants, otherRegions);
  const hmacSigningKeyConfig = await hmacSigningKey.Initialize(
    constants,
    otherRegions,
  );

  // setup secrets
  const secretsStore = await secrets.LoadSecrets(
    config,
    enclaveKeyConfig,
    stackMetadata,
  );

  // setup core security groups
  const coreSecurityGroups = sg.CreateCoreSecurityGroups(
    vpc,
    provider,
    stackMetadata,
  );

  // Setup database
  const database = await db.CreateDB(
    vpc,
    provider,
    `db-${stackMetadata.shortStackName}`,
    constants,
    secretsStore,
    {
      protectDeletion: constants.deletionProtection,
    },
    coreSecurityGroups,
  );

  // Create our s3 buckets
  const s3Buckets = s3.CreateBuckets(provider, constants, stackMetadata);

  const globalState: GlobalState = {
    vpc,
    region,
    provider,
    constants,
    secretsStore,
    enclaveKeyConfig,
    hmacSigningKeyConfig,
    database,
    dnsConfig,
    coreSecurityGroups,
    buckets: s3Buckets,
  };

  const service = await createCoreService(globalState);

  return {
    service,
    apiUrl: `https://${dnsConfig.apiDomain}`,
    databaseUrl: database.databaseUrl,
  };
}

/**
 * Outputs returned to pulumi by a stack deploy
 */
export type CoreServiceOutputs = {
  cdnDomainName: pulumi.Output<string>;
  externalDomain: string;
  loadBalancerCname: string;
  internalLoadBalancerDnsName: pulumi.Output<string>;
  nitroServiceEndpoint: string;
};

/**
 * Launches our core services
 */
async function createCoreService(g: GlobalState): Promise<CoreServiceOutputs> {
  // launch core services
  const cert = await certs.CreateRegionalWildCertificateForDnsConfig(
    g.dnsConfig,
    g.region,
  );

  // create the nitro service
  const nitroServiceOutput = await nitroService.CreateNitroService(
    g,
    {
      cid: 16,
      memory: 256,
      cpus: 2,
    },
    cert,
  );

  // create our ecs api service
  const service = await svc.CreateApiService(
    g,
    {
      cpuUnits: g.constants.resources.cpuUnits,
      memoryMB: g.constants.resources.memoryMB,
      instanceCount: g.constants.resources.instances,
    },
    cert,
    nitroServiceOutput,
  );

  return {
    cdnDomainName: service.distribution.domainName,
    externalDomain: service.cdnDomain,
    loadBalancerCname: service.lbCname,
    internalLoadBalancerDnsName: service.lb.loadBalancer.dnsName,
    nitroServiceEndpoint: nitroServiceOutput.serviceEndpoint,
  };
}
