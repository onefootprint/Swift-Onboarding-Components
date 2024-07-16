import { GlobalState } from './main';
import { StackMetadata } from './stack_metadata';
import { route53 } from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { StaticSecrets } from './secrets';
import { ContainersOutput, ServiceContainers } from './containers';
import { EnclaveKeyDescriptor } from './enclave_key';
import { HmacSigningKeyDescriptor } from './hmac_key';
import * as s3 from './s3';
import { GetStackMetadata } from './stack_metadata';
import * as appCdn from './app_cdn';
import { FPC_SERVICE_PORT } from './sg';
import { Certificate } from './certs';

export type AWSPolicyConfig = {
  name: string;
  policy: string;
};

export type ECSRolesOutput = {
  executionRoleArn: pulumi.Output<string>;
  taskRoleArn: pulumi.Output<string>;
};

export async function CreateECSRoles(g: GlobalState): Promise<ECSRolesOutput> {
  const stackMetadata = GetStackMetadata();

  const execRole = pulumi
    .all([g.database.databaseUrlSecretParam.name, g.database.databaseUrlRoSecretParam.name])
    .apply(([dbUrlSecretName, dbRoUrlSecretName]) => createTaskExecutionRole(
      g.secretsStore,
      stackMetadata.shortStackName,
      dbUrlSecretName,
      dbRoUrlSecretName,
    ));

  const taskRole = createTaskContainerRole(
    (await aws.getCallerIdentity({})).accountId,
    stackMetadata.shortStackName,
    g.enclaveKeyConfig,
    g.hmacSigningKeyConfig,
    g.buckets,
  );
  return {
    executionRoleArn: execRole.arn,
    taskRoleArn: taskRole.arn,
  };
}

/**
 * Create the task execution role we need to setup the tasks in our ECS service
 * needs to create logs, assume ecs-tasks service, and access static secrets for the containers
 */
function createTaskExecutionRole(
  secretsStore: StaticSecrets,
  serviceName: string,
  dbUrlSecretName: string,
  dbRoUrlSecretName: string,
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
        name: 'ecs_firelens_logs',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['firehose:PutRecordBatch'],
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
              Resource: `arn:aws:ssm:*:*:parameter${dbUrlSecretName}`,
            },
            {
              Action: ['ssm:GetParameter', 'ssm:GetParameters'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${dbRoUrlSecretName}`,
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
  const s3Policies: AWSPolicyConfig[] = [
    s3Buckets.documentImages.policy,
    s3Buckets.assetsBucket.policy,
  ];

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
          {
            name: 'rekognition_textract_permissions',
            policy: JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Action: ['rekognition:*', 'textract:*'],
                  Effect: 'Allow',
                  Resource: '*',
                },
              ],
            }),
          },
          {
            name: 'vault_disaster_recovery_customer_account_access',
            policy: JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Action: ['sts:AssumeRole'],
                  Effect: 'Allow',
                  Resource: '*',
                  Condition: {
                    StringEquals: {
                      'sts:RoleSessionName': 'FootprintVaultDisasterRecovery',
                    },
                  },
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
