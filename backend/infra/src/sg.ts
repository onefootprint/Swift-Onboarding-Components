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
export async function CreateCoreSecurityGroups(
  vpc: FootprintVpc,
  provider: aws.Provider,
  stackMetadata: StackMetadata,
): Promise<CoreSecurityGroups> {

  // todo: remove this unused, due to new approach for SGs
  const _oldFpcServiceLoadBalancer = new awsx.ec2.SecurityGroup(
    `fpc-service-lb-sg-${stackMetadata.shortStackName}`,
    {
      vpc: vpc.vpc,
      //NOTE: tcp 443 0.0.0.0/0 already added.
      ingress: [],
      egress: [EGRESS_ALL],
    },
    { provider },
  );

  // SG for Load balancer fronting main ECS API service
  const fpcServiceLoadBalancer = new awsx.ec2.SecurityGroup(`fpc-service-lb-sgn-${stackMetadata.shortStackName}`, {
    description: "Main FP cloud service load balancer (all egress and cloudfront inbound)",
    ingress: [],
    egress: [],
    vpc: vpc.vpc,
  }, { provider });

  // add a rule to allow only cloudfront to talk to this LB
  const cfPrefixList = await aws.ec2.getManagedPrefixList({
    name: "com.amazonaws.global.cloudfront.origin-facing",
  }, { provider });

  const _allowCloudfront = new aws.vpc.SecurityGroupIngressRule(`fpc-lb-sg-rule-cf-${stackMetadata.shortStackName}`, {
    securityGroupId: fpcServiceLoadBalancer.id,
    fromPort: 443,
    ipProtocol: "tcp",
    toPort: 443,
    prefixListId: cfPrefixList.id,
  });
  
  const _allowAllEgress = new aws.vpc.SecurityGroupEgressRule(`fpc-lb-sg-rule-allegress-${stackMetadata.shortStackName}`, {
    securityGroupId: fpcServiceLoadBalancer.id,
    ipProtocol: "-1",    
    cidrIpv4: "0.0.0.0/0",
  });

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
