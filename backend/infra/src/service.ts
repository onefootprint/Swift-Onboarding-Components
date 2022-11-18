import { StackMetadata } from './stack_metadata';
import { ec2, Region, route53 } from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { StaticSecrets } from './secrets';
import { CDN_PROTECTION_HEADER_NAME, Config } from './config';
import { CreateCluster } from './cluster';
import { ServiceContainers } from './containers';
import { EnclaveKeyDescriptor } from './enclave_key';
import * as crypto from 'crypto';
import { DbOutput } from './db';
import { FootprintVpc, Vpc } from './vpc';
import { HmacSigningKeyDescriptor } from './hmac_key';
import * as s3 from './s3';
import { metrics } from '@pulumi/awsx/cloudwatch';
import { GetStackMetadata } from './stack_metadata';

export type ServiceLoadBalancer = {
  lb: awsx.lb.LoadBalancer;
};

export type ServiceConfig = {
  certArn: pulumi.Output<string>;
  instanceCount: number;
  memoryMB: number;
  cpuUnits: number;
  hostedZoneId: string;
  domain: string;
};

export type AWSPolicyConfig = {
  name: string;
  policy: string;
};
/**
 * The service port container
 */
const ServicePort = 8000;

/**
 * Create our service on ECS
 */
export async function Create(
  vpcProvider: FootprintVpc,
  config: ServiceConfig,
  constants: Config,
  secretsStore: StaticSecrets,
  enclaveKeyDescriptor: EnclaveKeyDescriptor,
  signingKeyDescriptor: HmacSigningKeyDescriptor,
  database: DbOutput,
  s3Buckets: s3.S3Buckets,
): Promise<ServiceLoadBalancer> {
  const region = vpcProvider.region;

  const stackMetadata = GetStackMetadata();
  const vpc = vpcProvider.vpc;
  const provider = vpcProvider.provider;

  // setup our load balancer and cloudfront CDN
  const metricsEndpointPath = 'metrics';
  const loadBalancerTargetGroup = await createCdnFrontedLoadBalancer(
    vpcProvider,
    secretsStore,
    metricsEndpointPath,
    config,
    stackMetadata,
  );

  // init our cluster
  const cluster = await CreateCluster(
    stackMetadata.shortStackName,
    vpcProvider,
    loadBalancerTargetGroup,
    constants,
    {
      cid: 16,
      memory: 256,
      cpus: 2,
    },
  );

  // declare the containers we want to run
  const containerDefinitions = await ServiceContainers.apiMain(
    ServicePort,
    constants,
    secretsStore,
    enclaveKeyDescriptor,
    signingKeyDescriptor,
    region,
    cluster,
    database,
    s3Buckets,
    metricsEndpointPath,
  );

  // setup the task
  const current = await aws.getCallerIdentity({});

  const execRole = createTaskExecutionRole(
    secretsStore,
    stackMetadata.shortStackName,
  );

  const taskRoleRole = createTaskContainerRole(
    current.accountId,
    stackMetadata.shortStackName,
    enclaveKeyDescriptor,
    signingKeyDescriptor,
    s3Buckets,
  );

  const taskDefinition = new aws.ecs.TaskDefinition(
    `task-${stackMetadata.shortStackName}`,
    {
      memory: `${config.memoryMB}`,
      cpu: `${config.cpuUnits}`,
      networkMode: 'bridge',
      requiresCompatibilities: ['EC2'],
      executionRoleArn: execRole.arn,
      taskRoleArn: taskRoleRole.arn,
      family: `fpc-task-family`,
      containerDefinitions,
    },
    { provider, dependsOn: [cluster] },
  );

  // build the cluster service
  const service = new aws.ecs.Service(
    `svc-${stackMetadata.shortStackName}`,
    {
      cluster: cluster.cluster.arn,
      launchType: 'EC2',
      desiredCount: config.instanceCount,
      taskDefinition: taskDefinition.arn,
      deploymentController: {
        type: 'ECS',
      },
      deploymentCircuitBreaker: {
        enable: true,
        rollback: true,
      },
      waitForSteadyState: true,
      deploymentMinimumHealthyPercent: 100,
      loadBalancers: [
        {
          containerName: 'fpc',
          containerPort: ServicePort,
          targetGroupArn: loadBalancerTargetGroup.targetGroup.arn,
        },
      ],
    },
    {
      provider,
      dependsOn: [loadBalancerTargetGroup, database.db, ...database.instances],
    },
  );

  return { lb: loadBalancerTargetGroup.loadBalancer };
}

