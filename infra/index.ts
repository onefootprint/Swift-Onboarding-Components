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

    // setup or secrets param store
    const secretsStore = await secrets.LoadSecrets(config, enclaveKeyConfig);

    // launch of core service
    const services = await Promise.all(regions.map(async region => {
        // mint a cert for this property
        const cert = await certs.CreateCertificate({ domain: `*.${stack}.${constants.rootDomain}`, region, hostedZoneId: hostedZone.id });

        // create our fargate service
        const service = await svc.Create({
            availabilityZones: 2,
            cpuUnits: 256,
            memoryMB: 512,
            instanceCount: 1,
            certArn: cert,
            domain: `${constants.internalAppSubdomain}.${stack}.${constants.rootDomain}`,
            serviceName: "fpc",
            region,
            hostedZoneId: hostedZone.zoneId,
        }, constants, secretsStore, enclaveKeyConfig)

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
        appLBs: services.map(svc => { svc.service.lb.loadBalancer.dnsName })
    }
};