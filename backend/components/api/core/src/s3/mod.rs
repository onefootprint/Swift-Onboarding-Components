use async_trait::async_trait;
use aws_sdk_s3::operation::abort_multipart_upload::AbortMultipartUploadError;
use aws_sdk_s3::operation::complete_multipart_upload::CompleteMultipartUploadError;
use aws_sdk_s3::operation::create_multipart_upload::CreateMultipartUploadError;
use aws_sdk_s3::operation::delete_objects::DeleteObjectsError;
use aws_sdk_s3::operation::get_object::GetObjectError;
use aws_sdk_s3::operation::list_buckets::ListBucketsError;
use aws_sdk_s3::operation::put_object::PutObjectError;
use aws_sdk_s3::operation::upload_part::UploadPartError;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::types::{
    CompletedMultipartUpload,
    CompletedPart,
};
use bytes::{
    Bytes,
    BytesMut,
};
use futures::StreamExt;
#[cfg(test)]
use mockall::automock;
use thiserror::Error;
use url::{
    ParseError,
    Url,
};

#[allow(unused)]
const S3_PATH_PREFIX: &str = "s3://";

#[derive(Clone)]
pub struct AwsS3Client {
    pub client: aws_sdk_s3::Client,
}

#[cfg_attr(test, automock)]
#[async_trait]
pub trait S3Client: Send + Sync + std::fmt::Debug {
    async fn put_bytes(
        &self,
        bucket: &str,
        key: String,
        bytes: Vec<u8>,
        mime: Option<String>,
    ) -> Result<String, S3Error>;

    /// Get an object in S3 from the path specified by an s3 url
    async fn get_object_from_s3_url(&self, url: &str) -> Result<actix_web::web::Bytes, S3Error>;
    async fn get_object(&self, bucket: String, object: String) -> Result<actix_web::web::Bytes, S3Error>;
}

impl std::fmt::Debug for AwsS3Client {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("S3Client")
    }
}

#[async_trait]
impl S3Client for AwsS3Client {
    async fn put_bytes(
        &self,
        bucket: &str,
        key: String,
        bytes: Vec<u8>,
        mime: Option<String>,
    ) -> Result<String, S3Error> {
        self.put_object(bucket, key, bytes, mime.as_deref()).await
    }

    async fn get_object_from_s3_url(&self, url: &str) -> Result<actix_web::web::Bytes, S3Error> {
        self.get_object_from_s3_url(url).await
    }

    async fn get_object(&self, bucket: String, object: String) -> Result<actix_web::web::Bytes, S3Error> {
        self.get_object(bucket, object).await
    }
}

/// Thin wrapper around the base AWS SDK client so that we can add some type safety, custom errors,
/// tracing etc
///
/// How does this work?
/// - We grant S3 AWS IAM credentials to a specific `AWS_ACCESS_KEY_ID`
/// - In the various environments/servers (dev/local/prod) we read in the AWS access key from the
///   environment (via the .env)
/// - So, if you want to run this in a new environment, be sure to add the appropriate IAM config to
///   the AWS key in that environment!
///
/// Resources:
///   - Overview of S3 architecture: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
///   - Actions that can be performed in S3 https://docs.aws.amazon.com/AmazonS3/latest/API/API_Operations_Amazon_Simple_Storage_Service.html
impl AwsS3Client {
    /// Put an object in S3 at the path specified by `s3://{bucket}/{key}`
    ///    - Note: S3 is a flat heirarchy, but key can use `/` in the name to mimic a directory
    ///      structure
    #[tracing::instrument(skip(self, object))]
    pub async fn put_object<T>(
        &self,
        bucket: &str,
        key: String,
        object: T,
        mime: Option<&str>,
    ) -> Result<String, S3Error>
    where
        ByteStream: std::convert::From<T>,
    {
        let body: ByteStream = ByteStream::from(object);

        let mut put = self
            .client
            .put_object()
            .bucket(bucket)
            .key(key.clone())
            .body(body);

        if let Some(mime) = mime {
            put = put.content_type(mime);
        }

        put.send().await?;

        let s3_path = format!("{}{}/{}", S3_PATH_PREFIX, bucket, key);
        Ok(s3_path)
    }

