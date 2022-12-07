import { DnsConfig } from './dns';
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
  cidrBlock: string;
  publicSubnetIds: pulumi.Output<string>[];
  privateSubnetIds: pulumi.Output<string>[];
};

export type RegionVpcOutput = {
  region: Region;
  provider: aws.Provider;
  vpc: FootprintVpc;
};

const NUM_AZ = 2;
const DEFAULT_CIDR_BLOCK = '10.0.0.0/16';
const DEV_CIDR_BLOCK = '10.1.0.0/16';
const PROD_CIDR_BLOCK = '10.2.0.0/16';
const DEV_EPHEMERAL_NAT_IDS = [
  'nat-0759ff9be4fc255ad',
  'nat-0e8aa04bcde0b6a8f',
];

export async function CreateRegionalVPC(
  stackMetadata: StackMetadata,
  region: Region,
  config: Config,
  dnsConfig: DnsConfig,
): Promise<RegionVpcOutput> {
  const stack = pulumi.getStack();
  const provider = new aws.Provider(`vpc-provider-${region}`, {
    region,
    defaultTags: { tags: { env: stack } },
  });

  let vpc: awsx.ec2.Vpc;
  let cidrBlock: string;
  let natGateways: aws.ec2.NatGateway[] = [];

  // use default dev-ephemeral VPC for ephemeral environments (this is fixed to footprint dev account)
  if (stackMetadata.environment === StackEnvironment.DevEphemeral) {
    cidrBlock = DEFAULT_CIDR_BLOCK;
    natGateways = DEV_EPHEMERAL_NAT_IDS.map(ngId => {
      return aws.ec2.NatGateway.get(`ng-${ngId}`, ngId);
    });

    vpc = awsx.ec2.Vpc.fromExistingIds(
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
        natGatewayIds: DEV_EPHEMERAL_NAT_IDS,
      },
      { provider },
    );
  } else {
    // otherwise create an isolated VPC
    const vpcStack = `vpc-${stack}-${region}`;

    switch (stackMetadata.environment) {
      case StackEnvironment.Dev: {
        cidrBlock = DEV_CIDR_BLOCK;

        // include our dev-ephemeral egress records on dev
        natGateways = DEV_EPHEMERAL_NAT_IDS.map(ngId => {
          return aws.ec2.NatGateway.get(`ng-${ngId}`, ngId);
        });
        break;
      }
      case StackEnvironment.Prod: {
        cidrBlock = PROD_CIDR_BLOCK;
        break;
      }
    }

    vpc = new awsx.ec2.Vpc(
      vpcStack,
      {
        tags: { stack: stack },
        numberOfAvailabilityZones: NUM_AZ,
        cidrBlock,
      },
      { provider, protect: true },
    );

    natGateways.push(
      ...(await vpc.natGateways).map(ng => {
        return ng.natGateway;
      }),
    );
  }

  await createEgressDnsRecord(natGateways, dnsConfig, provider);

  return {
    vpc: {
      vpc,
      cidrBlock,
      publicSubnetIds: await vpc.publicSubnetIds,
      privateSubnetIds: await vpc.privateSubnetIds,
      region,
    },
    provider,
    region,
  };
}

/**
 * Set the egress records to identify our IP address block
 */
async function createEgressDnsRecord(
  natGateways: aws.ec2.NatGateway[],
  dnsConfig: DnsConfig,
  provider: aws.Provider,
) {
  let ips = natGateways.map(ng => {
    return ng.publicIp;
  });

  const record = new route53.Record(
    `dns-egress`,
    {
      zoneId: dnsConfig.hostedZone.id,
      type: 'A',
      name: `egress.${dnsConfig.apiDomain}`,
      records: ips,
      ttl: 60,
    },
    { provider },
  );
}
