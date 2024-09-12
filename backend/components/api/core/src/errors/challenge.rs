use newtypes::IdentifyScope;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChallengeError {
    #[error("Email verification token invalid")]
    EmailVerificationTokenInvalid,
    #[error("Invalid playbook for identify scope {0}")]
    InvalidPlaybook(IdentifyScope),
}

impl api_errors::FpErrorTrait for ChallengeError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
