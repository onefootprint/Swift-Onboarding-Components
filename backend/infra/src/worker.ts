import { GlobalState } from './main';
import { NitroServiceOutput } from './nitro_service';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { ServiceContainers } from './containers';
import { GetStackMetadata } from './stack_metadata';
import { ECSRolesOutput } from './ecs_roles';

export async function CreateWorkerTasks(
  g: GlobalState,
  cluster: awsx.ecs.Cluster,
  roles: ECSRolesOutput,
  nitroService: NitroServiceOutput,
) {
  const stackMetadata = GetStackMetadata();
  const region = g.region;
  const vpc = g.vpc.vpc;
  const provider = g.provider;

  const tasks = await Promise.all(
    g.constants.workerTasks.map(async worker => {
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
          ['component', 'worker'],
          ['worker.name', worker.name],
        ]),
        // Datadog
        new Map([
          ['service', `worker`],
          ['worker', worker.name],
        ]),
        worker.name,
        worker.args,
        {
          // 10 minute DB statement timeout for worker.
          dbStatementTimeoutSec: 10 * 60,
        },
      );

      const taskSlug = `${stackMetadata.shortStackName}-worker-${worker.name}`;

      const taskDefinition = new aws.ecs.TaskDefinition(
        `task-${taskSlug}`,
        {
          memory: `${worker.memoryMB}`,
          cpu: `${worker.cpuUnits}`,
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
        worker,
      };
    }),
  );

  let serviceDependsOn: pulumi.Resource[] = [cluster, ...g.database.instances];
  if (g.database.db) {
    serviceDependsOn.push(g.database.db);
  }

  tasks.forEach(async ({ taskDefinition, worker }) => {
    const serviceName = `worker-${worker.name}-${stackMetadata.shortStackName}`;
    const service = new aws.ecs.Service(
      serviceName,
      {
        name: serviceName,
        cluster: cluster.cluster.arn,
        launchType: 'FARGATE',

        // Run at most one instance of the worker by stopping and restarting
        // the task completely during deploys.
        desiredCount: 1,
        deploymentMinimumHealthyPercent: 0,
        deploymentMaximumPercent: 100,

        taskDefinition: taskDefinition.arn,
        deploymentController: {
          type: 'ECS',
        },
        deploymentCircuitBreaker: {
          enable: true,
          rollback: true,
        },
        waitForSteadyState: true,
        networkConfiguration: {
          assignPublicIp: false,
          subnets: vpc.privateSubnetIds,
          securityGroups: [g.coreSecurityGroups.worker.id],
        },
      },
      {
        provider,
        dependsOn: serviceDependsOn,
      },
    );
  });
}
