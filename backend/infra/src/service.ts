import { GlobalState } from './main';
import { DnsConfig } from './dns';
import { NitroServiceOutput } from './nitro_service';
import { StackMetadata } from './stack_metadata';
import { route53 } from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { StaticSecrets } from './secrets';
import { ServiceContainers } from './containers';
import { EnclaveKeyDescriptor } from './enclave_key';
import { FootprintVpc } from './vpc';
import { HmacSigningKeyDescriptor } from './hmac_key';
import * as s3 from './s3';
import { GetStackMetadata } from './stack_metadata';
import * as cdn from './cdn';
import { FPC_SERVICE_PORT } from './sg';
import { Certificate } from './certs';

export type ServiceLoadBalancer = {
  lb: awsx.lb.LoadBalancer;
  targetGroup: aws.lb.TargetGroup;
  cdnDomain: string;
  lbCname: string;
  distribution: aws.cloudfront.Distribution;
};

export type ServiceConfig = {
  instanceCount: number;
  memoryMB: number;
  cpuUnits: number;
};

export type AWSPolicyConfig = {
  name: string;
  policy: string;
};

/**
 * Constants
 */

// The path at which metrics are served.
const METRICS_ENDPOINT_PATH = 'metrics';
// Our header name for securing auth between cloudfront and internal load balancers
const CDN_PROTECTION_HEADER_NAME: string = 'X-Token-From-CloudFront';

/**
 * Create our service on ECS
 */
export async function CreateApiService(
  g: GlobalState,
  serviceConfig: ServiceConfig,
  cert: Certificate,
  nitroService: NitroServiceOutput,
): Promise<ServiceLoadBalancer> {
  const region = g.region;

  const stackMetadata = GetStackMetadata();
  const vpc = g.vpc.vpc;
  const provider = g.provider;

  // Setup our load balancer and CloudFront
  const lb = await createCdnFrontedLoadBalancer(
    g,
    cert,
    METRICS_ENDPOINT_PATH,
    stackMetadata,
  );

  // init our cluster
  const cluster = new awsx.ecs.Cluster(
    `cluster-${stackMetadata.shortStackName}`,
    {
      name: `cluster-${stackMetadata.shortStackName}`,
      vpc,
      settings: [
        {
          name: 'containerInsights',
          value: 'enabled',
        },
      ],
    },
    { provider },
  );

  // declare the containers we want to run
  const containerDefinitions = await ServiceContainers.apiMain(
    FPC_SERVICE_PORT,
    g.constants,
    g.secretsStore,
    g.enclaveKeyConfig,
    g.hmacSigningKeyConfig,
    region,
    cluster,
    g.database,
    g.buckets,
    METRICS_ENDPOINT_PATH,
    nitroService,
  );

  // setup the task
  const current = await aws.getCallerIdentity({});

  const execRole = createTaskExecutionRole(
    g.secretsStore,
    stackMetadata.shortStackName,
    g.database.databaseUrlSecretName,
  );

  const taskRoleRole = createTaskContainerRole(
    (await aws.getCallerIdentity({})).accountId,
    stackMetadata.shortStackName,
    g.enclaveKeyConfig,
    g.hmacSigningKeyConfig,
    g.buckets,
  );

  const taskDefinition = new aws.ecs.TaskDefinition(
    `task-${stackMetadata.shortStackName}`,
    {
      memory: `${serviceConfig.memoryMB}`,
      cpu: `${serviceConfig.cpuUnits}`,
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      executionRoleArn: execRole.arn,
      taskRoleArn: taskRoleRole.arn,
      family: `fpc-task-family`,
      containerDefinitions,
    },
    { provider, dependsOn: [cluster] },
  );

  // build the fargate service
  const service = new aws.ecs.Service(
    `svc-${stackMetadata.shortStackName}`,
    {
      cluster: cluster.cluster.arn,
      launchType: 'FARGATE',
      desiredCount: serviceConfig.instanceCount,
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
      networkConfiguration: {
        assignPublicIp: false,
        subnets: vpc.privateSubnetIds,
        securityGroups: [g.coreSecurityGroups.fpcService.id],
      },
      loadBalancers: [
        {
          containerName: 'fpc',
          containerPort: FPC_SERVICE_PORT,
          targetGroupArn: lb.targetGroup.arn,
        },
      ],
    },
    {
      provider,
      dependsOn: [
        lb.targetGroup,
        lb.lb,
        g.database.db,
        ...g.database.instances,
      ],
    },
  );

  return lb;
}

/**
 * Create our application load balancer which will front the cluster
 * front the ALB with cloudfront and setup TLS on the domain
 */
