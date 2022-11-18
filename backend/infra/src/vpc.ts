import { StackEnvironment, StackMetadata } from './stack_metadata';
import { Config } from './config';
import {
  ec2,
  getAvailabilityZone,
  getAvailabilityZones,
  Region,
  route53,
} from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import * as crypto from 'crypto';

export type Vpc = awsx.ec2.Vpc;

export type FootprintVpc = {
  vpc: Vpc;
  region: Region;
  provider: aws.Provider;
  cidrBlock: string;
  publicSubnetIds: pulumi.Output<string>[];
  privateSubnetIds: pulumi.Output<string>[];
};

const NUM_AZ = 2;
const DEFAULT_CIDR_BLOCK = '10.0.0.0/16';
const DEV_CIDR_BLOCK = '10.1.0.0/16';
const PROD_CIDR_BLOCK = '10.2.0.0/16';
const STACK_CIDR_BLOCK = '10.3.0.0/16';

export async function CreateRegionalVPC(
  stackMetadata: StackMetadata,
  region: Region,
  config: Config,
): Promise<FootprintVpc> {
  const stack = pulumi.getStack();
  const provider = new aws.Provider(`vpc-provider-${region}`, {
    region,
    defaultTags: { tags: { env: stack } },
  });

  // use default dev-ephemeral VPC for ephemeral environments (this is fixed to footprint dev account)
  if (stackMetadata.environment === StackEnvironment.DevEphemeral) {
    const vpc = awsx.ec2.Vpc.fromExistingIds(
      'dev-ephemeral',
      {
        vpcId: 'vpc-0016cfc859affc477',
        publicSubnetIds: [
          'subnet-0cb884df4f18bcd1b',
          'subnet-076486592d6cc15dd',
        ],
        privateSubnetIds: [
          'subnet-00d87d9e19567a0e6',
          'subnet-0451c81e3508c50f0',
        ],
        internetGatewayId: 'igw-06ceacc83403de268',
        natGatewayIds: ['nat-0759ff9be4fc255ad', 'nat-0e8aa04bcde0b6a8f'],
      },
      { provider },
    );

    return {
      vpc,
      provider,
      region,
      cidrBlock: DEFAULT_CIDR_BLOCK,
      publicSubnetIds: await vpc.publicSubnetIds,
      privateSubnetIds: await vpc.privateSubnetIds,
    };
  }

  // otherwise create an isolated VPC
  const vpcStack = `vpc-${stack}-${region}`;
  let cidrBlock: string;
  let protect: boolean = true;

  if (stack === 'prod') {
    cidrBlock = PROD_CIDR_BLOCK;
  } else if (stack === 'dev') {
    cidrBlock = DEV_CIDR_BLOCK;
  } else {
    cidrBlock = STACK_CIDR_BLOCK;
    // don't protect unknown stack vpcs
    protect = false;
  }

  const vpc = new awsx.ec2.Vpc(
    vpcStack,
    {
      tags: { stack: stack },
      numberOfAvailabilityZones: NUM_AZ,
      cidrBlock,
    },
    { provider, protect: config.deletionProtection || protect },
  );

  return {
    vpc,
    provider,
    region,
    cidrBlock,
    publicSubnetIds: await vpc.publicSubnetIds,
    privateSubnetIds: await vpc.privateSubnetIds,
  };
}
