import { GlobalState } from './main';
import { NitroServiceOutput } from './nitro_service';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { ServiceContainers } from './containers';
import { GetStackMetadata } from './stack_metadata';
import { ECSRolesOutput } from './ecs_roles';

export async function CreateScheduledTasks(
  g: GlobalState,
  cluster: awsx.ecs.Cluster,
  roles: ECSRolesOutput,
  nitroService: NitroServiceOutput,
) {
  const stackMetadata = GetStackMetadata();
  const stack = pulumi.getStack();
  const region = g.region;
  const vpc = g.vpc.vpc;
  const provider = g.provider;
  const current = await aws.getCallerIdentity({});

  const tasks = await Promise.all(
    g.constants.cronTasks.map(async cronTask => {
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
        // Honeycomb
        new Map([
          ['component', 'cron'],
          ['cron.name', cronTask.name],
        ]),
        // Datadog
        new Map([
          ['service', `cron-${cronTask.name}`],
          ['cron', cronTask.name],
        ]),
        cronTask.name,
        cronTask.args,
        {
          // 10 minute DB statement timeout for cron tasks.
          dbStatementTimeoutSec: 10 * 60,
        },
      );

      const taskSlug = `cron-${cronTask.name}-${stackMetadata.shortStackName}`;

      const taskDefinition = new aws.ecs.TaskDefinition(
        `task-${taskSlug}`,
        {
          memory: `${cronTask.memoryMB}`,
          cpu: `${cronTask.cpuUnits}`,
          networkMode: 'awsvpc',
          requiresCompatibilities: ['FARGATE'],
          executionRoleArn: roles.executionRoleArn,
          taskRoleArn: roles.taskRoleArn,
          family: `fpc-${taskSlug}`,
          containerDefinitions: containers.definitions,
        },
        { provider, dependsOn: [cluster] },
      );

      return {
        taskDefinition,
        cronTask,
      };
    }),
  );

  // Create the schedule group and the role used by the scheduler.
  const scheduleGroup = new aws.scheduler.ScheduleGroup(
    `cron-schedule-group-${stackMetadata.shortStackName}`,
    {
      tags: { env: stack },
    },
  );

  // Replace the version number in the ARN with a wildcard so IAM updates don't
  // break task that have just been triggered.
  const taskDefinitionARNs = pulumi
    .all(tasks.map(t => t.taskDefinition.arn))
    .apply(tasks => tasks.map(arn => arn.replace(/:\d+$/, ':*')));

  const invocationRole = pulumi
    .all([taskDefinitionARNs, scheduleGroup.arn, cluster.cluster.arn])
    .apply(([taskDefinitionARNs, scheduleGroupARN, clusterARN]) => {
      return new aws.iam.Role(
        `cron-scheduler-${stackMetadata.shortStackName}`,
        {
          assumeRolePolicy: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  Service: 'scheduler.amazonaws.com',
                },
                Action: 'sts:AssumeRole',
                Condition: {
                  // https://docs.aws.amazon.com/scheduler/latest/UserGuide/cross-service-confused-deputy-prevention.html
                  StringEquals: {
                    'aws:SourceAccount': current.accountId,
                    'aws:SourceArn': scheduleGroupARN,
                  },
                },
              },
            ],
          },
          inlinePolicies: [
            {
              name: 'allow-runtask',
              policy: JSON.stringify({
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: ['ecs:RunTask'],
                    Resource: taskDefinitionARNs,
                    Condition: {
                      ArnLike: {
                        'ecs:cluster': clusterARN,
                      },
                    },
                  },
                  {
                    // Required or else RunTask calls fail (see CloudTrail)
                    // https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-use-identity-based.html
                    Effect: 'Allow',
                    Action: ['iam:PassRole'],
                    Resource: ['*'],
                    Condition: {
                      StringLike: {
                        'iam:PassedToService': 'ecs-tasks.amazonaws.com',
                      },
                    },
                  },
                ],
              }),
            },
          ],
        },
      );
    });

  tasks.forEach(async ({ taskDefinition, cronTask }) => {
    // Set up the cron trigger.
    const schedule = new aws.scheduler.Schedule(
      `cron-schedule-${cronTask.name}-${stackMetadata.shortStackName}`,
      {
        groupName: scheduleGroup.name,
        flexibleTimeWindow: {
          mode: 'OFF',
        },
        scheduleExpression: cronTask.schedule,
        target: {
          arn: cluster.cluster.arn,
          roleArn: invocationRole.arn,
          ecsParameters: {
            taskDefinitionArn: taskDefinition.arn,
            launchType: 'FARGATE',
            networkConfiguration: {
              assignPublicIp: false,
              subnets: vpc.privateSubnetIds,
              securityGroups: [g.coreSecurityGroups.cron.id],
            },
          },
        },
      },
    );
  });
}
