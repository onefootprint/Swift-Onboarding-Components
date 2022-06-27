import * as aws from "@pulumi/aws";
import { Region } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"
import { Config } from "../config";

export type NitroEnclaveConfig = {
    cpus: number;
    memory: number;
    cid: number;
}


export async function CreateCluster(clusterName: string, vpc: awsx.ec2.Vpc, targetGroup: awsx.elasticloadbalancingv2.TargetGroup, constants: Config, nitroConfig: NitroEnclaveConfig, region: Region, provider: pulumi.ProviderResource): Promise<awsx.ecs.Cluster> {
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

    const instanceSecurityGroup = new awsx.ec2.SecurityGroup(`instance-sg-${clusterName}`, {
        vpc,
        ingress: [
            { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: [vpc.vpc.cidrBlock] },
            { protocol: "-1", fromPort: 0, toPort: 0, self: true },
        ],
        egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    }, { provider });

    const launchTemplate = new aws.ec2.LaunchTemplate(`template-ec2-${clusterName}`, {
        instanceType: "c5a.xlarge",
        userData: Buffer.from(await userData(clusterName, constants, nitroConfig)).toString('base64'),
        enclaveOptions: {
            enabled: true,
        },
        imageId: instanceAmi.id,
        iamInstanceProfile: {
            arn: instanceProfile.arn,
        },
        // keyName: pulumi.getStack().startsWith("dev") ? jumpKeypairName : undefined,
        updateDefaultVersion: true,
        vpcSecurityGroupIds: [instanceSecurityGroup.id],
    }, { provider });

    const autoScaling = new aws.autoscaling.Group(`autoscale-group-${clusterName}`, {
        minSize: 2,
        maxSize: 4,
        desiredCapacity: 2,
        launchTemplate: {
            id: launchTemplate.id,
            version: pulumi.output(launchTemplate.latestVersion).apply(v => `${v}`)
        },
        healthCheckGracePeriod: 60,
        targetGroupArns: [targetGroup.targetGroup.arn],
        vpcZoneIdentifiers: vpc.privateSubnetIds,
        protectFromScaleIn: false,
        instanceRefresh: {
            strategy: "Rolling",
            preferences: {
                minHealthyPercentage: 80,
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
    }, { provider });

    // create the cluster
    const cluster = new awsx.ecs.Cluster(`${clusterName}`, {
        name: clusterName,
        vpc,
    }, { provider });

    // this is used to tear down
    const clusterCapacityProviders = new aws.ecs.ClusterCapacityProviders(`cluster-capacity-${clusterName}`, {
        clusterName: cluster.cluster.name,
        capacityProviders: [capacityProvider.name]
    }, { provider });


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
async function userData(clusterName: string, constants: Config, config: NitroEnclaveConfig): Promise<string> {
    const current = await aws.getCallerIdentity({});
    const ecrEndpoint = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com`;
    const enclaveImage = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:${constants.containers.enclaveVersion}`;

    // TODO: if enclave unhealthy after restart fail health check on ASG.
    return `
#!/bin/bash

echo -e "ECS_CLUSTER=${clusterName}\n" >> /etc/ecs/ecs.config
echo -e ECS_AVAILABLE_LOGGING_DRIVERS='["json-file","syslog","awslogs","none"]' >> /etc/ecs/ecs.config

sudo yum update -y
sudo amazon-linux-extras install -y aws-nitro-enclaves-cli
sudo yum install aws-nitro-enclaves-cli-devel -y
sudo yum install -y aws-cli
sudo yum install -y jq
sudo usermod -aG ne $USER

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ecrEndpoint}

mkdir -p image
docker run --rm -v $(pwd)/image:/shared ${enclaveImage}
sudo chown $USER:$USER -R image/

sudo systemctl start nitro-enclaves-allocator.service && sudo systemctl enable nitro-enclaves-allocator.service
sudo systemctl start nitro-enclaves-vsock-proxy.service && systemctl enable nitro-enclaves-vsock-proxy.service

# setup enclave runner
cat <<'EOF' > enclave_runner.sh
#!/bin/sh
RUNNING="RUNNING"
while :
do
	STATUS=$(nitro-cli describe-enclaves | jq -r '.[0]["State"]')
    if [ "$RUNNING" = "$STATUS" ]; then
        sleep 1
    else
        echo "restarting enclave"
        sudo nitro-cli run-enclave --eif-path /image/enclave.eif --cpu-count ${config.cpus} --memory ${config.memory} --enclave-cid ${config.cid}
        sleep 5
    fi	 
done
EOF

chmod +x enclave_runner.sh

cat <<'EOF' > enclave_runner.service
[Unit]
Description=enclave_runner

[Service]
User=root
WorkingDirectory=/
ExecStart="/enclave_runner.sh"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo cp enclave_runner.service /etc/systemd/system/enclave_runner.service

sudo systemctl start enclave_runner.service && sudo systemctl enable enclave_runner.service`;

}

