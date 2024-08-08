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
    `static_secrets/${g.secretsStore.datadogApiKeySecretName}`,
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
      imageId: 'ami-0c9be5c48757e9518',
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
      tagSpecifications: [
        {
          resourceType: 'instance',
          tags: {
            'env': pulumi.getStack(),
          },
        },
      ],
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
  datadogApiKeySecretName: string,
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
            {
              Action: ['secretsmanager:GetSecretValue'],
              Effect: 'Allow',
              Resource: `arn:aws:secretsmanager:*:*:secret:${datadogApiKeySecretName}-*`,
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
 * This is the cloud-init script for injecting secrets and other runtime config into nitro EC2 instances.
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

  // TODO: if enclave unhealthy after restart fail health check on ASG.
  return `#!/bin/bash

set -euxo pipefail

sed -i "s/api_key:.*/api_key: $(aws secretsmanager get-secret-value --secret-id static_secrets/${secretsStore.datadogApiKeySecretName} --query SecretString --output text)/" /etc/datadog-agent/datadog.yaml

touch /etc/tailscale-connect.env
chown root:root /etc/tailscale-connect.env
chmod 640 /etc/tailscale-connect.env
echo "TAILSCALE_AUTH_KEY_SSM_PARAM=${tailscaleSecretName}" >> /etc/tailscale-connect.env
echo "TAILSCALE_HOSTNAME_PREFIX=${hostName}" >> /etc/tailscale-connect.env

touch /etc/fetch-enclave-binaries.env
chown root:root /etc/fetch-enclave-binaries.env
chmod 640 /etc/fetch-enclave-binaries.env
echo "ECR_ENDPOINT=${ecrEndpoint}" >> /etc/fetch-enclave-binaries.env
echo "ENCLAVE_IMAGE=${enclaveImage}" >> /etc/fetch-enclave-binaries.env
echo "ENCLAVE_PROXY_IMAGE=${enclaveProxyImage}" >> /etc/fetch-enclave-binaries.env

touch /etc/enclave-proxy.env
chown root:root /etc/enclave-proxy.env
chmod 640 /etc/enclave-proxy.env
echo "ENCLAVE_PROXY_SECRET=$(aws ssm get-parameter --name "/static_secrets/${secretsStore.enclaveProxySecretName}" --with-decryption | jq -r ".Parameter.Value")" >> /etc/enclave-proxy.env
`;

}
