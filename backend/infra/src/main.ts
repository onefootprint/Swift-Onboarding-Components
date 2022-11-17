import { Region } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as certs from './certs';
import * as pulumi from '@pulumi/pulumi';
import * as cdn from './cdn';
import * as secrets from './secrets';
import { CDN_PROTECTION_HEADER_NAME, Config } from './config';
import * as svc from './service';
import * as enclaveKey from './enclave_key';
import * as db from './db';
import * as vpcUtil from './vpc';
import * as hmacSigningKey from './hmac_key';
import * as s3 from './s3';
import * as crypto from 'crypto';

/**
 * Main infra entry point
 */
export default async function main() {
  let config = new pulumi.Config();
  let constants = config.requireObject<Config>('constants');
  const stack = pulumi.getStack();

  const primaryRegion = Region.USEast1;
  const otherRegions: Region[] = []; // [Region.USWest1];
  const regions = [primaryRegion, ...otherRegions];

  // setup our vpcs and region providers
  const vpcProviders = await Promise.all(
    regions.map(region => {
      return vpcUtil.CreateRegionalVPC(region, constants);
    }),
  );
  // 2022-10-03 - we use one region (us-east-1)
  const UsEast1vpcProvider = vpcProviders[0];

  const hostedZone = await aws.route53.getZone({ name: constants.domain.base });

  // init the enclave key
  const enclaveKeyConfig = await enclaveKey.Initialize(constants, otherRegions);
  const hmacSigningKeyConfig = await hmacSigningKey.Initialize(
    constants,
    otherRegions,
  );

  // setup or secrets param store
  const secretsStore = await secrets.LoadSecrets(config, enclaveKeyConfig);

  const pulumiStackHash = crypto
    .createHash('sha256')
    .update(`${pulumi.getStack()}`)
    .digest('hex')
    .substring(0, 16);

  // setup database
  const database = await db.CreateDB(
    UsEast1vpcProvider,
    `db-${pulumiStackHash}`,
    constants,
    secretsStore,
    {
      protectDeletion: constants.deletionProtection,
    },
  );

  // extract our api domain
  const apiDomain = `${constants.domain.prefix}${constants.domain.base}`;
  const internalApiDomain = `internal.${apiDomain}`;

  // Create our s3 buckets
  const s3Buckets = s3.CreateBuckets(UsEast1vpcProvider, constants);

  // launch of core service
  const services = await Promise.all(
    vpcProviders.map(async vpcAndProvider => {
      // mint a cert for this property
      const cert = await certs.CreateCertificate({
        domain: `${constants.domain.base}`,
        region: vpcAndProvider.region,
        hostedZoneId: hostedZone.id,
      });

      // create our ecs service
      const service = await svc.Create(
        vpcAndProvider,
        {
          cpuUnits: constants.resources.cpuUnits,
          memoryMB: constants.resources.memoryMB,
          instanceCount: constants.resources.instances,
          certArn: cert,
          domain: internalApiDomain,
          serviceName: 'fpc',
          hostedZoneId: hostedZone.zoneId,
        },
        constants,
        secretsStore,
        enclaveKeyConfig,
        hmacSigningKeyConfig,
        database,
        s3Buckets,
      );

      return { service, cert, region: vpcAndProvider.region };
    }),
  );

  const distribution = await cdn.Create({
    certArn: services[0].cert, // needs US-East-1 cert
    cdnToAlbSecret: secretsStore.cloudfrontSecret,
    cdnToAlbSecretHeaderName: CDN_PROTECTION_HEADER_NAME,
    domain: apiDomain,
    origin: internalApiDomain,
    hostedZoneId: hostedZone.zoneId,
  });

  return {
    domain: apiDomain,
    internal: internalApiDomain,
    cdn: distribution.domainName,
    appLBs: services.map(svc => {
      svc.service.lb.loadBalancer.dnsName;
    }),
    databaseUrl: database.databaseUrl,
  };
}
