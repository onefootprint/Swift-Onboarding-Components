use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("AWS pre-enrollment is missing")]
    MissingAwsPreEnrollment,

    #[error("Already enrolled in Vault Disaster Recovery")]
    AlreadyEnrolled,
}
