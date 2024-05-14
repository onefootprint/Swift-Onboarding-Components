import * as aws from '@pulumi/aws';
import * as datadog from '@pulumi/datadog';
import { GlobalState } from './main';
import { GetStackMetadata, StackEnvironment } from './stack_metadata';
import { Config } from './config';
import { StaticSecrets } from './secrets';

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

  const integration = new datadog.aws.Integration(
    `datadog-integration-${stackMetadata.shortStackName}`,
    {
      accountId: accountId,
      roleName: `DatadogAWSIntegrationRole-${stackMetadata.shortStackName}`,
      filterTags: [],
      hostTags: [`env:${env}`, `stack:${stackMetadata.shortStackName}`],
      metricsCollectionEnabled: 'true',
      cspmResourceCollectionEnabled: 'false',
    },
  );

  const forwarderStack = new aws.cloudformation.Stack(
    `datadog-forwarder-${stackMetadata.shortStackName}`,
    {
      templateUrl:
        'https://datadog-cloudformation-template.s3.amazonaws.com/aws/forwarder/latest.yaml',
      parameters: {
        DdApiKeySecretArn: secretsStore.datadogApiKey.arn,
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

  return {};
}
