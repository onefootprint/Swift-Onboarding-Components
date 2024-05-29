use http::StatusCode;
use newtypes::SessionAuthToken;
use serde_json::{
    json,
    Value,
};
use strum::EnumMessage;
use strum_macros;

#[derive(Debug, strum_macros::EnumMessage, strum_macros::EnumIter)]
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
    #[strum(message = "E104", detailed_message = "Please wait a few more seconds")]
    RateLimited(i64),
    #[strum(
        message = "E105",
        detailed_message = "Cannot initiate a challenge of requested kind"
    )]
    UnsupportedChallengeKind(String),
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
    #[strum(
        message = "E109",
        detailed_message = "Identity document is not pending upload"
    )]
    DocumentNotPending,
    #[strum(message = "E110", detailed_message = "Invalid file upload: body missing")]
    InvalidFileUploadMissing,
    #[strum(message = "E111", detailed_message = "Missing content type (mime)")]
    MissingMimeType,
    #[strum(message = "E112", detailed_message = "Invalid file type")]
    InvalidMimeType(String),
    #[strum(message = "E113", detailed_message = "Invalid file upload, try another file")]
    MultipartError,
    #[strum(message = "E114", detailed_message = "Image too large")]
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
    #[strum(message = "E120", detailed_message = "Please log into your existing account")]
    ExistingVault(SessionAuthToken),
    #[strum(message = "E121", detailed_message = "File upload exceeded time limit")]
    FileUploadTimeout,
    #[strum(message = "E122", detailed_message = "Image too small")]
    FileTooSmall(usize),
}

impl ErrorWithCode {
    pub fn status_code(&self) -> StatusCode {
        match self {
            Self::InvalidStatusTransition => StatusCode::BAD_REQUEST,
            Self::IncorrectPin => StatusCode::BAD_REQUEST,
            Self::ChallengeExpired => StatusCode::BAD_REQUEST,
            Self::RateLimited(_) => StatusCode::TOO_MANY_REQUESTS,
            Self::UnsupportedChallengeKind(_) => StatusCode::BAD_REQUEST,
            Self::CannotRegisterPasskey => StatusCode::BAD_REQUEST,
            Self::LoginChallengeUserNotFound => StatusCode::BAD_REQUEST,
            Self::OnlyOneIdentifier => StatusCode::BAD_REQUEST,
            Self::DocumentNotPending => StatusCode::BAD_REQUEST,
            Self::InvalidFileUploadMissing => StatusCode::BAD_REQUEST,
            Self::MissingMimeType => StatusCode::BAD_REQUEST,
            Self::InvalidMimeType(_) => StatusCode::BAD_REQUEST,
            Self::MultipartError => StatusCode::BAD_REQUEST,
            Self::FileTooLarge(_) => StatusCode::PAYLOAD_TOO_LARGE,
            Self::FileTooSmall(_) => StatusCode::BAD_REQUEST,
            Self::InvalidContentLength => StatusCode::BAD_REQUEST,
            Self::MissingFilename => StatusCode::BAD_REQUEST,
            Self::NoSessionFound => StatusCode::UNAUTHORIZED,
            Self::SessionExpired => StatusCode::UNAUTHORIZED,
            Self::CouldNotParseSession => StatusCode::UNAUTHORIZED,
            Self::ExistingVault(_) => StatusCode::BAD_REQUEST,
            Self::FileUploadTimeout => StatusCode::REQUEST_TIMEOUT,
        }
    }
}

macro_rules! context_macro {
    ($($variant:ident($param:ident: $type:ty)),*) => {
        impl ErrorWithCode {
            pub fn context(&self) -> Option<Value> {
                match self {
                    $(
                        Self::$variant($param) => {
                            Some(json!({ stringify!($param): $param }))
                        },
                    )*
                    _ => None,
                }
            }
        }
    };
}

context_macro!(
    RateLimited(seconds: i64),
    UnsupportedChallengeKind(challenge_kind: String),
    InvalidMimeType(file_type: String),
    FileTooLarge(max_size: usize),
    ExistingVault(token: SessionAuthToken)
);

impl std::error::Error for ErrorWithCode {}
impl std::fmt::Display for ErrorWithCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.get_detailed_message().unwrap_or_default())
    }
}

#[cfg(test)]
mod tests {
    use super::ErrorWithCode;
    use itertools::Itertools;
    use strum::{
        EnumMessage,
        IntoEnumIterator,
    };

    #[test]
    fn test_unique_error_codes() {
        let codes = ErrorWithCode::iter()
            .filter_map(|e| e.get_message())
            .unique()
            .count();
        let total = ErrorWithCode::iter().count();
        assert_eq!(codes, total, "Duplicate or missing error codes");
    }
}
