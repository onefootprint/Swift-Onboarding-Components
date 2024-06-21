use actix_web::http::StatusCode;
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
}

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        match self {
            Self::MissingAwsPreEnrollment
            | Self::NotEnrolled
            | Self::AlreadyEnrolled
            | Self::RoleValidationFailed(_)
            | Self::BucketValidationFailed(_) => StatusCode::BAD_REQUEST,
            Self::IamAssertionFailed(_) | Self::AwsClientMissingRegion => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
