import { EGRESS_ALL } from './sg';
import { GlobalState } from './main';
import { DnsConfig } from './dns';
import { EnclaveKeyDescriptor } from './enclave_key';
import { StaticSecrets } from './secrets';
import { FootprintVpc } from './vpc';
import * as aws from '@pulumi/aws';
import { Region } from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';
import { Config } from './config';
import { StackMetadata, GetStackMetadata } from './stack_metadata';
import * as certs from './certs';

export type NitroConfig = {
  cpus: number;
  memory: number;
  cid: number;
};

export type NitroServiceOutput = {
  serviceEndpoint: string;
  loadBalancer: awsx.lb.ApplicationLoadBalancer;
  targetGroup: aws.lb.TargetGroup;
};

// the default port for the nitro proxy
const PROXY_LB_PORT = 3668;

/**
 * Create the nitro service
 * ALB -> ASG( EC2[proxy --> nitro_enclave])
 */
export async function CreateNitroService(
  g: GlobalState,
  nitroConfig: NitroConfig,
  cert: aws.acm.Certificate,
): Promise<NitroServiceOutput> {
  const stackMetadata = GetStackMetadata();
  const serviceName = `nitro-service-${stackMetadata.shortStackName}`;

  const vpc = g.vpc.vpc;
  const provider = g.provider;
  const region = g.region;

  // this security group protects the nitro LB
  const nitroLoadBalancerSecurityGroup = new awsx.ec2.SecurityGroup(
    `${serviceName}-lb-sg`,
    {
      vpc,
      ingress: [
        {
          protocol: 'tcp',
          fromPort: 443,
          toPort: 443,
          sourceSecurityGroupId: g.coreSecurityGroups.fpcService.id,
          description: 'this limits ingress just from the fpc service',
        },
      ],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  const instanceProfile = createInstanceRole(region, provider, [
    g.secretsStore.enclaveProxySecretName,
  ]);

  // get our base image AMI
  const instanceAmi = await aws.ec2.getAmi(
    {
      mostRecent: true,
      owners: ['amazon'],
      filters: [
        {
          name: 'name',
          values: ['amzn2-ami-ecs-hvm-*-x86_64-*'],
        },
      ],
    },
    { provider },
  );

  const instanceSecurityGroup = new awsx.ec2.SecurityGroup(
    `${serviceName}-sg`,
    {
      vpc,
      ingress: [
        // this limits ingress just from the nitro load balancer
        {
          protocol: '-1',
          fromPort: PROXY_LB_PORT,
          toPort: PROXY_LB_PORT,
          sourceSecurityGroupId: nitroLoadBalancerSecurityGroup.id,
        },
      ],
      egress: [
        // TODO: lockdown just to AWS KMS and related services
        EGRESS_ALL,
      ],
    },
    { provider },
  );

  const launchTemplate = new aws.ec2.LaunchTemplate(
    `i-template-${serviceName}`,
    {
      namePrefix: `i-${serviceName}`,
      instanceType: 'c5a.xlarge',
      userData: Buffer.from(
        await userData(g.constants, nitroConfig, g.secretsStore),
      ).toString('base64'),
      enclaveOptions: {
        enabled: true,
      },
      imageId: instanceAmi.id,
      iamInstanceProfile: {
        arn: instanceProfile.arn,
      },
      updateDefaultVersion: true,
      vpcSecurityGroupIds: [instanceSecurityGroup.id],
      tags: {
        name: serviceName,
      },
    },
    { provider },
  );

  let nitroServiceOutput = await createLoadBalancer(
    g,
    stackMetadata,
    nitroLoadBalancerSecurityGroup,
    g.dnsConfig,
    cert,
  );

  const autoScaling = new aws.autoscaling.Group(
    `asg-${serviceName}`,
    {
      minSize: 2,
      maxSize: 4,
      desiredCapacity: 2,
      launchTemplate: {
        id: launchTemplate.id,
        version: pulumi.output(launchTemplate.latestVersion).apply(v => `${v}`),
      },
      healthCheckGracePeriod: 60,
      vpcZoneIdentifiers: g.vpc.privateSubnetIds,
      protectFromScaleIn: false,
      healthCheckType: 'ELB',
      targetGroupArns: [nitroServiceOutput.targetGroup.arn],
      instanceRefresh: {
        strategy: 'Rolling',
        preferences: {
          minHealthyPercentage: 80,
        },
        triggers: ['tag'],
      },
    },
    { provider, dependsOn: [launchTemplate] },
  );

  return nitroServiceOutput;
}

/**
 * Create Nitro LB for the ASG
 */
async function createLoadBalancer(
  g: GlobalState,
  stackMetadata: StackMetadata,
  securityGroup: awsx.ec2.SecurityGroup,
  dnsConfig: DnsConfig,
  cert: aws.acm.Certificate,
): Promise<NitroServiceOutput> {
  const vpc = g.vpc.vpc;
  const region = g.region;
  const provider = g.provider;
  const serviceName = `ns-${stackMetadata.shortStackName}`;
  const domain = `enclave-proxy.${dnsConfig.apiDomain}`;

  const loadBalancer = new awsx.lb.ApplicationLoadBalancer(
    `alb-${serviceName}`,
    {
      vpc,
      // this lets the LB communicate to our nitro instances
      securityGroups: [securityGroup],
      external: false,

      // private subnets as this is an internal service
      subnets: g.vpc.privateSubnetIds,
    },
    { provider },
  );

  const targetGroup = new aws.lb.TargetGroup(
    `albtg-${serviceName}`,
    {
      vpcId: vpc.vpc.id,
      targetType: 'instance',
      port: PROXY_LB_PORT,
      protocol: 'HTTP',
      healthCheck: {
        port: 'traffic-port',
        path: '/health',
      },
    },
    { provider },
  );

  const loadBalancerTargetGroup = loadBalancer.createTargetGroup(
    `lbtg-${serviceName}`,
    {
      targetGroup,
    },
    { provider },
  );

  const http = loadBalancer.createListener(
    `alb-https-${serviceName}`,
    {
      external: false,
      certificateArn: cert.arn,
      protocol: 'HTTPS',
      sslPolicy: 'ELBSecurityPolicy-2016-08',

      defaultAction: {
        type: 'forward',
        targetGroupArn: loadBalancerTargetGroup.targetGroup.arn,
      },
    },
    { provider },
  );

  const record = new aws.route53.Record(
    `dns-alb-${serviceName}-${region}`,
    {
      zoneId: dnsConfig.hostedZone.id,
      type: 'A',
      name: domain,
      aliases: [
        {
          name: loadBalancer.loadBalancer.dnsName,
          zoneId: loadBalancer.loadBalancer.zoneId,
          evaluateTargetHealth: false,
        },
      ],
    },
    { provider },
  );

  return {
    serviceEndpoint: `https://${domain}`,
    loadBalancer,
    targetGroup,
  };
}
/**
 * The role for the EC2 instance to run as
 */
function createInstanceRole(
  region: Region,
  provider: pulumi.ProviderResource,
  staticSecretNames: string[],
): aws.iam.InstanceProfile {
  const instanceRole = new aws.iam.Role(`nitro-instance-role-${region}`, {
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: '',
          Effect: 'Allow',
          Principal: {
            Service: 'ec2.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    },
    inlinePolicies: [
      {
        name: 'ecr_enclave_pull',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: [
                'ecr:Describe*',
                'ecr:BatchGetImage',
                'ecr:BatchCheckLayerAvailability',
                'ecr:GetDownloadUrlForLayer',
                'ec2:DescribeTags',
                'ecr:GetAuthorizationToken',
              ],
              Effect: 'Allow',
              Resource: '*',
            },
          ],
        }),
      },
      {
        name: 'cloudwatch_logging',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: [
                'logs:CreateLogGroup',
                'logs:PutLogEvents',
                'logs:DescribeLogStreams',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              Effect: 'Allow',
              Resource: '*',
            },
          ],
        }),
      },
      {
        name: 'enclave_proxy_secret',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['ssm:GetParameters', 'ssm:GetParameter'],
              Effect: 'Allow',
              Resource: staticSecretNames.map(name => {
                return `arn:aws:ssm:*:*:parameter/static_secrets/${name}`;
              }),
            },
          ],
        }),
      },
    ],
  });

  return new aws.iam.InstanceProfile(
    `nitro-iam-instance-profile-${region}`,
    {
      role: instanceRole.name,
    },
    { provider },
  );
}

