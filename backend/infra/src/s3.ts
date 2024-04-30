import { StackMetadata } from './stack_metadata';
import * as aws from '@pulumi/aws';
import { Config } from './config';
import { AWSPolicyConfig } from './ecs_roles';

/**
 * Configure document Images bucket
 */
export async function CreateServiceBuckets(
  provider: aws.Provider,
  config: Config,
  stackMetadata: StackMetadata,
  region: string,
): Promise<ServiceS3Buckets> {
  return {
    documentImages: createDocumentImagesBucket(stackMetadata, config, provider),
    assetsBucket: createAssetsBucket(stackMetadata, config, provider),
    accessLogBucketName: await createAlbAccessLogsBucket(
      provider,
      config,
      stackMetadata,
      region,
    ),
    // More buckets would go here in the future...
  };
}

function createDocumentImagesBucket(
  stackMetadata: StackMetadata,
  config: Config,
  provider: aws.Provider,
): S3BucketConfig {
  const bucketName = `${config.s3.documentImagesBucketNamePrefix}-${stackMetadata.shortStackName}`;
  const bucket = new aws.s3.Bucket(
    bucketName,
    {
      forceDestroy: !config.db.deletionProtection,
      bucket: bucketName,
      arn: `arn:aws:s3:::${bucketName}`,
      acl: 'private',
      versioning: {
        enabled: true,
      },
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
    bucket,
    bucketName,
    policy,
  };
}

function createAssetsBucket(
  stackMetadata: StackMetadata,
  config: Config,
  provider: aws.Provider,
): S3BucketConfig {
  const bucketName = `onefootprint-assets-${stackMetadata.shortStackName}`;
  const bucket = new aws.s3.Bucket(
    bucketName,
    {
      forceDestroy: !config.db.deletionProtection, // Weird to derive this from deletionProtection
      bucket: bucketName,
      arn: `arn:aws:s3:::${bucketName}`,
      website: {
        indexDocument: 'index.html',
        errorDocument: '404.html',
      },
      corsRules: [
        {
          allowedOrigins: ['*'],
          allowedMethods: ['GET', 'HEAD'],
        },
      ],
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
          Action: [
            's3:GetObject',
            's3:ListBucket',
            's3:PutObject',
            's3:UploadPart',
            's3:CompleteMultipartUpload',
            's3:AbortMultipartUpload',
            's3:CreateMultipartUpload',
          ],
          Resource: [
            `arn:aws:s3:::${bucketName}`,
            `arn:aws:s3:::${bucketName}/*`,
          ],
        },
      ],
    }),
  };
  return {
    bucket,
    bucketName,
    policy,
  };
}
export interface S3BucketConfig {
  bucket: aws.s3.Bucket;
  bucketName: string;
  policy: AWSPolicyConfig;
}

// Since different containers may need different access to buckets based on purpose etc
// we return an object so container task definitions can decide if and how to use them
export interface ServiceS3Buckets {
  documentImages: S3BucketConfig;
  assetsBucket: S3BucketConfig;
  accessLogBucketName: string;
}

async function createAlbAccessLogsBucket(
  provider: aws.Provider,
  config: Config,
  stackMetadata: StackMetadata,
  region: string,
): Promise<string> {
  const bucketName = `1fp-alb-access-logs-${stackMetadata.shortStackName}`;
  const elbAccountArn = await (await aws.elb.getServiceAccount({ region })).arn;
  const bucket = new aws.s3.Bucket(
    bucketName,
    {
      forceDestroy: !config.db.deletionProtection, // Weird to derive this from deletionProtection
      bucket: bucketName,
      arn: `arn:aws:s3:::${bucketName}`,
      acl: 'private',
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: 'aws:kms',
          },
          bucketKeyEnabled: true,
        },
      },
      policy: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject'],
            Principal: {
              AWS: elbAccountArn,
            },
            Resource: `arn:aws:s3:::${bucketName}/*/AWSLogs/*`,
          },
        ],
      },
    },
    {
      provider,
    },
  );

  return bucketName;
}
