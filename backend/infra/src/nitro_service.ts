import { EGRESS_ALL } from './sg';
import { GlobalState } from './main';
import { DnsConfig } from './dns';
import { EnclaveKeyDescriptor } from './enclave_key';
import { StaticSecrets } from './secrets';
import { FootprintVpc } from './vpc';
import * as aws from '@pulumi/aws';
import { Region } from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import { Config } from './config';
import {
  StackMetadata,
  GetStackMetadata,
  StackEnvironment,
} from './stack_metadata';
import * as certs from './certs';
import { Certificate } from './certs';
import * as tailscale from '@pulumi/tailscale';
import * as pulumi from '@pulumi/pulumi';

export type NitroServiceOutput = {
  serviceEndpoint: string;
  loadBalancer: awsx.lb.ApplicationLoadBalancer;
  targetGroup: aws.lb.TargetGroup;
};

// the default port for the nitro proxy
const PROXY_LB_PORT = 3668;

/**
 * Create the nitro service
 * ALB to ASG( EC2[proxy to nitro_enclave])
 */
export async function CreateNitroService(
  g: GlobalState,
  cert: Certificate,
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
          description: 'allow ingress from the API',
        },
        {
          protocol: 'tcp',
          fromPort: 443,
          toPort: 443,
          sourceSecurityGroupId: g.coreSecurityGroups.cron.id,
          description: 'allow ingress from cron jobs',
        },
        {
          protocol: 'tcp',
          fromPort: 443,
          toPort: 443,
          sourceSecurityGroupId: g.coreSecurityGroups.worker.id,
          description: 'allow ingress from workers',
        },
      ],
      egress: [EGRESS_ALL],
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

  const ebsKmsKey = await aws.kms.getKey({ keyId: 'alias/aws/ebs' });

  // setup as a tailscale node
  let tag = '';
  if (g.stackMetadata.environment === StackEnvironment.DevEphemeral) {
    tag = `tag:nitro-server-dev`;
  } else {
    tag = `tag:nitro-server-${g.stackMetadata.shortStackName}`;
  }
  const tailscaleAuthKey = new tailscale.TailnetKey(
    `nitro-server-tskey-${g.stackMetadata.shortStackName}`,
    {
      ephemeral: true,
      preauthorized: true,
      reusable: true,
      tags: [tag],
    },
  );

  // store the TS-key in SSM
  const tsKeySecretName = `/nitro-server/ts-key-${g.stackMetadata.shortStackName}`;
  new aws.ssm.Parameter(
    `ssm-param-ts-key-nitro-server-${g.stackMetadata.shortStackName}`,
    {
      type: 'SecureString',
      value: tailscaleAuthKey.key,
      name: tsKeySecretName,
    },
  );

  const instanceProfile = createInstanceRole(
    region,
    provider,
    `/static_secrets/${g.secretsStore.enclaveProxySecretName}`,
    tsKeySecretName,
  );

  const launchTemplate = new aws.ec2.LaunchTemplate(
    `i-template-${serviceName}`,
    {
      namePrefix: `i-${serviceName}`,
      instanceType: g.constants.enclave.resources.instance,
      userData: Buffer.from(
        await userData(
          g.constants,
          g.secretsStore,
          tsKeySecretName,
          g.stackMetadata,
        ),
      ).toString('base64'),
      enclaveOptions: {
        enabled: true,
      },
      // TODO: build our own AMI with pre-installed dependencies
      // to optimize startup!
      imageId: 'ami-0fec9863172e50c93',
      iamInstanceProfile: {
        arn: instanceProfile.arn,
      },
      updateDefaultVersion: true,
      blockDeviceMappings: [
        {
          deviceName: '/dev/xvda',
          ebs: {
            volumeSize: 30,
            encrypted: 'true',
            kmsKeyId: ebsKmsKey.arn,
          },
        },
      ],

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
      minSize: g.constants.enclave.resources.minInstances,
      maxSize: g.constants.enclave.resources.maxInstances,
      desiredCapacity: g.constants.enclave.resources.minInstances,
      launchTemplate: {
        id: launchTemplate.id,
        version: pulumi.output(launchTemplate.latestVersion).apply(v => `${v}`),
      },
      healthCheckGracePeriod: 120,
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
  cert: Certificate,
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
      // Be careful changing this - we have to make sure it is not any higher than the application's
      // keep-alive timeout
      // https://linear.app/footprint/issue/FP-3633/diagnose-502s
      idleTimeout: 60,
      // private subnets as this is an internal service
      subnets: g.vpc.privateSubnetIds,
      accessLogs: {
        bucket: g.buckets.accessLogBucketName,
        enabled: true,
        prefix: 'fpc-ns',
      },
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
  enclaveProxySecretName: string,
  tailscaleSecretName: string,
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
        name: 'secret_params',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${enclaveProxySecretName}`,
            },
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${tailscaleSecretName}`,
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
  secretsStore: StaticSecrets,
  tailscaleSecretName: string,
  stack: StackMetadata,
): Promise<string> {
  const current = await aws.getCallerIdentity({});
  const ecrEndpoint = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com`;
  const enclaveImage = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:${constants.containers.enclaveVersion}`;
  const enclaveProxyImage = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com/enclave_proxy_pkg:${constants.containers.enclaveVersion}`;

  const hostName = `enclavebox-${stack.shortStackName}`;
  const resources = constants.enclave.resources;

  // nitro-cli doesn't let you take all the RAM you ask for from the allocator - I guess it also counts
  // the size of the binary and other things that the enclave needs against you. So, we subtract
  // a fixed amount of memory out of what you requested
  const BUFFER_FOR_ENCLAVE = 256;

  const actualEnclaveMemory = resources.memory - BUFFER_FOR_ENCLAVE;
  if (actualEnclaveMemory < 256) {
    throw `${BUFFER_FOR_ENCLAVE} MiB of memory are reserved for the enclave, so your provided enclave memory is too low. Please make sure your requested enclave memory - ${BUFFER_FOR_ENCLAVE} >= 256`;
  }

  // TODO: if enclave unhealthy after restart fail health check on ASG.
  return `
#!/bin/bash
set -euxo pipefail

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
log_group_name=/ec2/${hostName}/awslogs
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/awslogs*
initial_position=start_of_file

[/var/log/boot]
log_group_name=/ec2/${hostName}/boot
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/boot*
initial_position=start_of_file

[/var/log/nitro_enclaves]
log_group_name=/ec2/${hostName}/nitro_enclave
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/nitro_enclaves/*
initial_position=start_of_file

[/var/log/enclave_proxy]
log_group_name=/ec2/${hostName}/enclave_proxy
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/enclave_proxy.log
initial_position=start_of_file

[/var/log/cloud-init]
log_group_name=/ec2/${hostName}/cloud_init
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/cloud-init*.log
initial_position=start_of_file
EOF

# start logging daemon
sudo systemctl start awslogsd

### BEGIN SETUP TAILSCALE ###
sudo yum-config-manager --add-repo https://pkgs.tailscale.com/stable/centos/7/tailscale.repo
sudo yum install tailscale nc -y
sudo systemctl enable --now tailscaled

cat <<'EOF' > /tmp/tailscale_connect.sh
#!/bin/sh
tsKey="$(aws --region us-east-1 ssm get-parameter --name '${tailscaleSecretName}' --with-decryption | jq -r '.Parameter.Value')"
instanceId=$(cat /run/cloud-init/instance-data.json | jq -r '.ds["meta-data"]["instance-id"]')

sudo tailscale up --authkey "$tsKey" --ssh --hostname "${hostName}-$instanceId" --accept-dns=false
EOF

sudo mv /tmp/tailscale_connect.sh /usr/local/bin/tailscale_connect.sh
sudo chown root:root /usr/local/bin/tailscale_connect.sh
sudo chmod +x /usr/local/bin/tailscale_connect.sh

# TODO: Fix systemd dependencies and make this a oneshot service.
cat <<'EOF' > /tmp/tailscale_connect.service
[Unit]
Description=tailscale_connect

[Service]
User=root
WorkingDirectory=/
ExecStart="/usr/local/bin/tailscale_connect.sh"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo mv /tmp/tailscale_connect.service /etc/systemd/system/tailscale_connect.service
sudo chown root:root /etc/systemd/system/tailscale_connect.service
sudo systemctl start tailscale_connect.service && sudo systemctl enable tailscale_connect.service

echo "Starting tailscale"
/usr/local/bin/tailscale_connect.sh
sudo tailscale status

### END SETUP TAILSCALE ###


# setup enclave

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${ecrEndpoint}

# Copy the enclave EIF and proxy binary to the host.
mkdir /tmp/artifacts

docker run --rm -v /tmp/artifacts:/tmp/artifacts --entrypoint "sh" ${enclaveImage} -c "cp /usr/local/share/enclave.eif /tmp/artifacts/enclave.eif"
sudo mv /tmp/artifacts/enclave.eif /usr/local/share/enclave.eif
sudo chown root:root /usr/local/share/enclave.eif

docker run --rm -v /tmp/artifacts:/tmp/artifacts --entrypoint "sh" ${enclaveProxyImage} -c "cp /usr/local/bin/enclave_proxy /tmp/artifacts/enclave_proxy"
sudo mv /tmp/artifacts/enclave_proxy /usr/local/bin/enclave_proxy
sudo chown root:root /usr/local/bin/enclave_proxy
sudo chmod +x /usr/local/bin/enclave_proxy

# Edit the allocator.yaml to support our desired amount of resources
sudo cat <<'EOF' > /etc/nitro_enclaves/allocator.yaml
---
memory_mib: ${resources.memory}
cpu_count: ${resources.cpus}
EOF

sudo systemctl start nitro-enclaves-allocator.service && sudo systemctl enable nitro-enclaves-allocator.service
sudo systemctl status nitro-enclaves-allocator.service
sudo systemctl start nitro-enclaves-vsock-proxy.service && sudo systemctl enable nitro-enclaves-vsock-proxy.service
sudo systemctl status nitro-enclaves-vsock-proxy.service

# setup enclave runner
cat <<'EOF' > /tmp/enclave_runner.sh
#!/bin/sh
RUNNING="RUNNING"
while :
do
	STATUS=$(nitro-cli describe-enclaves | jq -r '.[0]["State"]')
    if [ "$RUNNING" = "$STATUS" ]; then
        sleep 1
    else
        echo "restarting enclave"
        sudo nitro-cli run-enclave --eif-path /usr/local/share/enclave.eif --cpu-count ${resources.cpus} --memory ${actualEnclaveMemory} --enclave-cid ${resources.cid}
        sleep 5
    fi
done
EOF

sudo mv /tmp/enclave_runner.sh /usr/local/bin/enclave_runner.sh
sudo chown root:root /usr/local/bin/enclave_runner.sh
sudo chmod +x /usr/local/bin/enclave_runner.sh

cat <<'EOF' > /tmp/enclave_runner.service
[Unit]
Description=enclave_runner
Wants=network-online.target
After=network-online.target

[Service]
User=root
WorkingDirectory=/
ExecStart="/usr/local/bin/enclave_runner.sh"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo mv /tmp/enclave_runner.service /etc/systemd/system/enclave_runner.service
sudo chown root:root /etc/systemd/system/enclave_runner.service
sudo systemctl start enclave_runner.service && sudo systemctl enable enclave_runner.service

# setup enclave_proxy

sudo echo "ENCLAVE_PROXY_SECRET=$(aws --region us-east-1 ssm get-parameter --name "/static_secrets/${secretsStore.enclaveProxySecretName}" --with-decryption | jq -r ".Parameter.Value")" > /etc/enclave_proxy_environment

sudo echo "RUST_LOG=info" >> /etc/enclave_proxy_environment
touch /var/log/enclave_proxy.log

cat <<'EOF' > /etc/rsyslog.d/enclave_proxy.conf
if $programname == 'enclave_proxy' then /var/log/enclave_proxy.log
& stop
EOF

sudo systemctl restart rsyslog

cat <<'EOF' > /tmp/enclave_proxy.service
[Unit]
Description=enclave_proxy

[Service]
User=root
WorkingDirectory=/
EnvironmentFile=/etc/enclave_proxy_environment
ExecStart="/usr/local/bin/enclave_proxy"
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=enclave_proxy

[Install]
WantedBy=multi-user.target
EOF


sudo mv /tmp/enclave_proxy.service /etc/systemd/system/enclave_proxy.service
sudo chown root:root /etc/systemd/system/enclave_proxy.service
sudo systemctl start enclave_proxy.service && sudo systemctl enable enclave_proxy.service`;
}
