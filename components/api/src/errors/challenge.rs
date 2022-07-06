use thiserror::Error;

#[derive(Debug, Error)]
pub enum ChallengeError {
    #[error("challenge timeout or mismatch")]
    ChallengeNotValid,
    #[error("Challenge is expired")]
    ChallengeExpired,
    #[error("user does not exist for email challenge")]
    UserDoesntExistForEmailChallenge,
    #[error("token invalid or not found")]
    EmailVerificationTokenInvalidOrNotFound,
    #[error("email challenge expired")]
    EmailChallengeExpired,
}
