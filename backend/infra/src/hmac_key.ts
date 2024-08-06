import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { Region } from '@pulumi/aws';
import { Config } from './config';
import * as aws_native from '@pulumi/aws-native';

export interface HmacSigningKeyDescriptor {
  rootKeyId: pulumi.Output<string>;
  rootKeyArn: pulumi.Output<string>;
}

export async function Initialize(
  config: Config,
  replicaRegions: Region[],
): Promise<HmacSigningKeyDescriptor> {
  const current = await aws.getCallerIdentity({});

  const keyPolicy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'Enable IAM User Permissions',
        Effect: 'Allow',
        Principal: {
          AWS: `arn:aws:iam::${current.accountId}:root`,
        },
        Action: 'kms:*',
        Resource: '*',
      },
    ],
  });

  const rootKey = new aws_native.kms.Key(`hmac_signing_master_root_key`, {
    multiRegion: true,
    keySpec: 'HMAC_512',
    keyUsage: 'GENERATE_VERIFY_MAC',
    keyPolicy: keyPolicy,
    description: `HMAC signing key for ${pulumi.getStack()}-default-region`,
  });

  const replicas = replicaRegions.map(region => {    
    const provider = new aws_native.Provider(`kms-hmac-provider-${region}`, {
      region: region as aws_native.Region,
    });
    return new aws_native.kms.ReplicaKey(
      `hmac_signing_root_key_replica-${region}`,
      {
        keyPolicy: JSON.stringify(keyPolicy),
        primaryKeyArn: rootKey.arn,
        description: `HMAC signing key (replica) for ${pulumi.getStack()}-${region}`,
      },
      { provider },
    );
  });

  return {
    rootKeyId: rootKey.id,
    rootKeyArn: rootKey.arn,
  };
}