    /// For use when > 5MB
    /// For now we limit to 5MB so we should just use the regular put
    #[allow(unused)]
    #[tracing::instrument(skip(self, parts))]
    pub async fn multipart_put_object(
        &self,
        bucket: &str,
        key: String,
        mime: &str,
        mut parts: actix_multipart::Field,
    ) -> Result<(), S3Error> {
        let upload = self
            .client
            .create_multipart_upload()
            .bucket(bucket)
            .key(key.clone())
            .content_type(mime)
            .send()
            .await?;

        let upload_id = upload.upload_id().ok_or(S3Error::EmptyS3UploadId)?;

        // this is what makes this efficient: read a chunk, upload a chunk!
        let mut upload_parts = vec![];

        // S3 requires all but the last upload part be < 5MB
        const MIN_CHUNK_BYTE_SIZE: usize = 5 * 1024 * 1024;
        let mut current_chunk = BytesMut::new();

        loop {
            let next = parts.next().await;
            let should_continue = match next {
                Some(Ok(chunk)) => {
                    current_chunk.extend(chunk);
                    if current_chunk.len() < MIN_CHUNK_BYTE_SIZE {
                        continue;
                    }
                    true
                }
                None => false,
                Some(Err(err)) => {
                    let _ = self
                        .client
                        .abort_multipart_upload()
                        .bucket(bucket)
                        .key(key.clone())
                        .upload_id(upload_id)
                        .send()
                        .await?;
                    return Err(err)?;
                }
            };

            let res = self
                .client
                .upload_part()
                .upload_id(upload_id)
                .bucket(bucket)
                .key(key.clone())
                .part_number(1 + upload_parts.len() as i32)
                .body(Bytes::from(current_chunk).into())
                .send()
                .await?;

            upload_parts.push(
                CompletedPart::builder()
                    .e_tag(res.e_tag.unwrap_or_default())
                    .part_number(1 + upload_parts.len() as i32)
                    .build(),
            );

            // reset our current chunk
            current_chunk = BytesMut::new();

            if !should_continue {
                break;
            }
        }
        let completed_multipart_upload = CompletedMultipartUpload::builder()
            .set_parts(Some(upload_parts))
            .build();

        let _complete = self
            .client
            .complete_multipart_upload()
            .bucket(bucket)
            .key(key.clone())
            .upload_id(upload_id)
            .multipart_upload(completed_multipart_upload)
            .send()
            .await?;

        tracing::info!("s3: put object multipart complete");

        Ok(())
    }

    /// Get an object in S3 from the path specified by `s3://{bucket}/{key}`
    #[tracing::instrument(skip(self))]
    pub async fn get_object(&self, bucket: String, object: String) -> Result<actix_web::web::Bytes, S3Error> {
        let obj = self
            .client
            .get_object()
            .bucket(bucket)
            .key(object)
            .send()
            .await?
            .body
            .collect()
            .await
            .map(|b| b.into_bytes())
            .map_err(|e| S3Error::AwsHttpByteStreamError(format!("{:?}", e)))?;

        Ok(obj)
    }

    #[tracing::instrument(skip(self))]
    /// Get an object in S3 from the path specified by an s3 url
    pub async fn get_object_from_s3_url(&self, url: &str) -> Result<actix_web::web::Bytes, S3Error> {
        let (bucket, object) = AwsS3Client::parse_s3_url(url)?;
        let res = self.get_object(bucket, object).await?;

        Ok(res)
    }
}

impl AwsS3Client {
    #[allow(dead_code)]
    fn parse_s3_url(url: &str) -> Result<(String, String), S3Error> {
        let s3_url = Url::parse(url)?;
        if s3_url.scheme() != "s3" {
            return Err(S3Error::InvalidS3Url);
        }
        let Some(bucket) = s3_url.host_str() else {
            return Err(S3Error::InvalidS3Url);
        };

        // We need to shave off the `/`
        let object = &s3_url.path()[1..];

        Ok((bucket.to_string(), object.to_string()))
    }
}

#[derive(Debug, Error)]
pub enum S3Error {
    #[error("List error")]
    ListBuckets(#[from] aws_sdk_s3::error::SdkError<ListBucketsError>),
    #[error("Delete objects error")]
    DeleteObjects(#[from] aws_sdk_s3::error::SdkError<DeleteObjectsError>),
    #[error("Put object error")]
    PutObject(#[from] aws_sdk_s3::error::SdkError<PutObjectError>),
    #[error("Create multipart upload error")]
    CreateMultipartUpload(#[from] aws_sdk_s3::error::SdkError<CreateMultipartUploadError>),
    #[error("Abort multipart error")]
    AbortMultipartUpload(#[from] aws_sdk_s3::error::SdkError<AbortMultipartUploadError>),
    #[error("Upload multipart error")]
    UploadPart(#[from] aws_sdk_s3::error::SdkError<UploadPartError>),
    #[error("Complete multipart error")]
    CompleteUpload(#[from] aws_sdk_s3::error::SdkError<CompleteMultipartUploadError>),
    #[error("Get object error")]
    GetObject(#[from] aws_sdk_s3::error::SdkError<GetObjectError>),
    #[error("Not found")]
    BucketNotFound,
    #[error("URL parsing error")]
    S3UrlParseError(#[from] ParseError),
    #[error("Byte stream error")]
    AwsHttpByteStreamError(String),
    #[error("Invalid URL provided")]
    InvalidS3Url,
    #[error("Missing upload id")]
    EmptyS3UploadId,
    #[error("Missing upload location")]
    EmptyS3UploadLocation,
    #[error("Multipart upload error")]
    MultipartUpload(String),
    #[error("Internal parameter error")]
    BuildError(#[from] aws_sdk_s3::error::BuildError),
}

impl From<actix_multipart::MultipartError> for S3Error {
    fn from(value: actix_multipart::MultipartError) -> Self {
        Self::MultipartUpload(format!("{:?}", &value))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_s3_url() {
        // test_case would be nice here, but PartialEq/Eq were not defined for aws_sdk::s3 errors
        let good_url = "s3://bucket/object/is/here";
        let (bucket, obj) = AwsS3Client::parse_s3_url(good_url).expect("err");
        assert_eq!(bucket, "bucket".to_string());
        assert_eq!(obj, "object/is/here".to_string());

        // Failures
        let bad_url_wrong_scheme = "http://bucket/object/is/here";
        let fails_wrong_scheme = matches!(
            AwsS3Client::parse_s3_url(bad_url_wrong_scheme),
            Err(S3Error::InvalidS3Url)
        );
        assert!(fails_wrong_scheme);
    }
}
