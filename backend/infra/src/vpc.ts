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

export type Vpc = awsx.ec2.Vpc;

export type FootprintVpc = {
  vpc: Vpc;
  region: Region;
  provider: aws.Provider;
  cidrBlock: string;
};

const NUM_AZ = 2;
const CIDR_BLOCK = '10.0.0.0/16';

export async function CreateRegionalVPC(region: Region, config: Config): Promise<FootprintVpc> {
  const stack = pulumi.getStack();
  const provider = new aws.Provider(`vpc-provider-${region}`, {
    region,
    defaultTags: { tags: { env: stack } },
  });

  const vpc = new awsx.ec2.Vpc(
    `vpc-${stack}-${region}`,
    {
      tags: { stack: stack },
      numberOfAvailabilityZones: NUM_AZ,
      cidrBlock: CIDR_BLOCK,
    },
    { provider, protect: config.deletionProtection },
  );

  return {
    vpc,
    provider,
    region,
    cidrBlock: CIDR_BLOCK,
  };
}
