import { FootprintVpc } from './vpc';
import { StackMetadata } from './stack_metadata';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';

/**
 * Gives access to egress to the whole internet
 */
export const EGRESS_ALL: awsx.ec2.EgressSecurityGroupRuleArgs = {
  protocol: '-1',
  fromPort: 0,
  toPort: 0,
  cidrBlocks: ['0.0.0.0/0'],
};

export type CoreSecurityGroups = {
  fpcServiceLoadBalancer: awsx.ec2.SecurityGroup;
  fpcService: awsx.ec2.SecurityGroup;
  cron: awsx.ec2.SecurityGroup;
  worker: awsx.ec2.SecurityGroup;
  jumpbox: awsx.ec2.SecurityGroup;
  jumpboxReadOnly: awsx.ec2.SecurityGroup;
  airplane: awsx.ec2.SecurityGroup;
};

// The service port for our main `api` container
export const FPC_SERVICE_PORT: number = 8000;

/**
 *  Create the core security groups referenced throughout the infrastructure
 */
export function CreateCoreSecurityGroups(
  vpc: FootprintVpc,
  provider: aws.Provider,
  stackMetadata: StackMetadata,
): CoreSecurityGroups {
  const fpcServiceLoadBalancer = new awsx.ec2.SecurityGroup(
    `fpc-service-lb-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      //NOTE: tcp 443 0.0.0.0/0 already added.
      ingress: [],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  const fpcService = new awsx.ec2.SecurityGroup(
    `fpc-service-api-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      ingress: [
        {
          protocol: 'tcp',
          fromPort: FPC_SERVICE_PORT,
          toPort: FPC_SERVICE_PORT,
          sourceSecurityGroupId: fpcServiceLoadBalancer.id,
          description:
            'enables the load balancer communicate to the fargate api service',
        },
      ],

      egress: [EGRESS_ALL],
    },
    { provider },
  );

  const cron = new awsx.ec2.SecurityGroup(
    `fpc-service-cron-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      ingress: [],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  const worker = new awsx.ec2.SecurityGroup(
    `fpc-service-worker-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      ingress: [],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  const jumpbox = new awsx.ec2.SecurityGroup(
    `db-jumpbox-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      ingress: [],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  const jumpboxReadOnly = new awsx.ec2.SecurityGroup(
    `db-jumpbox-readonly-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      ingress: [
        {
          protocol: 'tcp',
          fromPort: 22,
          toPort: 22,
          cidrBlocks: [
            // retool
            '35.90.103.132/30',
            '44.208.168.68/30',
            // metabase
            '18.207.81.126/32',
            '3.211.20.157/32',
            '50.17.234.169/32',
          ],
          description: 'Inbound connections to the JBRO',
        },
      ],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  const airplane = new awsx.ec2.SecurityGroup(
    `airplane-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      ingress: [],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  return {
    fpcServiceLoadBalancer,
    fpcService,
    cron,
    worker,
    jumpbox,
    jumpboxReadOnly,
    airplane,
  };
}
