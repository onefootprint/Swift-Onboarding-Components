import { StackMetadata } from './stack_metadata';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { FootprintVpc, Vpc } from './vpc';
import { Config } from './config';
import { AWSPolicyConfig } from './service';
import * as crypto from 'crypto';

/**
 * Configure document Images bucket
 */
export function CreateServiceBuckets(
  provider: aws.Provider,
  config: Config,
  stackMetadata: StackMetadata,
): ServiceS3Buckets {
  return {
    documentImages: createBucket(
      config.s3.documentImagesBucketNamePrefix,
      stackMetadata,
      config,
      provider,
    ),
    // More buckets would go here in the future...
  };
}

function createBucket(
  prefix: string,
  stackMetadata: StackMetadata,
  config: Config,
  provider: aws.Provider,
): S3BucketConfig {
  const bucketName = `${prefix}-${stackMetadata.shortStackName}`;
  const bucket = new aws.s3.Bucket(
    bucketName,
    {
      forceDestroy: !config.deletionProtection,
      bucket: bucketName,
      arn: `arn:aws:s3:::${bucketName}`,
      acl: 'private',
    },
    {
      provider,
    },
  );
  const policy: AWSPolicyConfig = {
    name: `s3_access_policy_${bucketName}`,
    policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:ListBucket', 's3:PutObject'],
          Resource: [
            `arn:aws:s3:::${bucketName}`,
            `arn:aws:s3:::${bucketName}/*`,
          ],
        },
      ],
    }),
  };
  return {
    bucketName,
    policy,
  };
}

export interface S3BucketConfig {
  bucketName: string;
  policy: AWSPolicyConfig;
}

// Since different containers may need different access to buckets based on purpose etc
// we return an object so container task definitions can decide if and how to use them
export interface ServiceS3Buckets {
  documentImages: S3BucketConfig;
}
