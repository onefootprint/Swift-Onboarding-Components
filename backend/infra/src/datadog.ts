import * as aws from '@pulumi/aws';
import * as datadog from '@pulumi/datadog';
import * as pulumi from '@pulumi/pulumi';
import { GetStackMetadata, StackEnvironment } from './stack_metadata';
import { StaticSecrets } from './secrets';
import * as fs from 'fs';
import * as path from 'path';

export async function CreateDatadogIntegration(secretsStore: StaticSecrets) {
  const stackMetadata = GetStackMetadata();
  const accountId = (await aws.getCallerIdentity({})).accountId;

  let env = '';
  switch (stackMetadata.environment) {
    case StackEnvironment.Prod:
      env = 'prod';
      break;
    case StackEnvironment.Dev:
      env = 'dev';
      break;
    case StackEnvironment.DevEphemeral:
      env = 'dev-ephemeral';
      break;
  }

  let ddIntegrationRoleName = `datadog-integration-role-${stackMetadata.shortStackName}`;

  const integration = new datadog.aws.Integration(
    `datadog-integration-${stackMetadata.shortStackName}`,
    {
      accountId: accountId,
      roleName: ddIntegrationRoleName,
      filterTags: [],
      hostTags: [`env:${env}`],
      metricsCollectionEnabled: 'true',
      cspmResourceCollectionEnabled: 'false',
      extendedResourceCollectionEnabled: 'true',
    },
  );

  const ddForwarderStackTemplateBody = fs.readFileSync(
    path.resolve(__dirname, 'data/datadog-forwarder-stack.yaml'),
    'utf8',
  );

  pulumi
    .all([integration.externalId, secretsStore.datadogApiKey.arn])
    .apply(([ddIamExternalId, ddApiKeyArn]) => {
      let ddIntegrationRole = new aws.iam.Role(ddIntegrationRoleName, {
        name: ddIntegrationRoleName,
        assumeRolePolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'sts:AssumeRole',
              Effect: 'Allow',
              Condition: {
                StringEquals: {
                  'sts:ExternalId': ddIamExternalId,
                },
              },
              Principal: {
                // Datadog's account ID
                AWS: 'arn:aws:iam::464622532012:root',
              },
            },
          ],
        }),
        managedPolicyArns: ['arn:aws:iam::aws:policy/SecurityAudit'],
      });

      let ddIntegrationPolicy = new aws.iam.RolePolicy(
        `datadog-integration-policy-${stackMetadata.shortStackName}`,
        {
          role: ddIntegrationRole.name,
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: {
              Effect: 'Allow',
              Resource: '*',
              Action: [
                'apigateway:GET',
                'autoscaling:Describe*',
                'backup:List*',
                'budgets:ViewBudget',
                'cloudfront:GetDistributionConfig',
                'cloudfront:ListDistributions',
                'cloudtrail:DescribeTrails',
                'cloudtrail:GetTrailStatus',
                'cloudtrail:LookupEvents',
                'cloudwatch:Describe*',
                'cloudwatch:Get*',
                'cloudwatch:List*',
                'codedeploy:List*',
                'codedeploy:BatchGet*',
                'directconnect:Describe*',
                'dynamodb:List*',
                'dynamodb:Describe*',
                'ec2:Describe*',
                'ec2:GetTransitGatewayPrefixListReferences',
                'ec2:SearchTransitGatewayRoutes',
                'ecs:Describe*',
                'ecs:List*',
                'elasticache:Describe*',
                'elasticache:List*',
                'elasticfilesystem:DescribeFileSystems',
                'elasticfilesystem:DescribeTags',
                'elasticfilesystem:DescribeAccessPoints',
                'elasticloadbalancing:Describe*',
                'elasticmapreduce:List*',
                'elasticmapreduce:Describe*',
                'es:ListTags',
                'es:ListDomainNames',
                'es:DescribeElasticsearchDomains',
                'events:CreateEventBus',
                'fsx:DescribeFileSystems',
                'fsx:ListTagsForResource',
                'health:DescribeEvents',
                'health:DescribeEventDetails',
                'health:DescribeAffectedEntities',
                'kinesis:List*',
                'kinesis:Describe*',
                'lambda:GetPolicy',
                'lambda:List*',
                'logs:DeleteSubscriptionFilter',
                'logs:DescribeLogGroups',
                'logs:DescribeLogStreams',
                'logs:DescribeSubscriptionFilters',
                'logs:FilterLogEvents',
                'logs:PutSubscriptionFilter',
                'logs:TestMetricFilter',
                'organizations:Describe*',
                'organizations:List*',
                'rds:Describe*',
                'rds:List*',
                'redshift:DescribeClusters',
                'redshift:DescribeLoggingStatus',
                'route53:List*',
                's3:GetBucketLogging',
                's3:GetBucketLocation',
                's3:GetBucketNotification',
                's3:GetBucketTagging',
                's3:ListAllMyBuckets',
                's3:PutBucketNotification',
                'ses:Get*',
                'sns:List*',
                // Not used.
                // 'sns:Publish',
                'sqs:ListQueues',
                'states:ListStateMachines',
                'states:DescribeStateMachine',
                'support:DescribeTrustedAdvisor*',
                'support:RefreshTrustedAdvisorCheck',
                'tag:GetResources',
                'tag:GetTagKeys',
                'tag:GetTagValues',
                'xray:BatchGetTraces',
                'xray:GetTraceSummaries',
                'elasticloadbalancing:DescribeLoadBalancers',
                'elasticloadbalancing:DescribeLoadBalancerAttributes',
                'wafv2:ListLoggingConfigurations',
              ],
            },
          }),
        },
      );

      // This stack forwards CloudWatch and S3 logs to Datadog.
      const forwarderStack = new aws.cloudformation.Stack(
        `datadog-forwarder-${stackMetadata.shortStackName}`,
        {
          templateBody: ddForwarderStackTemplateBody,
          parameters: {
            DdApiKeySecretArn: ddApiKeyArn,
            DdSite: 'datadoghq.com',
            FunctionName: `datadog-forwarder-${stackMetadata.shortStackName}`,
          },
          capabilities: [
            'CAPABILITY_IAM',
            'CAPABILITY_NAMED_IAM',
            'CAPABILITY_AUTO_EXPAND',
          ],
        },
      );

      // Register the Lambda from the forwarder stack with the integration.
      const forwarderLambdaArn = new datadog.aws.IntegrationLambdaArn(
        `datadog-lambda-arn-${stackMetadata.shortStackName}`,
        {
          accountId: accountId,
          lambdaArn: forwarderStack.outputs['DatadogForwarderArn'],
        },
      );

      const logCollection = new datadog.aws.IntegrationLogCollection(
        `datadog-log-collection-${stackMetadata.shortStackName}`,
        {
          accountId: accountId,
          services: [
            'elbv2', // ALB
            'cloudfront',
          ],
        },
      );
    });

  return {};
}
