import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import { StaticSecrets } from "../secrets";
import { Config } from "../config";
import { CreateCluster } from "./cluster";
import { ServiceContainers } from "./containers";
import { EnclaveKeyDescriptor } from "../enclave_key";

export type ServiceLoadBalancer = {
    lb: awsx.elasticloadbalancingv2.LoadBalancer,
}

export type ServiceConfig = {
    region: Region,
    certArn: pulumi.Output<string>,
    instanceCount: number,
    availabilityZones: number,
    memoryMB: number,
    cpuUnits: number,
    serviceName: string,
    hostedZoneId: string,
    domain: string,
}

/**
 * The service port container
 */
const ServicePort = 8000;

/**
 * Create our service on ECS
 */
export async function Create(config: ServiceConfig, constants: Config, secretsStore: StaticSecrets, enclaveKeyDescriptor: EnclaveKeyDescriptor): Promise<ServiceLoadBalancer> {
    const region = config.region;
    const provider = new aws.Provider(`provider-${config.serviceName}-${region}`, { region });

    const vpc = new awsx.ec2.Vpc(`vpc-${config.serviceName}-${region}`, {
        numberOfAvailabilityZones: config.availabilityZones,
    }, { provider });

    // init our cluster
    const cluster = await CreateCluster(`fpc-${pulumi.getStack()}-${region}`, vpc, {
        cid: 16,
        memory: 256,
        cpus: 2,
        version: "latest",
    }, region, provider);

    // declare the containers we want to run
    const containerDefinitions = ServiceContainers.apiMain(ServicePort, constants, secretsStore, enclaveKeyDescriptor, region, cluster);

    // setup the task
    const taskExecRole = createTaskExecutionRole(secretsStore, region);

    const taskDefinition = new aws.ecs.TaskDefinition(`task-${config.serviceName}-${region.toString()}`, {
        memory: `${config.memoryMB}`,
        cpu: `${config.cpuUnits}`,
        networkMode: "awsvpc",
        requiresCompatibilities: ["EC2"],
        executionRoleArn: taskExecRole.arn,
        family: `${config.serviceName}-task-family`,
        containerDefinitions,
    }, { provider, dependsOn: [cluster] });

    const serviceSecurityGroup = new awsx.ec2.SecurityGroup(`svc-${config.serviceName}-sg-${region}`, {
        vpc,
        ingress: [{ protocol: "-1", fromPort: ServicePort, toPort: ServicePort, cidrBlocks: [vpc.vpc.cidrBlock] }],
        egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    }, { provider });

    // setup our load balancer
    const loadBalancerTargetGroup = createCdnFrontedLoadBalancer(vpc, secretsStore, config, constants, provider);

    // build the cluster service
    const service = new aws.ecs.Service(`svc-${config.serviceName}-${region.toString()}`, {
        cluster: cluster.cluster.arn,
        launchType: "EC2",
        desiredCount: config.instanceCount,
        taskDefinition: taskDefinition.arn,
        networkConfiguration: {
            subnets: vpc.privateSubnetIds,
            securityGroups: [serviceSecurityGroup.id]
        },
        loadBalancers: [{
            containerName: config.serviceName,
            containerPort: ServicePort,
            targetGroupArn: loadBalancerTargetGroup.targetGroup.arn,
        }]
    }, { provider, dependsOn: [loadBalancerTargetGroup] })


    return { lb: loadBalancerTargetGroup.loadBalancer };
}


/**
 * Create our application load balancer which will front the cluster
 * front the ALB with cloudfront and setup TLS on the domain
 */
function createCdnFrontedLoadBalancer(vpc: awsx.ec2.Vpc, secretsStore: StaticSecrets, config: ServiceConfig, constants: Config, provider: pulumi.ProviderResource): awsx.elasticloadbalancingv2.TargetGroup {
    const region = config.region;

    // init our ALB
    const loadBalancerSecurityGroup = new awsx.ec2.SecurityGroup(`app-${config.serviceName}-lb-sg-${region}`, {
        vpc,
        ingress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
        egress: [{ protocol: "-1", fromPort: ServicePort, toPort: ServicePort, cidrBlocks: [vpc.vpc.cidrBlock] }],
    }, { provider });


    const loadBalancer = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
        `app-${config.serviceName}-alb-${region}`, {
        vpc,
        securityGroups: [loadBalancerSecurityGroup],
    }, { provider });

    const loadBalancerTargetGroup = loadBalancer.createTargetGroup(`${config.serviceName}-alb-target-${region}`, { port: ServicePort, vpc });

    const web = loadBalancerTargetGroup.createListener(`app-${config.serviceName}-https-listener-${region.toString()}`, {
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
    const rule = web.addListenerRule(`app-${config.serviceName}-cloudfront-token-rule-${region}`, {
        actions: [{ type: "forward", targetGroupArn: loadBalancerTargetGroup.targetGroup.arn }],
        conditions: [{
            httpHeader: {
                httpHeaderName: constants.cdnProtectionHeaderName,
                values: [secretsStore.cloudfrontSecret]
            }
        }]
    }, { provider });

    // redirect http to https
    loadBalancer.createListener(`app-${config.serviceName}-alb-http-redirect-${region}`, {
        protocol: "HTTP",
        defaultAction: {
            type: "redirect",
            redirect: {
                protocol: "HTTPS",
                statusCode: "HTTP_301",
            }
        },
    }, { provider });

    const record = new route53.Record(`record-app-${config.serviceName}-${region}`, {
        zoneId: config.hostedZoneId,
        type: "A",
        name: config.domain,
        setIdentifier: `app-record-set-id-${config.serviceName}-${region}`,
        latencyRoutingPolicies: [{ region: region }],
        aliases: [{
            name: web.loadBalancer.loadBalancer.dnsName,
            zoneId: web.loadBalancer.loadBalancer.zoneId,
            evaluateTargetHealth: true,
        }]
    });

    return loadBalancerTargetGroup;
}

/**
 * Create the task execution role we need to setup the tasks in our ECS service
 * needs to create logs, assume ecs-tasks service, and access static secrets for the containers
 */
function createTaskExecutionRole(secretsStore: StaticSecrets, region: Region): aws.iam.Role {
    const taskExecRole = new aws.iam.Role(`task-exec-role-${region}`, {
        assumeRolePolicy: {
            Version: "2012-10-17",
            Statement: [{
                Sid: "",
                Effect: "Allow",
                Principal: {
                    Service: "ecs-tasks.amazonaws.com",
                },
                Action: "sts:AssumeRole",
            }],
        },
        inlinePolicies: [
            {
                name: "ecs_task_exec_logs",
                policy: JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [{
                        Action: [
                            "logs:CreateLogGroup",
                            "logs:PutLogEvents",
                            "logs:DescribeLogStreams",
                            "logs:CreateLogStream",
                            "logs:PutLogEvents"
                        ],
                        Effect: "Allow",
                        Resource: "*",
                    }],
                }),

            }
        ]
    });

    const _taskExecRolePolicyAttachment = new aws.iam.RolePolicyAttachment(`task-exec-${region}-policy`, {
        role: taskExecRole.name,
        policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });

    const _taskExecRolePolicyAttachmentSecrets = new aws.iam.RolePolicyAttachment(`task-exec-${region}-policy2`, {
        role: taskExecRole.name,
        policyArn: secretsStore.secretsPolicyArn,
    });

    return taskExecRole;
}