async function createCdnFrontedLoadBalancer(
  g: GlobalState,
  cert: Certificate,
  metricsEndpointPath: string,
  stackMetadata: StackMetadata,
): Promise<ServiceLoadBalancer> {
  const region = g.region;
  const vpc = g.vpc.vpc;
  const provider = g.provider;
  const serviceName = stackMetadata.shortStackName;

  // init our ALB
  const loadBalancer = new awsx.lb.ApplicationLoadBalancer(
    `fpc-lb-${serviceName}`,
    {
      vpc,
      external: true,
      securityGroups: [g.coreSecurityGroups.fpcServiceLoadBalancer],
      subnets: vpc.publicSubnetIds,
      accessLogs: {
        bucket: await createAlbAccessLogsBucket(g, stackMetadata),
        enabled: true,
        prefix: 'fpc-svc',
      },
    },
    { provider },
  );

  const targetGroup = new aws.lb.TargetGroup(
    `fpc-tg-${serviceName}`,
    {
      vpcId: vpc.vpc.id,
      targetType: 'ip',
      port: FPC_SERVICE_PORT,
      protocol: 'HTTP',
      healthCheck: {
        port: 'traffic-port',
        path: '/health',
      },
    },
    { provider },
  );

  const web = loadBalancer.createListener(
    `fpc-https-${serviceName}`,
    {
      external: true,
      certificateArn: cert.arn,
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
    `fpc-lb-metrics-rule-${serviceName}`,
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
    `fpc-lb-cdntoken-rule-${serviceName}`,
    {
      priority: 2,
      actions: [
        {
          type: 'forward',
          targetGroupArn: targetGroup.arn,
        },
      ],
      conditions: [
        {
          httpHeader: {
            httpHeaderName: CDN_PROTECTION_HEADER_NAME,
            values: [g.secretsStore.cloudfrontSecret],
          },
        },
      ],
    },
    { provider },
  );

  // redirect http to https
  loadBalancer.createListener(
    `fpc-lb-httpredir-${serviceName}`,
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

  const albDomainName = `internal.${g.dnsConfig.apiDomain}`;
  const record = new route53.Record(
    `dns-alb-${serviceName}-${region}`,
    {
      zoneId: g.dnsConfig.hostedZone.id,
      type: 'A',
      name: albDomainName,
      setIdentifier: `app-record-setid-${serviceName}-${region}`,
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

  const distribution = await cdn.CreateCloudfrontDistribution({
    cert,
    cdnToAlbSecret: g.secretsStore.cloudfrontSecret,
    cdnToAlbSecretHeaderName: CDN_PROTECTION_HEADER_NAME,
    domain: g.dnsConfig.apiDomain,
    origin: albDomainName,
    hostedZoneId: g.dnsConfig.hostedZone.id,
  });

  return {
    lb: loadBalancer,
    targetGroup: targetGroup,
    cdnDomain: g.dnsConfig.apiDomain,
    lbCname: albDomainName,
    distribution,
  };
}

/**
 * Create the task execution role we need to setup the tasks in our ECS service
 * needs to create logs, assume ecs-tasks service, and access static secrets for the containers
 */
function createTaskExecutionRole(
  secretsStore: StaticSecrets,
  serviceName: string,
  dbSecretName: string,
): aws.iam.Role {
  const taskExecRole = new aws.iam.Role(`fpc-task-exec-role-${serviceName}`, {
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
      {
        name: 'allow_db_connection_secret',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['ssm:GetParameter', 'ssm:GetParameters'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${dbSecretName}`,
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
 * Create the task container role we need to run the tasks in our ECS service
 */
function createTaskContainerRole(
  account: string,
  serviceName: string,
  enclaveKeyDescriptor: EnclaveKeyDescriptor,
  signingKeyDescriptor: HmacSigningKeyDescriptor,
  s3Buckets: s3.ServiceS3Buckets,
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

async function createAlbAccessLogsBucket(
  g: GlobalState,
  stackMetadata: StackMetadata,
): Promise<string> {
  const provider = g.provider;
  const bucketName = `alb-access-logs-${stackMetadata.shortStackName}`;
  const elbAccountArn = await (
    await aws.elb.getServiceAccount({ region: g.region })
  ).arn;
  const bucket = new aws.s3.Bucket(
    bucketName,
    {
      forceDestroy: !g.constants.deletionProtection,
      bucket: bucketName,
      arn: `arn:aws:s3:::${bucketName}`,
      acl: 'private',
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: 'aws:kms',
          },
          bucketKeyEnabled: true,
        },
      },
      policy: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject'],
            Principal: {
              AWS: elbAccountArn,
            },
            Resource: `arn:aws:s3:::${bucketName}/*/AWSLogs/*`,
          },
        ],
      },
    },
    {
      provider,
    },
  );

  return bucketName;
}
