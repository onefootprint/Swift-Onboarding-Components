use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("AWS pre-enrollment is missing")]
    MissingAwsPreEnrollment,

    #[error("Already enrolled in Vault Disaster Recovery")]
    AlreadyEnrolled,
}

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
