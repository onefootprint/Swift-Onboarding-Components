use actix_web::http::StatusCode;
use aws_sdk_s3::operation::get_bucket_location::GetBucketLocationError;
use aws_sdk_s3::operation::get_object::GetObjectError;
use aws_sdk_s3::operation::list_objects_v2::ListObjectsV2Error;
use aws_sdk_s3::operation::put_object::PutObjectError;
use aws_sdk_sts::operation::get_caller_identity::GetCallerIdentityError;
use thiserror::Error;

// Keeping this in its own crate to make it easier to break circular dependencies in api_core
// later.
#[derive(Debug, Error)]
pub enum Error {
    #[error("AWS pre-enrollment is missing")]
    MissingAwsPreEnrollment,

    #[error("Not enrolled in Vault Disaster Recovery")]
    NotEnrolled,

    #[error("Already enrolled in Vault Disaster Recovery")]
    AlreadyEnrolled,

    #[error("Role validation failed: {0}")]
    RoleValidationFailed(String),

    #[error("Bucket validation failed: {0}")]
    BucketValidationFailed(String),

    #[error("IAM assertion failed: {0}")]
    IamAssertionFailed(String),

    #[error("AWS client has no region defined")]
    AwsClientMissingRegion,

    #[error("STS GetCallerIdentity error: {0}")]
    StsGetCallerIdentity(#[from] Box<GetCallerIdentityError>),

    #[error("S3 GetObject error: {0}")]
    S3GetObject(#[from] Box<GetObjectError>),

    #[error("S3 PutObject error: {0}")]
    S3PutObject(#[from] Box<PutObjectError>),

    #[error("S3 ListObjectsV2 error: {0}")]
    S3ListObjectsV2(#[from] Box<ListObjectsV2Error>),

    #[error("S3 GetBucketLocation error: {0}")]
    S3GetBucketLocation(#[from] Box<GetBucketLocationError>),

    #[error("Invalid org age identity: {0}")]
    InvalidAgeIdentity(String),

    #[error("Age error: {0}")]
    Age(String),

    #[error("Age encrypt error: {0}")]
    AgeEncrypt(#[from] age::EncryptError),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Utf8 decode failed: {0}")]
    Utf8Decode(#[from] std::string::FromUtf8Error),
}

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        match self {
            Self::MissingAwsPreEnrollment
            | Self::NotEnrolled
            | Self::AlreadyEnrolled
            | Self::RoleValidationFailed(_)
            | Self::BucketValidationFailed(_)
            | Self::InvalidAgeIdentity(_) => StatusCode::BAD_REQUEST,
            Self::IamAssertionFailed(_)
            | Self::AwsClientMissingRegion
            | Self::StsGetCallerIdentity(_)
            | Self::S3GetObject(_)
            | Self::S3PutObject(_)
            | Self::S3ListObjectsV2(_)
            | Self::S3GetBucketLocation(_)
            | Self::Age(_)
            | Self::AgeEncrypt(_)
            | Self::IoError(_)
            | Self::Utf8Decode(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
