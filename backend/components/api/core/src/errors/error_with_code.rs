use crate::ApiErrorKind;

use strum::EnumMessage;
use strum_macros;

#[derive(Debug, strum_macros::EnumMessage)]
pub enum ErrorWithCode {
    #[strum(message = "E101", detailed_message = "Cannot transition status backwards")]
    InvalidStatusTransition,
    #[strum(message = "E102", detailed_message = "Incorrect PIN code")]
    IncorrectPin,
    #[strum(
        message = "E103",
        detailed_message = "Challenge has timed out. Please try again"
    )]
    ChallengeExpired,
    #[strum(message = "E104", detailed_message = "Please wait {0} more seconds")]
    RateLimited(i64),
    #[strum(
        message = "E105",
        detailed_message = "Cannot initiate a challenge of requested kind"
    )]
    UnsupportedChallengeKind,
    #[strum(message = "E106", detailed_message = "Cannot register passkey")]
    CannotRegisterPasskey,
    #[strum(
        message = "E107",
        detailed_message = "Login challenge initiated for non-existent user vault"
    )]
    LoginChallengeUserNotFound,
    #[strum(
        message = "E108",
        detailed_message = "Provide one user identifier to initiate a challenge"
    )]
    OnlyOneIdentifier,
    #[strum(message = "E109", detailed_message = "Identity document is not pending upload")]
    IdentityDocumentNotPending,
    #[strum(message = "E110", detailed_message = "Invalid file upload: body missing")]
    InvalidFileUploadMissing,
    #[strum(message = "E111", detailed_message = "Missing content type (mime)")]
    MissingMimeType,
    #[strum(message = "E112", detailed_message = "Invalid file type")]
    InvalidMimeType,
    #[strum(message = "E113", detailed_message = "Invalid file upload, try another file")]
    MultipartError,
    #[strum(message = "E114", detailed_message = "Image too large: max size is {0}")]
    FileTooLarge(usize),
    #[strum(message = "E115", detailed_message = "Invalid content length")]
    InvalidContentLength,
    #[strum(message = "E116", detailed_message = "Missing filename")]
    MissingFilename,
    #[strum(message = "E117", detailed_message = "Session does not exist")]
    NoSessionFound,
    #[strum(message = "E118", detailed_message = "Session is expired")]
    SessionExpired,
    #[strum(message = "E119", detailed_message = "Session invalid")]
    CouldNotParseSession,
}

impl std::fmt::Display for ErrorWithCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let detailed_message = self.get_detailed_message().unwrap_or_default();

        let formatted_message = match self {
            ErrorWithCode::RateLimited(err) if detailed_message.contains("{0}") => {
                detailed_message.replace("{0}", &err.to_string())
            }
            ErrorWithCode::FileTooLarge(err) if detailed_message.contains("{0}") => {
                detailed_message.replace("{0}", &err.to_string())
            }
            _ => detailed_message.to_string(),
        };

        write!(f, "{}", formatted_message)
    }
}

impl From<actix_multipart::MultipartError> for ErrorWithCode {
    fn from(_: actix_multipart::MultipartError) -> Self {
        Self::MultipartError
    }
}
