use newtypes::{
    IdentifyScope,
    ObConfigurationKind,
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChallengeError {
    #[error("Email is already verified")]
    EmailAlreadyVerified,
    #[error("Email verification token invalid")]
    EmailVerificationTokenInvalid,
    #[error("Onboarding config does not allow challenge kind = {0}")]
    ChallengeKindNotAllowed(String),
    #[error("Incorrect playbook kind {0} for identify scope {1}")]
    IncorrectPlaybookKind(ObConfigurationKind, IdentifyScope),
}
