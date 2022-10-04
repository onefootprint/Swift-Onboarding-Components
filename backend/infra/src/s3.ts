import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { FootprintVpc, Vpc } from './vpc';
import { Config, S3ConfigValue } from './config';
import { AWSPolicyConfig } from './service';

export function CreateBuckets(
  vpcProvider: FootprintVpc,
  config: Config,
): S3Buckets {
  const provider = vpcProvider.provider;
  //////////////////////////////
  // Configure document Images bucket
  //
  // If adding more bucket creation, copy and update the below code!
  //////////////////////////////
  const bucketName = `${
    config.s3.documentImagesBucket.prefix
  }-${pulumi.getStack()}`;
  const bucket = new aws.s3.Bucket(
    bucketName,
    {
      // TODO: there may be more configurations here we want
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
        // https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html
        // https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
        // https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html
        // you need ListAllMyBuckets to ListBucket
        {
          Effect: 'Allow',

          Action: ['s3:ListAllMyBuckets'],
          // Since this needs to list all s3 resources, it's in another statement
          Resource: [`arn:aws:s3:::*`],
        },
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
  const documentImagesConfig = {
    bucketName,
    policy,
    envVarName: config.s3.documentImagesBucket.envVarName,
  };

  // Return our buckets
  return {
    documentImages: documentImagesConfig,
    // More buckets would go here
  };
}

export interface S3BucketConfig {
  bucketName: string;
  policy: AWSPolicyConfig;
  envVarName: string;
}

// Since different containers may need different access to buckets based on purpose etc
// we return an object so container task definitions can decide if and how to use them
export interface S3Buckets {
  documentImages: S3BucketConfig;
}
