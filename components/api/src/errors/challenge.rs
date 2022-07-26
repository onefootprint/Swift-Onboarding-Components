use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChallengeError {
    #[error("Challenge timeout or mismatch")]
    ChallengeNotValid,
    #[error("Challenge is expired")]
    ChallengeExpired,
    #[error("Email is already verified")]
    EmailAlreadyVerified,
    #[error("Token invalid or not found")]
    EmailVerificationTokenInvalidOrNotFound,
    #[error("Email challenge expired")]
    EmailChallengeExpired,
    #[error("Please wait {0} more seconds")]
    RateLimited(i64),
}
