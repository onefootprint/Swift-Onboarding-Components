use newtypes::{IdentifyScope, ObConfigurationKind};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChallengeError {
    #[error("Incorrect PIN code")]
    IncorrectPin,
    #[error("Challenge has timed out. Please try again")]
    ChallengeExpired,
    #[error("Email is already verified")]
    EmailAlreadyVerified,
    #[error("Email verification token invalid")]
    EmailVerificationTokenInvalid,
    #[error("Please wait {0} more seconds")]
    RateLimited(i64),
    #[error("Cannot register passkey")]
    CannotRegisterPasskey,
    #[error("Login challenge initiated for non-existent user vault")]
    LoginChallengeUserNotFound,
    #[error("Provide one user identifier to initiate a challenge")]
    OnlyOneIdentifier,
    #[error("Onboarding config does not allow challenge kind = {0}")]
    ChallengeKindNotAllowed(String),
    #[error("Incorrect playbook kind {0} for identify scope {1}")]
    IncorrectPlaybookKind(ObConfigurationKind, IdentifyScope),
}
