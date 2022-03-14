import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import { Secrets } from "./secrets";
import { Config } from "./config";
import { Monitor } from "./monitor";
import * as fs from 'fs';

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

export async function Create(config: AppConfig, constants: Config, secretsStore: Secrets): Promise<Service> {
    const region = config.region;
    const provider = new aws.Provider(`provider-${config.imageName}-${region}`, { region });

    const vpc = new awsx.ec2.Vpc(`vpc-${config.imageName}-${region}`, {
        numberOfAvailabilityZones: config.availabilityZones
    }, { provider });


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
    }, { provider });

    const autoScaling = new aws.autoscaling.Group(`autoscale-${config.imageName}-${region}`, {
        minSize: 1,
        maxSize: 2,
        launchTemplate: {
            id: launchTemplate.id,
            version: "$Latest"
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
        egress: [{ protocol: "-1", fromPort: appPort, toPort: appPort, cidrBlocks: ["0.0.0.0/0"] }],
    }, { provider });

    const applb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
        `app-${config.imageName}-alb-${region.toString()}`, {
        vpc,
        securityGroups: [appLbSg],
    }, { provider });

    const target = applb.createTargetGroup(`${config.imageName}-alb-target-${region.toString()}`, { port: appPort, vpc });

    // create our i
    // create the container
    const image = awsx.ecs.Image.fromDockerBuild(`${config.imageName}-image-${region}`, {
        context: "../",
        dockerfile: config.dockerfilePath,
    });

/*
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA3U5XRCZOHHYGTHT4
*/
    const taskDef = new aws.ecs.TaskDefinition(`task-${config.imageName}-${region.toString()}`, {
        memory: `${config.memoryMB}`,
        cpu: `${config.cpuUnits}`,
        networkMode: "awsvpc",
        requiresCompatibilities: ["EC2"],
        executionRoleArn: taskExecRole.arn,
        family: "ec2-task-definition",
        containerDefinitions: JSON.stringify([{
            name: config.imageName,
            image: image,
            environment: [
                {
                    name: "ENCLAVE_AWS_ACCESS_KEY_ID",
                    value: "AKIA3U5XRCZOOWIHM57Y"
                },
                {
                    name: "ENCLAVE_AWS_SECRET_ACCESS_KEY",
                    value: "/szbUWzwLVHF/SmtYLCT5IF6bHv67kM5LxO9PBeN"
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
            portMappings: [{
                containerPort: appPort,
                hostPort: appPort,
                protocol: "tcp"
            }]
        }]),
    }, { provider, dependsOn: [cluster] });

    const service = new aws.ecs.Service(`svc-${config.imageName}-${region.toString()}`, {
        cluster: cluster.cluster.arn,
        launchType: "EC2",
        desiredCount: config.instanceCount,
        taskDefinition: taskDef.arn,
        networkConfiguration: {
            assignPublicIp: false,
            subnets: vpc.privateSubnetIds,
            securityGroups: [appLbSg.id]
        },
        loadBalancers: [{
            containerName: config.imageName,
            containerPort: 80,
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