/**
 * Create our application load balancer which will front the cluster
 * front the ALB with cloudfront and setup TLS on the domain
 */
async function createCdnFrontedLoadBalancer(
  vpcProvider: FootprintVpc,
  secretsStore: StaticSecrets,
  metricsEndpointPath: string,
  config: ServiceConfig,
  stackMetadata: StackMetadata,
): Promise<awsx.lb.TargetGroup> {
  const region = vpcProvider.region;
  const vpc = vpcProvider.vpc;
  const provider = vpcProvider.provider;

  const serviceName = stackMetadata.shortStackName;

  // init our ALB
  const loadBalancerSecurityGroup = new awsx.ec2.SecurityGroup(
    `app-lb-sg-${serviceName}`,
    {
      vpc,
      ingress: [
        { protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] },
      ],
      egress: [
        {
          protocol: '-1',
          fromPort: ServicePort,
          toPort: ServicePort,
          cidrBlocks: [vpc.vpc.cidrBlock],
        },
      ],
    },
    { provider },
  );

  const loadBalancer = new awsx.lb.ApplicationLoadBalancer(
    `app-lb-${serviceName}`,
    {
      vpc,
      securityGroups: [loadBalancerSecurityGroup],
      subnets: vpcProvider.publicSubnetIds,
    },
    { provider },
  );

  const targetGroup = new aws.lb.TargetGroup(
    `app-lb-tg-${serviceName}`,
    {
      vpcId: vpc.vpc.id,
      targetType: 'instance',
      port: ServicePort,
      protocol: 'HTTP',
      healthCheck: {
        port: 'traffic-port',
        path: '/health',
      },
    },
    { provider },
  );

  const loadBalancerTargetGroup = loadBalancer.createTargetGroup(
    `lb-tg-${serviceName}`,
    {
      targetGroup,
    },
    { provider },
  );

  const web = loadBalancerTargetGroup.createListener(
    `app-lb-https-${serviceName}`,
    {
      external: true,
      certificateArn: config.certArn,
      protocol: 'HTTPS',
      sslPolicy: 'ELBSecurityPolicy-2016-08',
      // ensure the default is an error
      defaultAction: {
        type: 'fixed-response',
        fixedResponse: {
          statusCode: '409',
          contentType: 'text/html',
          messageBody: '<html><body>endpoint not authorized</body></html>',
        },
      },
    },
    { provider },
  );

  // dont't allow external traffic to hit the /metrics endpoint
  web.addListenerRule(
    `lb-cdntoken-metrics-rule-${serviceName}`,
    {
      priority: 1,
      actions: [
        {
          type: 'fixed-response',
          fixedResponse: {
            contentType: 'text/plain',
            messageBody: 'ALB not found',
            statusCode: '404',
          },
        },
      ],
      conditions: [
        {
          pathPattern: {
            values: [`*/${metricsEndpointPath}*`],
          },
        },
      ],
    },
    { provider },
  );

  // ensure ALB requests are only coming from cloudfront
  web.addListenerRule(
    `lb-cdntoken-rule-${serviceName}`,
    {
      priority: 2,
      actions: [
        {
          type: 'forward',
          targetGroupArn: loadBalancerTargetGroup.targetGroup.arn,
        },
      ],
      conditions: [
        {
          httpHeader: {
            httpHeaderName: CDN_PROTECTION_HEADER_NAME,
            values: [secretsStore.cloudfrontSecret],
          },
        },
      ],
    },
    { provider },
  );

  // redirect http to https
  loadBalancer.createListener(
    `lb-httpredir-${serviceName}`,
    {
      protocol: 'HTTP',
      defaultAction: {
        type: 'redirect',
        redirect: {
          protocol: 'HTTPS',
          statusCode: 'HTTP_301',
        },
      },
    },
    { provider },
  );

  const record = new route53.Record(
    `dns-alb-${serviceName}-${region}`,
    {
      zoneId: config.hostedZoneId,
      type: 'A',
      name: config.domain,
      setIdentifier: `app-record-region-${serviceName}-${region}`,
      latencyRoutingPolicies: [{ region: region }],
      aliases: [
        {
          name: web.loadBalancer.loadBalancer.dnsName,
          zoneId: web.loadBalancer.loadBalancer.zoneId,
          evaluateTargetHealth: true,
        },
      ],
    },
    { provider },
  );

  return loadBalancerTargetGroup;
}

