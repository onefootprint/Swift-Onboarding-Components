import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import { Secrets } from "./secrets";
import { Constants } from "./constants";
import { DataDogMonitor } from "./monitor";

export type Service = {
    lb: awsx.elasticloadbalancingv2.ApplicationListener,
    record: route53.Record
}

export type AppConfig = {
    region: Region,
    certArn: pulumi.Output<string>,
    instanceCount: number,
    availabilityZones: number,
    memoryMB: number,
    cpuUnits: number,
    imageName: string,
    imagePath: string,
    hostedZoneId: string,
    domain: string
}

export async function Create(config: AppConfig, constants: Constants, secretsStore: Secrets): Promise<Service> {
    const region = config.region;
    const provider = new aws.Provider(`provider-${config.imageName}-${region}`, { region });

    const vpc = new awsx.ec2.Vpc(`vpc-${config.imageName}-${region}`, {
        numberOfAvailabilityZones: config.availabilityZones
    }, { provider });

    // init our ALB
    const appLbSg = new awsx.ec2.SecurityGroup(`app-${config.imageName}-lb-sg-${region}`, {
        vpc,
        egress: [{ protocol: "-1", fromPort: 8000, toPort: 8000, cidrBlocks: ["0.0.0.0/0"] }],
    }, { provider });

    const applb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
        `app-${config.imageName}-alb-${region.toString()}`, {
        vpc,
        securityGroups: [appLbSg],
    }, { provider }
    );

    const target = applb.createTargetGroup(`${config.imageName}-alb-target-${region.toString()}`, { port: 8000, vpc });

    // create the container
    // must be *inside* the region to avoid east to west charges for bandwidth
    const image = awsx.ecs.Image.fromPath(`${config.imageName}-image-${region}`, config.imagePath);

    // create the cluster
    const cluster = new awsx.ecs.Cluster(`cluster-${config.imageName}-${region}`, {
        vpc,
    }, { provider });


    const service = new awsx.ecs.FargateService(`app-${config.imageName}-service-${region.toString()}`, {
        cluster,
        // deploymentMaximumPercent: 200, // zero down time
        assignPublicIp: false,
        desiredCount: config.instanceCount,
        taskDefinitionArgs: {
            executionRole: createExecRole(region, secretsStore.secretsPolicyArn),
            containers: {
                api_server: {
                    image,
                    essential: true,
                    memory: config.memoryMB,
                    cpu: config.cpuUnits,
                    portMappings: [target],
                    logConfiguration: DataDogMonitor.logConfiguration("api_server", secretsStore)
                },
                logrouter: DataDogMonitor.logrouter(),
                ddagent: DataDogMonitor.apmAgent(secretsStore)
            },
        }
    }, { provider });

    const web = target.createListener(`app-${config.imageName}-https-listener-${region.toString()}`, {
        external: true,
        certificateArn: config.certArn,
        protocol: "HTTPS",
        sslPolicy: "ELBSecurityPolicy-2016-08",
        // ensure the default is an error
        defaultAction: {
            type: "fixed-response",
            fixedResponse: {
                statusCode: "409",
                contentType: "text/html",
                messageBody: "<html><body>endpoint not authorized</body></html>"
            }
        }
    }, { provider });

    // ensure ALB requests are only coming from cloudfront
    const rule = web.addListenerRule(`app-${config.imageName}-cloudfront-token-rule-${region}`, {
        actions: [{ type: "forward", targetGroupArn: target.targetGroup.arn }],
        conditions: [{

            httpHeader: {
                httpHeaderName: constants.cdnProtectionHeaderName,
                values: [secretsStore.cloudfrontSecret]
            }
        }]
    }, { provider });

    // redirect http to https
    applb.createListener(`app-${config.imageName}-alb-http-redirect-${region}`, {
        protocol: "HTTP",
        defaultAction: {
            type: "redirect",
            redirect: {
                protocol: "HTTPS",
                statusCode: "HTTP_301",
            }
        },
    }, { provider });

    const record = new route53.Record(`record-app-${config.imageName}-${region}`, {
        zoneId: config.hostedZoneId,
        type: "A",
        name: config.domain,
        setIdentifier: `app-record-set-id-${config.imageName}-${region}`,
        latencyRoutingPolicies: [{ region: region }],
        aliases: [{
            name: web.loadBalancer.loadBalancer.dnsName,
            zoneId: web.loadBalancer.loadBalancer.zoneId,
            evaluateTargetHealth: true,
        }]
    });

    return { lb: web, record };
}


/// create the task execution role for ECS fargate tasks to pull secrets
function createExecRole(region: Region, secretsPolicyArn: Output<string>): aws.iam.Role {
    const role = new aws.iam.Role(`task-exec-role-${region}`, {
        assumeRolePolicy: {
            Version: "2008-10-17",
            Statement: [{
                Sid: "",
                Effect: "Allow",
                Principal: {
                    Service: "ecs-tasks.amazonaws.com",
                },
                Action: "sts:AssumeRole",
            }],
        },
    });

    const rpa = new aws.iam.RolePolicyAttachment(`task-exec-${region}-policy`, {
        role: role.name,
        policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });

    const rpa2 = new aws.iam.RolePolicyAttachment(`task-exec-${region}-policy2`, {
        role: role.name,
        policyArn: secretsPolicyArn,
    });

    return role
}