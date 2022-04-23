import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as certs from './certs';
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import * as cdn from './cdn';
import * as secrets from './secrets'
import { Config } from './config'
import * as svc from './service/service';
import * as enclaveKey from './enclave_key';
import * as db from './db';
import * as vpcUtil from './vpc';
import * as hmacSigningKey from './hmac_key';

export = async () => {
    let config = new pulumi.Config();
    let constants = config.requireObject<Config>("constants");
    const stack = pulumi.getStack();

    const primaryRegion = Region.USEast1;
    const otherRegions: Region[] = [];// [Region.USWest1];
    const regions = [primaryRegion, ...otherRegions];

    const hostedZone = await aws.route53.getZone({ name: constants.rootDomain });

    // init the enclave key
    const enclaveKeyConfig = await enclaveKey.Initialize(constants, otherRegions);
    const hmacSigningKeyConfig = await hmacSigningKey.Initialize(constants, otherRegions);

    // setup or secrets param store
    const secretsStore = await secrets.LoadSecrets(config, enclaveKeyConfig);

    // setup our vpcs and region providers
    const vpcProviders = regions.map(region => {
        return vpcUtil.CreateRegionalVPC(region)
    });

    // setup database
    const database = await db.CreateDB(vpcProviders[0], `db-${pulumi.getStack()}`, constants, secretsStore, {
        protectDeletion: false,
    });

    // launch of core service
    const services = await Promise.all(regions.map(async (region, index) => {
        const vpcAndProvider = vpcProviders[index];

        // mint a cert for this property
        const cert = await certs.CreateCertificate({ domain: `*.${stack}.${constants.rootDomain}`, region, hostedZoneId: hostedZone.id });

        // create our ecs service
        const service = await svc.Create(vpcAndProvider, {
            cpuUnits: 256,
            memoryMB: 512,
            instanceCount: 2,
            certArn: cert,
            domain: `${constants.internalAppSubdomain}.${stack}.${constants.rootDomain}`,
            serviceName: "fpc",
            region,
            hostedZoneId: hostedZone.zoneId,
        }, constants, secretsStore, enclaveKeyConfig, hmacSigningKeyConfig, database)

        return { service, cert, region }
    }));

    const distribution = await cdn.Create({
        certArn: services[0].cert, // needs US-East-1 cert
        cdnToAlbSecret: secretsStore.cloudfrontSecret,
        cdnToAlbSecretHeaderName: constants.cdnProtectionHeaderName,
        domain: `${constants.cdnAppSubdomain}.${stack}.${constants.rootDomain}`,
        origin: `${constants.internalAppSubdomain}.${stack}.${constants.rootDomain}`,
        hostedZoneId: hostedZone.zoneId
    });

    return {
        domain: `${constants.cdnAppSubdomain}.${stack}.${constants.rootDomain}`,
        cdn: distribution.domainName,
        appLBs: services.map(svc => { svc.service.lb.loadBalancer.dnsName }),
        databaseUrl: database.databaseUrl,
    }
};