/**
 * Create the task execution role we need to setup the tasks in our ECS service
 * needs to create logs, assume ecs-tasks service, and access static secrets for the containers
 */
function createTaskExecutionRole(
  secretsStore: StaticSecrets,
  serviceName: string,
): aws.iam.Role {
  const taskExecRole = new aws.iam.Role(`task-exec-role-${serviceName}`, {
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: '',
          Effect: 'Allow',
          Principal: {
            Service: 'ecs-tasks.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    },
    inlinePolicies: [
      {
        name: 'ecs_task_exec_logs',
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
    ],
  });

  const _taskExecRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
    `task-exec-${serviceName}-policy`,
    {
      role: taskExecRole.name,
      policyArn:
        'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
    },
  );

  const _taskExecRolePolicyAttachmentSecrets = new aws.iam.RolePolicyAttachment(
    `task-exec-${serviceName}-policy2`,
    {
      role: taskExecRole.name,
      policyArn: secretsStore.secretsPolicyArn,
    },
  );

  return taskExecRole;
}

/**
 * Create the task execution role we need to setup the tasks in our ECS service
 * needs to create logs, assume ecs-tasks service, and access static secrets for the containers
 */
function createTaskContainerRole(
  account: string,
  serviceName: string,
  enclaveKeyDescriptor: EnclaveKeyDescriptor,
  signingKeyDescriptor: HmacSigningKeyDescriptor,
  s3Buckets: s3.S3Buckets,
): pulumi.Output<aws.iam.Role> {
  const s3Policies: AWSPolicyConfig[] = [s3Buckets.documentImages.policy];

  const role = pulumi
    .all([enclaveKeyDescriptor.rootKeyArn, signingKeyDescriptor.rootKeyArn])
    .apply(([enclaveRootKeyArn, signingRootKeyArn]) => {
      return new aws.iam.Role(`task-container-role-${serviceName}`, {
        assumeRolePolicy: {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: '',
              Effect: 'Allow',
              Principal: {
                Service: 'ecs-tasks.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
              Condition: {
                StringEquals: {
                  'aws:SourceAccount': `${account}`,
                },
              },
            },
          ],
        },
        inlinePolicies: [
          {
            name: 'enclave_key_generate_encrypted_key',
            policy: JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Action: [
                    'kms:GenerateDataKeyPairWithoutPlaintext',
                    'kms:GenerateDataKeyWithoutPlaintext',
                    'kms:DescribeKey',
                  ],
                  Effect: 'Allow',
                  Resource: enclaveRootKeyArn,
                },
                {
                  Action: ['kms:GenerateMac', 'kms:VerifyMac'],
                  Effect: 'Allow',
                  Resource: signingRootKeyArn,
                },
              ],
            }),
          },
          // Add in our s3 Policies to inlinePolicies
        ].concat(s3Policies),
      });
    });

  return role;
}
