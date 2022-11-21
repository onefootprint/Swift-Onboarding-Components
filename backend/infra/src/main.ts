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
 * Main infra entry point
 */
export default async function main() {
  let config = new pulumi.Config();
  let constants = config.requireObject<Config>('constants');

  const stackMetadata = GetStackMetadata();

  const primaryRegion = Region.USEast1;
  const otherRegions: Region[] = []; // [Region.USWest1];
  const regions = [primaryRegion, ...otherRegions];

  // setup our vpcs and region providers
  const vpcProviders = await Promise.all(
    regions.map(region => {
      return vpcUtil.CreateRegionalVPC(stackMetadata, region, constants);
    }),
  );

  // 2022-10-03 - we use one region (us-east-1)
  // some resources will always be in the default region
  const defaultVpcProvider = vpcProviders[0];

  // init the enclave key
  const enclaveKeyConfig = await enclaveKey.Initialize(constants, otherRegions);
  const hmacSigningKeyConfig = await hmacSigningKey.Initialize(
    constants,
    otherRegions,
  );

  // setup or secrets param store
  const secretsStore = await secrets.LoadSecrets(
    config,
    enclaveKeyConfig,
    stackMetadata,
  );

  // Setup database
  const database = await db.CreateDB(
    defaultVpcProvider,
    `db-${stackMetadata.shortStackName}`,
    constants,
    secretsStore,
    {
      protectDeletion: constants.deletionProtection,
    },
  );

  // Setup our DNS config
  const dnsConfig = await dns.LoadDnsConfig(constants);

  // Create our s3 buckets
  const s3Buckets = s3.CreateBuckets(
    defaultVpcProvider,
    constants,
    stackMetadata,
  );

  // launch of core service
  const services = await Promise.all(
    vpcProviders.map(async vpcAndProvider => {
      // create the nitro service
      const nitroServiceOutput = await nitroService.CreateNitroService(
        vpcAndProvider,
        {
          cid: 16,
          memory: 256,
          cpus: 2,
        },
        dnsConfig,
        constants,
        secretsStore,
        enclaveKeyConfig,
      );

      // create our ecs api service
      const service = await svc.CreateApiService(
        vpcAndProvider,
        {
          cpuUnits: constants.resources.cpuUnits,
          memoryMB: constants.resources.memoryMB,
          instanceCount: constants.resources.instances,
        },
        dnsConfig,
        constants,
        secretsStore,
        enclaveKeyConfig,
        hmacSigningKeyConfig,
        database,
        s3Buckets,
        nitroServiceOutput,
      );

      return {
        service,
        region: vpcAndProvider.region,
        nitroServiceOutput,
      };
    }),
  );

  return {
    regions: services.map(svc => {
      return {
        region: svc.region,
        cdnDomainName: svc.service.distribution.domainName,
        externalDomain: svc.service.cdnDomain,
        loadBalancerCname: svc.service.lbCname,
        internalLoadBalancerDnsName: svc.service.lb.loadBalancer.dnsName,
        nitroServiceEndpoint: svc.nitroServiceOutput.serviceEndpoint,
      };
    }),
    databaseUrl: database.databaseUrl,
  };
}
