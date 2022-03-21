import * as aws from "@pulumi/aws";
import { Region } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"

export type NitroEnclaveConfig = {
    version: string | undefined;
    cpus: number;
    memory: number;
    cid: number;
}


export async function CreateCluster(clusterName: string, vpc: awsx.ec2.Vpc, nitroConfig: NitroEnclaveConfig, region: Region, provider: pulumi.ProviderResource): Promise<awsx.ecs.Cluster> {
    const instanceProfile = createInstanceRole(region, provider);

    // get our base image AMI
    const instanceAmi = await aws.ec2.getAmi({
        mostRecent: true,
        owners: ["amazon"],
        filters: [{
            name: "name",
            values: ["amzn2-ami-ecs-hvm-*-x86_64-*"]
        }]
    }, { provider });


    const launchTemplate = new aws.ec2.LaunchTemplate(`template-ec2-${clusterName}`, {
        instanceType: "c5a.xlarge",
        userData: Buffer.from(await userData(clusterName, nitroConfig)).toString('base64'),
        enclaveOptions: {
            enabled: true,
        },
        imageId: instanceAmi.id,
        iamInstanceProfile: {
            arn: instanceProfile.arn,
        },
        updateDefaultVersion: true,
        networkInterfaces: (await vpc.privateSubnets).map((sn, index) => {
            return { subnetId: sn.id, deviceIndex: index, securityGroups: [] }
        }),
    }, { provider });

    const autoScaling = new aws.autoscaling.Group(`autoscale-group-${clusterName}`, {
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

    const capacityProvider = new aws.ecs.CapacityProvider(`capacity-${clusterName}`, {
        autoScalingGroupProvider: {
            autoScalingGroupArn: autoScaling.arn,
            managedTerminationProtection: "DISABLED",
            managedScaling: {
                status: "DISABLED"
            }
        }
    }, { provider, dependsOn: [autoScaling] });


    // create the cluster
    const cluster = new awsx.ecs.Cluster(`cluster-${clusterName}`, {
        name: clusterName,
        vpc,
        capacityProviders: [capacityProvider.name]
    }, { provider, dependsOn: [capacityProvider] });

    return cluster;
}

/**
 * the role for our cluster ec2 instances to run as
 */
function createInstanceRole(region: Region, provider: pulumi.ProviderResource): aws.iam.InstanceProfile {
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

    return new aws.iam.InstanceProfile(`ecs-iam-instance-profile-${region}`, {
        role: ecsInstanceRole.name
    }, { provider });
}

/**
 * This is the "user_data" for booting up an EC2 machine to run our cluster tasks
 * It installs our enclave per the config.
 */
async function userData(clusterName: string, config: NitroEnclaveConfig): Promise<string> {
    const enclaveVersionTag = config.version ?? "latest";
    const current = await aws.getCallerIdentity({});
    const ecrEndpoint = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com`;

    return `
    #!/bin/bash

    echo -e "ECS_CLUSTER=${clusterName}\n" >> /etc/ecs/ecs.config
    echo -e ECS_AVAILABLE_LOGGING_DRIVERS='["json-file","syslog","awslogs","none"]' >> /etc/ecs/ecs.config

    sudo yum update -y
    sudo amazon-linux-extras install -y aws-nitro-enclaves-cli
    sudo yum install aws-nitro-enclaves-cli-devel -y
    sudo yum install -y aws-cli
    sudo usermod -aG ne $USER


    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ecrEndpoint}

    mkdir -p image
    docker run --rm -v $(pwd)/image:/shared ${ecrEndpoint}/enclave_pkg:${enclaveVersionTag}
    sudo chown $USER:$USER -R image/

    sudo systemctl start nitro-enclaves-allocator.service && sudo systemctl enable nitro-enclaves-allocator.service
    sudo systemctl start nitro-enclaves-vsock-proxy.service && systemctl enable nitro-enclaves-vsock-proxy.service

    nitro-cli run-enclave --eif-path ./image/enclave.eif --cpu-count ${config.cpus} --memory ${config.memory} --enclave-cid ${config.cid}`
}

