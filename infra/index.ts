import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as certs from './certs';
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import * as cdn from './cdn';
import * as app from './app';

interface Constants {
    cdnProtectionHeaderName: string;
    rootDomain: string;
    internalAppSubdomain: string
    cdnAppSubdomain: string
}

let config = new pulumi.Config();
const constants = config.requireObject<Constants>("constants");
const cloudfrontSecret = new random.RandomString("cf-alb-pass", { length: 44 });

const regions = [Region.USEast1, Region.USWest1];

export = async () => {
    const hostedZone = await aws.route53.getZone({ name: constants.rootDomain });

    const services = await Promise.all(regions.map(async region => {
        // mint a cert for this property
        const cert = await certs.CreateCertificate({ domain: `*.${constants.rootDomain}`, region, hostedZoneId: hostedZone.id });

        // create our fargate service
        const service = await app.Create({
            availabilityZones: 2,
            cpuUnits: 256,
            memoryMB: 512,
            instanceCount: 1,
            certArn: cert,
            cloudfrontAlbSecret: cloudfrontSecret.result,
            cloudfrontAlbSecretHeaderName: constants.cdnProtectionHeaderName,
            domain: `${constants.internalAppSubdomain}.${constants.rootDomain}`,
            imageName: "fpc",
            imagePath: "../",
            region,
            hostedZoneId: hostedZone.zoneId
        })

        return { service, cert, region }
    }));

    const distribution = await cdn.Create({
        certArn: services[0].cert, // needs US-East-1 cert
        cdnToAlbSecret: cloudfrontSecret.result,
        cdnToAlbSecretHeaderName: constants.cdnProtectionHeaderName,
        domain: `${constants.cdnAppSubdomain}.${constants.rootDomain}`,
        origin: `${constants.internalAppSubdomain}.${constants.rootDomain}`,
        hostedZoneId: hostedZone.zoneId
    });

    return {
        domain: `${constants.cdnAppSubdomain}.${constants.rootDomain}`,
        cdn: distribution.domainName,
        appLBs: services.map(svc => { svc.service.lb.loadBalancer.loadBalancer.dnsName })
    }
};