import { GlobalState } from './main';
import { StackMetadata } from './stack_metadata';
import { route53 } from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { StaticSecrets } from './secrets';
import { ContainersOutput, ServiceContainers } from './containers';
import { ECSRolesOutput } from './ecs_roles';
import { EnclaveKeyDescriptor } from './enclave_key';
import { HmacSigningKeyDescriptor } from './hmac_key';
import * as s3 from './s3';
import { GetStackMetadata } from './stack_metadata';
import * as appCdn from './app_cdn';
import { FPC_SERVICE_PORT } from './sg';
import { Certificate } from './certs';
import { NitroServiceOutput } from './nitro_service';

export type ServiceLoadBalancer = {
  lb: awsx.lb.LoadBalancer;
  targetGroup: aws.lb.TargetGroup;
  cdnDomain: string;
  lbCname: string;
  distribution: aws.cloudfront.Distribution;
};

export type ServiceConfig = {
  memoryMB: number;
  cpuUnits: number;
  minTasks: number;
  maxTasks: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
};

/**
 * Constants
 */

// Our header name for securing auth between cloudfront and internal load balancers
const CDN_PROTECTION_HEADER_NAME: string = 'X-Token-From-CloudFront';

/**
 * Create our service on ECS
 */
export async function CreateApiService(
  g: GlobalState,
  serviceConfig: ServiceConfig,
  cert: Certificate,
  cluster: awsx.ecs.Cluster,
  roles: ECSRolesOutput,
  nitroService: NitroServiceOutput,
): Promise<ServiceLoadBalancer> {
  const stackMetadata = GetStackMetadata();
  const region = g.region;
  const vpc = g.vpc.vpc;
  const provider = g.provider;

  const containers = await ServiceContainers.monolithMain(
    g.constants,
    g.secretsStore,
    g.enclaveKeyConfig,
    g.hmacSigningKeyConfig,
    region,
    g.database,
    g.buckets,
    g.assetCdn,
    nitroService,
    // OTEL attributes
    new Map([['component', 'api']]),
    // Datadog agent tags (note that these don't seem to apply to traces).
    new Map([['service', `fpc-api`]]),
    '',
    ['api-server'],
    {
      // With a 60s API server & LB timeout, DB queries should
      // certainly never take more than 60s.
      dbStatementTimeoutSec: 60,
    },
    g.dnsConfig,
  );

  // Setup our load balancer and CloudFront
  const lb = await createCdnFrontedLoadBalancer(
    g,
    cert,
    containers.metricsEndpointPath,
    stackMetadata,
  );

  // setup the task
  const taskDefinition = new aws.ecs.TaskDefinition(
    `task-${stackMetadata.shortStackName}`,
    {
      memory: `${serviceConfig.memoryMB}`,
      cpu: `${serviceConfig.cpuUnits}`,
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      executionRoleArn: roles.executionRoleArn,
      taskRoleArn: roles.taskRoleArn,
      family: `fpc-${stackMetadata.shortStackName}`,
      containerDefinitions: containers.definitions,
    },
    { provider, dependsOn: [cluster] },
  );

  // build the fargate service
  let serviceDependsOn: pulumi.Resource[] = [
    lb.targetGroup,
    lb.lb,
    cluster,
    ...g.database.instances,
  ];
  if (g.database.db) {
    serviceDependsOn.push(g.database.db);
  }

  const serviceName = `svc-${stackMetadata.shortStackName}`;
  const service = new aws.ecs.Service(
    serviceName,
    {
      name: serviceName,
      cluster: cluster.cluster.arn,
      launchType: 'FARGATE',
      desiredCount: serviceConfig.minTasks,
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
      dependsOn: serviceDependsOn,
    },
  );

  const resourceId = cluster.cluster.name.apply(
    name => `service/${name}/${serviceName}`,
  );
  const ecsTarget = new aws.appautoscaling.Target(
    `ecs-scaling-target-${stackMetadata.shortStackName}`,
    {
      maxCapacity: serviceConfig.maxTasks,
      minCapacity: serviceConfig.minTasks,
      resourceId,
      scalableDimension: 'ecs:service:DesiredCount',
      serviceNamespace: 'ecs',
    },
    { dependsOn: [cluster, service] },
  );
  const cpuScalingPolicy = new aws.appautoscaling.Policy(
    `ecs-cpu-scaling-policy-${stackMetadata.shortStackName}`,
    {
      policyType: 'TargetTrackingScaling',
      resourceId: ecsTarget.resourceId,
      scalableDimension: ecsTarget.scalableDimension,
      serviceNamespace: ecsTarget.serviceNamespace,
      targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
          predefinedMetricType: 'ECSServiceAverageCPUUtilization',
        },
        targetValue: serviceConfig.targetCpuUtilization,
        disableScaleIn: false,
      },
    },
  );
  const ramScalingPolicy = new aws.appautoscaling.Policy(
    `ecs-ram-scaling-policy-${stackMetadata.shortStackName}`,
    {
      policyType: 'TargetTrackingScaling',
      resourceId: ecsTarget.resourceId,
      scalableDimension: ecsTarget.scalableDimension,
      serviceNamespace: ecsTarget.serviceNamespace,
      targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
          predefinedMetricType: 'ECSServiceAverageMemoryUtilization',
        },
        targetValue: serviceConfig.targetMemoryUtilization,
        disableScaleIn: false,
      },
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
      securityGroups: [g.coreSecurityGroups.fpcServiceLoadBalancer.id],
      subnets: vpc.publicSubnetIds,
      // Be careful changing this - we have to make sure it is not any higher than the application's
      // keep-alive timeout
      // https://linear.app/footprint/issue/FP-3633/diagnose-502s
      // And, for now, we're going to set this to be 1s less than Cloudfront's originReadTimeout
      // so we always see a timeout from the ALB instead of from Cloudfront.
      // Eventually, we'll have the server kill its work and return a nicer error than the ALBs
      idleTimeout: 59,
      accessLogs: {
        bucket: g.buckets.accessLogBucketName,
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
        interval: 30,
        healthyThreshold: 2,
        timeout: 10,
        unhealthyThreshold: 5,
      },
      deregistrationDelay: 30,
    },
    { provider },
  );

  const web = loadBalancer.createListener(
    `fpc-https-${serviceName}`,
    {
      external: false,
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

  // dont't allow external traffic to hit the disallowed endpoints
  // TODO: consider listening on a dedicated port instead of blocking access at the ALB.
  web.addListenerRule(
    `fpc-lb-metrics-rules-${serviceName}`,
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
            values: [`/${metricsEndpointPath}`],
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
      external: false,
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

  // create WAF for load balancer
  const waf = new aws.wafv2.WebAcl(`fpc-lb-waf-${serviceName}`, {
    name: `FPCWAF-lb-${serviceName}`,
    visibilityConfig: {
      metricName: 'fpcLbWAF',
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    },
    defaultAction: {
      allow: {
        customRequestHandling: {
          insertHeaders: [{ name: 'lb-waf-action', value: 'allow' }],
        },
      },
    },
    scope: 'REGIONAL',
    rules: [
      awsManagedRule('AWSManagedRulesAmazonIpReputationList', 0, true),
      awsManagedRule('AWSManagedRulesCommonRuleSet', 1, false),
      awsManagedRule('AWSManagedRulesKnownBadInputsRuleSet', 2, true),
    ],
  });

  const _wafAssociation = new aws.wafv2.WebAclAssociation(`fpc-lb-waf-assoc-${serviceName}`, {
    resourceArn: loadBalancer.loadBalancer.arn,
    webAclArn: waf.arn,
  });

  // create DNS
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

  const distribution = appCdn.CreateAppCloudfrontDistribution({
    cert,
    cdnToAlbSecret: g.secretsStore.cloudfrontSecret,
    cdnToAlbSecretHeaderName: CDN_PROTECTION_HEADER_NAME,
    domain: g.dnsConfig.apiDomain,
    origin: albDomainName,
    hostedZoneId: g.dnsConfig.hostedZone.id,
    stack: g.stackMetadata,
  });

  return {
    lb: loadBalancer,
    targetGroup: targetGroup,
    cdnDomain: g.dnsConfig.apiDomain,
    lbCname: albDomainName,
    distribution,
  };
}

function awsManagedRule(name: string, priority: number, sample: boolean) {
  return {
    name: name,
    priority: priority,
    overrideAction: {
      count: {},
    },
    statement: {
      managedRuleGroupStatement: {
        name: name,
        vendorName: 'AWS',
      },
    },
    visibilityConfig: {
      metricName: name,
      cloudwatchMetricsEnabled: true,
      sampledRequestsEnabled: sample,
    },
  };
}
