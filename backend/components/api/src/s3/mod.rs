use aws_sdk_s3::model::{Delete, ObjectIdentifier};
use aws_sdk_s3::types::ByteStream;
use thiserror::Error;

#[allow(unused)]
const S3_PATH_PREFIX: &str = "s3://";

#[derive(Clone)]
pub struct S3Client {
    pub client: aws_sdk_s3::Client,
}

/// Thin wrapper around the base AWS SDK client so that we can add some type safety, custom errors, tracing etc
///
/// How does this work?
/// - We grant S3 AWS IAM credentials to a specific `AWS_ACCESS_KEY_ID`
/// - In the various environments/servers (dev/local/prod) we read in the AWS access key from the environment (via the .env)
/// - So, if you want to run this in a new environment, be sure to add the appropriate IAM config to the AWS key in that environment!
///
/// Resources:
///   - Overview of S3 architecture: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
///   - Actions that can be performed in S3 https://docs.aws.amazon.com/AmazonS3/latest/API/API_Operations_Amazon_Simple_Storage_Service.html
impl S3Client {
    #[allow(unused)]
    /// Delete a set of objects by keys in a particular S3 bucket
    pub async fn delete_objects(&self, bucket: &str, keys: Vec<String>) -> Result<(), S3Error> {
        let delete_objects: Vec<ObjectIdentifier> = keys
            .iter()
            .map(|k| ObjectIdentifier::builder().set_key(Some(k.to_owned())).build())
            .collect();

        let delete = Delete::builder().set_objects(Some(delete_objects)).build();

        tracing::info!("s3: deleting objects");
        self.client
            .delete_objects()
            .bucket(bucket)
            .delete(delete)
            .send()
            .await?;
        tracing::info!("s3: deleted objects");

        Ok(())
    }

    #[allow(unused)]
    /// Put an object in S3 at the path specified by `s3://{bucket}/{key}`
    ///    - Note: S3 is a flat heirarchy, but key can use `/` in the name to mimic a directory structure
    pub async fn put_object<T>(&self, bucket: &String, key: &String, object: T) -> Result<String, S3Error>
    where
        aws_sdk_s3::types::ByteStream: std::convert::From<T>,
    {
        let body: ByteStream = ByteStream::from(object);

        tracing::info!("s3: putting object");
        self.client
            .put_object()
            .bucket(bucket)
            .key(key)
            .body(body)
            .send()
            .await?;
        tracing::info!("s3: put object");

        Ok(format!("{}{}{}", S3_PATH_PREFIX, bucket, key))
    }
}

#[derive(Debug, Error)]
pub enum S3Error {
    #[error("ListBucketsError")]
    ListBuckets(#[from] aws_sdk_s3::types::SdkError<aws_sdk_s3::error::ListBucketsError>),
    #[error("DeleteObjectsError")]
    DeleteObjects(#[from] aws_sdk_s3::types::SdkError<aws_sdk_s3::error::DeleteObjectsError>),
    #[error("PutObjectError")]
    PutObject(#[from] aws_sdk_s3::types::SdkError<aws_sdk_s3::error::PutObjectError>),
    #[error("PresigningConfigError")]
    PresigningConfig(#[from] aws_sdk_s3::presigning::config::Error),
    #[error("BucketNotFound")]
    BucketNotFound,
}
