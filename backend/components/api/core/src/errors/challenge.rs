use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChallengeError {
    #[error("Incorrect PIN code")]
    IncorrectPin,
    #[error("Challenge has timed out. Please try again")]
    ChallengeExpired,
    #[error("Email is already verified")]
    EmailAlreadyVerified,
    #[error("Token invalid or not found")]
    EmailVerificationTokenInvalidOrNotFound,
    #[error("Please wait {0} more seconds")]
    RateLimited(i64),
    #[error("Cannot add more than one biometric credential")]
    BiometricCredentialAlreadyExists,
    #[error("Login challenge initiated for non-existent user vault")]
    LoginChallengeUserNotFound,
    #[error("Provide one user identifier to initiate a challenge")]
    OnlyOneIdentifier,
    #[error("Onboarding config does not allow challenge kind = {0}")]
    ChallengeKindNotAllowed(String),
}
