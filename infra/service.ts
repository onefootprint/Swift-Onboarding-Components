import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import { StaticSecrets } from "./secrets";
import { Config } from "./config";
import { Monitor } from "./monitor";
import * as fs from 'fs';
import { EnclaveKeyDescriptor } from "./enclave_key";

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
    dockerfilePath: string,
    hostedZoneId: string,
    domain: string
}

export async function Create(config: AppConfig, constants: Config, secretsStore: StaticSecrets, enclaveKeyDescriptor: EnclaveKeyDescriptor): Promise<Service> {
    const region = config.region;
    const provider = new aws.Provider(`provider-${config.imageName}-${region}`, { region });

    const vpc = new awsx.ec2.Vpc(`vpc-${config.imageName}-${region}`, {
        numberOfAvailabilityZones: config.availabilityZones,
    }, { provider });

    const vpcPrivateSubnets = await vpc.privateSubnets;

    /**
     *  
     * Create Roles 
     * Task exec
    */
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

    const ecsInstanceRole = new aws.iam.Role(`ecs-instance-role-${region}`, {
        assumeRolePolicy: {
            Version: "2012-10-17",
            Statement: [{
                Sid: "",
                Effect: "Allow",
                Principal: {
                    Service: "ec2.amazonaws.com",
                },
                Action: "sts:AssumeRole",
            }],
        },
        inlinePolicies: [
            {
                name: "ecr_enclave_pull",
                policy: JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [{
                        Action: [
                            "ecr:Describe*",
                            "ecr:BatchGetImage",
                            "ecr:BatchCheckLayerAvailability",
                            "ecr:GetDownloadUrlForLayer",
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

    const _ecsInstanceRolePolicyAttachment = new aws.iam.RolePolicyAttachment(`ecs-instance-role-policy-${region}`, {
        role: ecsInstanceRole.name,
        policyArn: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
    });

    const ecsInstanceProfile = new aws.iam.InstanceProfile(`ecs-iam-instance-profile-${region}`, {
        role: ecsInstanceRole.name
    }, { provider });

    const instanceAmi = await aws.ec2.getAmi({
        mostRecent: true,
        owners: ["amazon"],
        filters: [{
            name: "name",
            values: ["amzn2-ami-ecs-hvm-*-x86_64-*"]
        }]
    }, { provider });

    const clusterName = `cluster-${config.imageName}-${region}-${pulumi.getStack()}`;

    let userData = fs.readFileSync("ec2_userdata.sh").toString();
    userData = userData.replace('{CLUSTER_NAME}', clusterName);

    const launchTemplate = new aws.ec2.LaunchTemplate(`template-ecs-${config.imageName}-${region}`, {
        instanceType: "c5a.xlarge",
        userData: Buffer.from(userData).toString('base64'),
        enclaveOptions: {
            enabled: true,
        },
        imageId: instanceAmi.id,
        iamInstanceProfile: {
            arn: ecsInstanceProfile.arn,
        },
        updateDefaultVersion: true,
        networkInterfaces: vpcPrivateSubnets.map((sn, index) => {
            return { subnetId: sn.id, deviceIndex: index, securityGroups: [] }
        }),
    }, { provider });

    const autoScaling = new aws.autoscaling.Group(`autoscale-${config.imageName}-${region}`, {
        minSize: 1,
        maxSize: 2,
        launchTemplate: {
            id: launchTemplate.id,
            version: pulumi.output(launchTemplate.latestVersion).apply(v => `${v}`)
        },
        vpcZoneIdentifiers: vpc.privateSubnetIds,
        protectFromScaleIn: false,
        instanceRefresh: {
            strategy: "Rolling",
            preferences: {
                minHealthyPercentage: 0,
            },
            triggers: ["tag"],
        },
    }, { provider, dependsOn: [launchTemplate] });

    const capacityProvider = new aws.ecs.CapacityProvider(`capgroup2-${config.imageName}-${region}`, {
        autoScalingGroupProvider: {
            autoScalingGroupArn: autoScaling.arn,
            managedTerminationProtection: "DISABLED",
            managedScaling: {
                status: "DISABLED"
            }
        }
    }, { provider });


    // create the cluster
    const cluster = new awsx.ecs.Cluster(`cluster-${config.imageName}-${region}`, {
        name: clusterName,
        vpc,
        capacityProviders: [capacityProvider.name]
    }, { provider });


    // init our ALB
    const appPort = 8000;

    const appLbSg = new awsx.ec2.SecurityGroup(`app-${config.imageName}-lb-sg-${region}`, {
        vpc,
        ingress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
        egress: [{ protocol: "-1", fromPort: appPort, toPort: appPort, cidrBlocks: [vpc.vpc.cidrBlock] }],
    }, { provider });


    const publicSubnets = await vpc.publicSubnetIds;
    const privateSubnets = await vpc.privateSubnetIds;

    const applb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
        `app-${config.imageName}-alb-${region.toString()}`, {
        vpc,
        securityGroups: [appLbSg],
    }, { provider });

    const target = applb.createTargetGroup(`${config.imageName}-alb-target-${region.toString()}`, { port: appPort, vpc });

    // create the containers
    const otelCollector = Monitor.otelCollector(secretsStore, constants, region);

    const image = awsx.ecs.Image.fromDockerBuild(`${config.imageName}-image-${region}`, {
        context: "../",
        dockerfile: config.dockerfilePath,
    });

    const imageName = pulumi.output(image.image(`${config.imageName}-image-${region}`, target));

    const containerDef = pulumi.all([
        imageName,
        otelCollector,
        enclaveKeyDescriptor.rootKeyId,
        enclaveKeyDescriptor.enclaveParentCredentials.access_key_id,
        secretsStore.enclaveParentSecretKey.arn,
        enclaveKeyDescriptor.enclaveKmsCredentials.access_key_id,
        secretsStore.enclaveUserSecretKey.arn
    ]).apply(([img, otelCollector, rootKeyId, parentAccessKeyId, enclaveParentArn, enclaveAccessKeyId, enclaveUserArn]) => {
        return JSON.stringify([{
            name: config.imageName,
            image: img,
            essential: true,
            secrets: [
                {
                    name: "AWS_SECRET_ACCESS_KEY",
                    valueFrom: enclaveParentArn
                },
                {
                    name: "ENCLAVE_AWS_SECRET_ACCESS_KEY",
                    valueFrom: enclaveUserArn
                }
            ],
            environment: [
                {
                    name: "AWS_REGION",
                    value: `${region}`
                },
                {
                    name: "AWS_ACCESS_KEY_ID",
                    value: parentAccessKeyId
                },
                {
                    name: "AWS_ROOT_KEY_ID",
                    value: rootKeyId
                },
                {
                    name: "ENCLAVE_AWS_ACCESS_KEY_ID",
                    value: enclaveAccessKeyId
                },
                {
                    name: "RUST_LOG",
                    value: "INFO"
                },
                {
                    name: "OTEL_RESOURCE_ATTRIBUTES",
                    value: `service.name=fpc-api,service.version=1.0,deployment.environment=${pulumi.getStack()}`
                }
            ],
            dependsOn: [{ containerName: otelCollector.name, condition: "START" }],
            portMappings: [{
                containerPort: appPort,
                hostPort: appPort,
                protocol: "tcp"
            }],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": `/ecs/${config.imageName}_logs`,
                    "awslogs-region": `${region}`,
                    "awslogs-create-group": "true",
                    "awslogs-stream-prefix": "ecs",
                }
            }
        }, otelCollector])
    });

    const taskDef = new aws.ecs.TaskDefinition(`task-${config.imageName}-${region.toString()}`, {
        memory: `${config.memoryMB}`,
        cpu: `${config.cpuUnits}`,
        networkMode: "awsvpc",
        requiresCompatibilities: ["EC2"],
        executionRoleArn: taskExecRole.arn,
        family: "ec2-task-definition",
        containerDefinitions: containerDef,
    }, { provider, dependsOn: [cluster] });

    const serviceSg = new awsx.ec2.SecurityGroup(`svc-${config.imageName}-sg-${region}`, {
        vpc,
        ingress: [{ protocol: "-1", fromPort: appPort, toPort: appPort, cidrBlocks: [vpc.vpc.cidrBlock] }],
        egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    }, { provider });


    const service = new aws.ecs.Service(`svc-${config.imageName}-${region.toString()}`, {
        cluster: cluster.cluster.arn,
        launchType: "EC2",
        desiredCount: config.instanceCount,
        taskDefinition: taskDef.arn,
        networkConfiguration: {
            subnets: vpc.privateSubnetIds,
            securityGroups: [serviceSg.id]
        },
        loadBalancers: [{
            containerName: config.imageName,
            containerPort: appPort,
            targetGroupArn: target.targetGroup.arn,
        }]
    }, { provider, dependsOn: [applb] })

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