/**
 * This is the "user_data" for booting up an EC2 machine to run our Nitro Enclave + P
 */
async function userData(
  constants: Config,
  config: NitroConfig,
  secretsStore: StaticSecrets,
): Promise<string> {
  const current = await aws.getCallerIdentity({});
  const ecrEndpoint = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com`;
  const enclaveImage = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:${constants.containers.enclaveVersion}`;

  const pulumiConfig = new pulumi.Config();
  const tailscaleAuthKey = pulumiConfig.get('serverTailscaleKey');
  const hostName = `nitro-server-${pulumi.getStack()}`;

  // TODO: if enclave unhealthy after restart fail health check on ASG.
  return `
#!/bin/bash

sudo yum update -y
sudo amazon-linux-extras install -y aws-nitro-enclaves-cli
sudo yum install aws-nitro-enclaves-cli-devel -y
sudo yum install -y aws-cli
sudo yum install -y jq yum-utils httpd-tools

# install log agent on ec2 instance
sudo yum install -y awslogs
sudo mkdir -p /var/lib/awslogs/state/

# Define our log conf files
# see https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AgentReference.html
cat <<'EOF' > /etc/awslogs/awslogs.conf
[general]
state_file=/var/lib/awslogs/state/agent-state

[/var/log/awslogs]
log_group_name=/ec2/nitro_service_ec2_aws_logs
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/awslogs*
initial_position=start_of_file

[/var/log/boot]
log_group_name=/ec2/nitro_service_ec2_boot_logs
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/boot*
initial_position=start_of_file

[/var/log/nitro_enclaves]
log_group_name=/ec2/nitro_service_ec2_enclave_logs
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/nitro_enclaves/*
initial_position=start_of_file
EOF

# start logging daemon
sudo systemctl start awslogsd

# setup tailscale
sudo yum-config-manager --add-repo https://pkgs.tailscale.com/stable/centos/7/tailscale.repo
sudo yum install tailscale nc -y
sudo systemctl enable --now tailscaled
sudo tailscale up --authkey "${tailscaleAuthKey}" --ssh --hostname "${hostName}" --accept-dns=false 

# setup enclave

sudo usermod -aG ne $USER

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ecrEndpoint}

mkdir -p image
docker run --rm -v $(pwd)/image:/shared ${enclaveImage}
sudo chown $USER:$USER -R image/

sudo systemctl start nitro-enclaves-allocator.service && sudo systemctl enable nitro-enclaves-allocator.service
sudo systemctl start nitro-enclaves-vsock-proxy.service && sudo systemctl enable nitro-enclaves-vsock-proxy.service

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
sudo systemctl start enclave_runner.service && sudo systemctl enable enclave_runner.service

# setup enclave_proxy

sudo echo "ENCLAVE_PROXY_SECRET=$(aws --region us-east-1 ssm get-parameter --name "/static_secrets/${secretsStore.enclaveProxySecretName}" --with-decryption | jq -r ".Parameter.Value")" > /enclave_proxy_environment

cat <<'EOF' > enclave_proxy.service
[Unit]
Description=enclave_proxy

[Service]
User=root
WorkingDirectory=/
EnvironmentFile=/enclave_proxy_environment
ExecStart="/image/enclave_proxy"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo cp enclave_proxy.service /etc/systemd/system/enclave_proxy.service
sudo systemctl start enclave_proxy.service && sudo systemctl enable enclave_proxy.service`;
}
