import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as certHelper from './certs';
import * as pulumi from "@pulumi/pulumi"

type Service = {
    lb: awsx.elasticloadbalancingv2.ApplicationListener,
    region: Region,
    certArn: pulumi.Output<string>
}

const parentHostname = "footprint.alexgrinman.com";
const subdomainInternal = "app-internal";
const subdomainExternal = "app";

function createService(region: Region, certificateArn: pulumi.Output<string>): Service {
    const provider = new aws.Provider(`provider-${region}`, { region });
    const vpc = new awsx.ec2.Vpc(`vpc-${region}`, {}, { provider });

    const appLbSg = new awsx.ec2.SecurityGroup(`app-lb-sg-${region}`, {
        vpc,
        ingress: [{ protocol: "tcp", fromPort: 0, toPort: 443, cidrBlocks: ["0.0.0.0/0"] }],
        egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    }, { provider });

    const applb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
        `app-lb-${region.toString()}`, {
        vpc,
        securityGroups: [appLbSg]
    }, { provider }
    );

    const target = applb.createTargetGroup(`web-target-${region.toString()}`, { port: 8000, vpc });

    const clusterSg = new awsx.ec2.SecurityGroup(`app-sg-${region}`, {
        vpc,
        ingress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
        egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    }, { provider });

    // must be *inside* the region to avoid east to west charges for bandwidth
    const fpImage = awsx.ecs.Image.fromPath(`fp-image-${region}`, "../");

    const cluster = new awsx.ecs.Cluster(`cluster-${region}`, { vpc, securityGroups: [clusterSg] }, { provider });
    const service = new awsx.ecs.FargateService(`app-service-${region.toString()}`, {
        cluster,
        // deploymentMaximumPercent: 200, // zero down time
        assignPublicIp: false,
        taskDefinitionArgs: {
            containers: {
                fp: {
                    image: fpImage,
                    memory: 128,
                    portMappings: [target],
                },
            },
        },
        desiredCount: 2,
    }, { provider });

    const web = target.createListener(`web-listener-${region.toString()}`, {
        external: true,
        certificateArn,
        protocol: "HTTPS",
        sslPolicy: "ELBSecurityPolicy-2016-08",
    }, { provider });

    // redirect http to https
    applb.createListener(`app-lb-http-redirect-${region}`, {
        protocol: "HTTP",
        defaultAction: {
            type: "redirect",
            redirect: {
                protocol: "HTTPS",
                statusCode: "HTTP_301",
            }
        },
    }, { provider });

    return { lb: web, region, certArn: certificateArn };
}

async function createRouteRecord(subdomain: string, parent: string, services: Service[]) {
    const hostedZone = await aws.route53.getZone({ name: parent });

    const zones = services.map(svc => {
        new route53.Record(`footprint-${svc.region}`, {
            zoneId: hostedZone.zoneId,
            type: "A",
            name: `${subdomain}.${parent}`,
            setIdentifier: `svc-${svc.region}`,
            latencyRoutingPolicies: [{ region: svc.region }],
            aliases: [{
                name: svc.lb.loadBalancer.loadBalancer.dnsName,
                zoneId: svc.lb.loadBalancer.loadBalancer.zoneId,
                evaluateTargetHealth: true,
            }
            ],
        });
    });
}

async function createCdn(certArn: pulumi.Output<string>, cdnDomain: string, originDomain: string, parent: string) {
    const cdn = new aws.cloudfront.Distribution("app-cdn", {
        enabled: true,
        aliases: [cdnDomain],
        origins: [{
            originId: originDomain,
            domainName: originDomain,
            customOriginConfig: {
                httpsPort: 443,
                httpPort: 80,
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"]
            }
        }],
        viewerCertificate: {
            acmCertificateArn: certArn,
            sslSupportMethod: "sni-only"
        },
        defaultCacheBehavior: {
            targetOriginId: originDomain,
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"],
            cachedMethods: ["HEAD", "GET", "OPTIONS"],

            forwardedValues: {
                cookies: { forward: "none" },
                queryString: false,
            },
        },


        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },
    });

    const hostedZone = await aws.route53.getZone({ name: parent });

    new route53.Record(`cdn-record`, {
        zoneId: hostedZone.zoneId,
        type: "A",
        name: cdnDomain,
        aliases: [{
            name: cdn.domainName,
            zoneId: cdn.hostedZoneId,
            evaluateTargetHealth: true,
        }
        ],
    });

}

// Export the load balancer's address so that it's easy to access. 
async function main(): Promise<pulumi.Output<string>[]> {
    const regions = [Region.USEast1, Region.USWest1];

    const services = await Promise.all(regions.map(async region => {
        const certArn = await certHelper.createWildcardCertificate(parentHostname, region);
        return createService(region, certArn);
    }));

    await createRouteRecord(subdomainInternal, parentHostname, services);

    const cdn = await createCdn(
        services.filter(s => s.region === Region.USEast1)[0].certArn,
        `${subdomainExternal}.${parentHostname}`,
        `${subdomainInternal}.${parentHostname}`,
        parentHostname);

    return services.map(svc => { return svc.lb.endpoint.hostname })
}

export const lbHostnames = main();