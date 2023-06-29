import * as sg from './sg';
import { Region } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as certs from './certs';
import * as pulumi from '@pulumi/pulumi';
import * as secrets from './secrets';
import { Config } from './config';
import * as svc from './service';
import * as enclaveKey from './enclave_key';
import * as db from './db';
import * as neon_db from './db_neon';
import * as vpcUtil from './vpc';
import * as hmacSigningKey from './hmac_key';
import * as s3 from './s3';
import {
  GetStackMetadata,
  StackEnvironment,
  StackMetadata,
} from './stack_metadata';
import * as nitroService from './nitro_service';
import * as dns from './dns';
import * as airplane from './airplane';
import * as assets from './asset_cdn';
import { DatabaseOutput } from './db';
import { ConfigureAlerts } from './alerts';

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
  buckets: s3.ServiceS3Buckets;
  stackMetadata: StackMetadata;
  assetCdn: assets.AssetCdn;
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
  const enclaveKeyConfig = await enclaveKey.Initialize(
    stackMetadata,
    constants,
    otherRegions,
  );
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
  let database: DatabaseOutput;

  let neonProjectId = config.get('useNeonEphemeralDbProjectId');

  if (
    stackMetadata.environment === StackEnvironment.DevEphemeral &&
    neonProjectId
  ) {
    database = neon_db.NeonDBOutput(stackMetadata, neonProjectId);
  } else {
    database = await db.CreateDB(
      vpc,
      provider,
      `db-${stackMetadata.shortStackName}`,
      secretsStore,
      constants.db,
      coreSecurityGroups,
      stackMetadata,
    );
  }

  // Create our s3 buckets
  const s3Buckets = await s3.CreateServiceBuckets(
    provider,
    constants,
    stackMetadata,
    region,
  );

  // Create our asset CDN
  const assetCdn = await assets.CreateAssetCdn(
    constants,
    stackMetadata,
    s3Buckets.assetsBucket,
  );

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
    stackMetadata,
    assetCdn,
  };

  // create airplane agent
  const airplaneOutput = airplane.CreateAirplaneAgentStack(globalState);

  const service = await createCoreService(globalState);

  ConfigureAlerts(stackMetadata);

  return {
    service,
    apiUrl: `https://${dnsConfig.apiDomain}`,
    databaseUrl: database.databaseUrl,
    airplaneEnvSlug: airplaneOutput.envSlug,
    shortStackName: stackMetadata.shortStackName,
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
  assetCdn: string;
};

/**
 * Launches our core services
 */
async function createCoreService(g: GlobalState): Promise<CoreServiceOutputs> {
  // launch core services
  const cert = certs.CreateRegionalWildCertificateForDnsConfig({
    domain: g.dnsConfig.apiDomain,
    hostedZoneId: g.dnsConfig.hostedZone.id,
    region: g.region,
  });

  // create the nitro service
  const nitroServiceOutput = await nitroService.CreateNitroService(g, cert);

  // create our ecs api service
  const service = await svc.CreateApiService(
    g,
    {
      cpuUnits: g.constants.resources.cpuUnits,
      memoryMB: g.constants.resources.memoryMB,
      minTasks: g.constants.resources.minInstances,
      maxTasks: g.constants.resources.maxInstances,
      targetCpuUtilization: g.constants.resources.targetCpuUtilization,
      targetMemoryUtilization: g.constants.resources.targetMemoryUtilization,
    },
    cert,
    nitroServiceOutput,
  );

  return {
    assetCdn: g.assetCdn.origin,
    cdnDomainName: service.distribution.domainName,
    externalDomain: service.cdnDomain,
    loadBalancerCname: service.lbCname,
    internalLoadBalancerDnsName: service.lb.loadBalancer.dnsName,
    nitroServiceEndpoint: nitroServiceOutput.serviceEndpoint,
  };
}
