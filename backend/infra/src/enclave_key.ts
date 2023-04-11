import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { Region } from '@pulumi/aws';
import { Config } from './config';
import * as kms from '@aws-sdk/client-kms';
import { SealedIkek } from './sealed_ikek';

export interface EnclaveKeyDescriptor {
  rootKeyId: pulumi.Output<string>;
  rootKeyArn: pulumi.Output<string>;
  sealedEncIkek: SealedIkek;
  sealedHmacIkek: SealedIkek;
  enclaveKmsCredentials: EnclaveKmsCredentials;
}

export interface EnclaveKmsCredentials {
  access_key_id: pulumi.Output<string>;
  access_secret_key: pulumi.Output<string>;
}

export async function Initialize(
  config: Config,
  replicaRegions: Region[],
): Promise<EnclaveKeyDescriptor> {
  const current = await aws.getCallerIdentity({});
  // TODO: change parent to be role
  const enclaveUser = new aws.iam.User(`enclave`);

  const keyPolicy = pulumi.all([enclaveUser.arn]).apply(([enclaveArn]) => {
    const kp = JSON.stringify({
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
        {
          Effect: 'Allow',
          Principal: {
            AWS: enclaveArn,
          },
          Action: 'kms:Decrypt',
          Resource: '*',
          Condition: {
            StringEqualsIgnoreCase: {
              'kms:RecipientAttestation:PCR8': config.enclaveCertPCR8,
            },
          },
        },
      ],
    });
    return kp;
  });

  const rootKey = new aws.kms.Key(`enclave_master_root_key`, {
    multiRegion: true,
    customerMasterKeySpec: 'SYMMETRIC_DEFAULT',
    keyUsage: 'ENCRYPT_DECRYPT',
    policy: keyPolicy,
    description: `enclave master root key for ${pulumi.getStack()}-default-region`,
  });

  // Generate our sealed enclave ikeks

  // For encryption
  const sealedEncIkek = new SealedIkek(
    `enclave_master_root_key_sealed_ikek`,
    { rootKeyId: rootKey.keyId },
    { parent: rootKey },
  );

  // For HMAC signing
  const sealedHmacIkek = new SealedIkek(
    `enclave_master_root_key_sealed_ikek_hmac`,
    { rootKeyId: rootKey.keyId },
    { parent: rootKey },
  );

  const replicas = replicaRegions.map(region => {
    const provider = new aws.Provider(`kms-provider-${region}`, { region });
    return new aws.kms.ReplicaKey(
      `enclave_root_key_replica-${region}`,
      {
        description: `enclave master root key (replica) for ${pulumi.getStack()}-${region}`,
        policy: JSON.stringify(keyPolicy),
        primaryKeyArn: rootKey.arn,
      },
      { provider },
    );
  });

  const enclaveUserKey = new aws.iam.AccessKey(`enclave_user_access_key`, {
    user: enclaveUser.name,
  });

  return {
    rootKeyId: rootKey.id,
    rootKeyArn: rootKey.arn,
    sealedEncIkek,
    sealedHmacIkek,
    enclaveKmsCredentials: {
      access_key_id: enclaveUserKey.id,
      access_secret_key: pulumi.secret(enclaveUserKey.secret),
    },
  };
}
