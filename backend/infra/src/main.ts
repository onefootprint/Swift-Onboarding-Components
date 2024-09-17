import * as sg from './sg';
import { Region } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as certs from './certs';
import * as pulumi from '@pulumi/pulumi';
import * as secrets from './secrets';
import { Config } from './config';
import * as apiSvc from './api_service';
import * as cron from './cron';
import * as worker from './worker';
import * as ecsCluster from './ecs_cluster';
import * as ecsRoles from './ecs_roles';
import * as enclaveKey from './enclave_key';
import * as db from './db';
import * as neon_db from './db_neon';
import * as vpcUtil from './vpc';
import * as hmacSigningKey from './hmac_key';
import * as s3 from './s3';
import * as idCdn from './id_cdn'
import {
  GetStackMetadata,
  StackEnvironment,
  StackMetadata,
} from './stack_metadata';
import * as nitroService from './nitro_service';
import * as dns from './dns';
import * as assets from './asset_cdn';
import { DatabaseOutput } from './db';
import { ConfigureAlerts } from './alerts';
import * as datadog from './datadog';
import * as ecrSetup from './ecr';
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
  const coreSecurityGroups = await sg.CreateCoreSecurityGroups(
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

  // Create our id2 CDN
  const id2Cdn = await idCdn.CreateId2CloudfrontDistribution(
    constants,
    stackMetadata
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

  ecrSetup.Setup();

  const service = await createCoreService(globalState);

  ConfigureAlerts(globalState, stackMetadata);

  if (stackMetadata.environment !== StackEnvironment.DevEphemeral) {
    // We want one of these per account, so skip for ephemeral.
    await datadog.CreateDatadogIntegration(secretsStore);
  }

  return {
    service,
    apiUrl: `https://${dnsConfig.apiDomain}`,
    databaseUrl: database.databaseUrl,
    shortStackName: stackMetadata.shortStackName,
    id2CdnDomain: id2Cdn.domainName
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
  const region = g.region;

  // launch core services
  const cert = certs.CreateRegionalWildCertificateForDnsConfig({
    domain: g.dnsConfig.apiDomain,
    hostedZoneId: g.dnsConfig.hostedZone.id,
    region: g.region,
  });

  // create the nitro service
  const nitroServiceOutput = await nitroService.CreateNitroService(g, cert);

  // create shared ECS resources
  const cluster = ecsCluster.CreateECSCluster(g);
  const roles = await ecsRoles.CreateECSRoles(g);

  // create our ecs api service
  const apiService = await apiSvc.CreateApiService(
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
    cluster,
    roles,
    nitroServiceOutput,
  );

  // create cron jobs
  await cron.CreateScheduledTasks(g, cluster, roles, nitroServiceOutput);

  // create worker jobs
  await worker.CreateWorkerTasks(g, cluster, roles, nitroServiceOutput);

  return {
    assetCdn: g.assetCdn.origin,
    cdnDomainName: apiService.distribution.domainName,
    externalDomain: apiService.cdnDomain,
    loadBalancerCname: apiService.lbCname,
    internalLoadBalancerDnsName: apiService.lb.loadBalancer.dnsName,
    nitroServiceEndpoint: nitroServiceOutput.serviceEndpoint,
  };
}
