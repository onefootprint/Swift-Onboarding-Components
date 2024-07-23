use newtypes::IdentifyScope;
use newtypes::ObConfigurationKind;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChallengeError {
    #[error("Email verification token invalid")]
    EmailVerificationTokenInvalid,
    #[error("Incorrect playbook kind {0} for identify scope {1}")]
    IncorrectPlaybookKind(ObConfigurationKind, IdentifyScope),
}

impl api_errors::FpErrorTrait for ChallengeError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
