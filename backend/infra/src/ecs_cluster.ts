import { GlobalState } from './main';
import * as awsx from '@pulumi/awsx';
import { GetStackMetadata } from './stack_metadata';

export function CreateECSCluster(g: GlobalState): awsx.ecs.Cluster {
  const stackMetadata = GetStackMetadata();
  const vpc = g.vpc.vpc;
  const provider = g.provider;

  const clusterName = `cluster-${stackMetadata.shortStackName}`;
  return new awsx.ecs.Cluster(
    clusterName,
    {
      name: clusterName,
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
}
