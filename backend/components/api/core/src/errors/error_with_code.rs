use http::StatusCode;
use newtypes::SessionAuthToken;
use serde_json::json;
use serde_json::Value;
use strum_macros;

#[derive(Debug, strum_macros::EnumDiscriminants, thiserror::Error)]
#[strum_discriminants(name(ErrorWithCodeKind))]
#[strum_discriminants(derive(strum_macros::Display, strum_macros::EnumIter))]
pub enum ErrorWithCode {
    #[strum_discriminants(strum(serialize = "E101"))]
    #[error("Cannot transition status backwards")]
    InvalidStatusTransition,
    #[strum_discriminants(strum(serialize = "E102"))]
    #[error("Incorrect PIN code")]
    IncorrectPin,
    #[strum_discriminants(strum(serialize = "E103"))]
    #[error("Challenge has timed out. Please try again")]
    ChallengeExpired,
    #[strum_discriminants(strum(serialize = "E104"))]
    #[error("Please wait a few more seconds")]
    RateLimited(i64),
    #[strum_discriminants(strum(serialize = "E105"))]
    #[error("Cannot initiate a challenge of requested kind")]
    UnsupportedChallengeKind(String),
    #[strum_discriminants(strum(serialize = "E106"))]
    #[error("Cannot register passkey")]
    CannotRegisterPasskey,
    #[strum_discriminants(strum(serialize = "E107"))]
    #[error("Login challenge initiated for non-existent user vault")]
    LoginChallengeUserNotFound,
    #[strum_discriminants(strum(serialize = "E108"))]
    #[error("Provide one user identifier to initiate a challenge")]
    OnlyOneIdentifier,
    #[strum_discriminants(strum(serialize = "E109"))]
    #[error("Identity document is not pending upload")]
    DocumentNotPending,
    #[strum_discriminants(strum(serialize = "E110"))]
    #[error("Invalid file upload: body missing")]
    InvalidFileUploadMissing,
    #[strum_discriminants(strum(serialize = "E111"))]
    #[error("Missing content type (mime)")]
    MissingMimeType,
    #[strum_discriminants(strum(serialize = "E112"))]
    #[error("Invalid file type")]
    InvalidMimeType(String),
    #[strum_discriminants(strum(serialize = "E113"))]
    #[error("Invalid file upload, try another file")]
    MultipartError,
    #[strum_discriminants(strum(serialize = "E114"))]
    #[error("Image too large")]
    FileTooLarge(usize),
    #[strum_discriminants(strum(serialize = "E115"))]
    #[error("Invalid content length")]
    InvalidContentLength,
    #[strum_discriminants(strum(serialize = "E116"))]
    #[error("Missing filename")]
    MissingFilename,
    #[strum_discriminants(strum(serialize = "E117"))]
    #[error("Session does not exist")]
    NoSessionFound,
    #[strum_discriminants(strum(serialize = "E118"))]
    #[error("Session is expired")]
    SessionExpired,
    #[strum_discriminants(strum(serialize = "E119"))]
    #[error("Session invalid")]
    CouldNotParseSession,
    #[strum_discriminants(strum(serialize = "E120"))]
    #[error("Please log into your existing account")]
    ExistingVault(SessionAuthToken),
    #[strum_discriminants(strum(serialize = "E121"))]
    #[error("File upload exceeded time limit")]
    FileUploadTimeout,
    #[strum_discriminants(strum(serialize = "E122"))]
    #[error("Image too small")]
    FileTooSmall(usize),
    #[strum_discriminants(strum(serialize = "E123"))]
    #[error("Missing header {0}")]
    MissingAuthHeader(String),
}

// TODO can remove this in favor of new FpErrorTrait
pub(crate) trait CodedError: std::error::Error {
    fn context(&self) -> Option<Value>;
    fn code(&self) -> String;
    fn status_code(&self) -> StatusCode;
}

impl CodedError for ErrorWithCode {
    fn context(&self) -> Option<Value> {
        let context = match self {
            Self::RateLimited(seconds) => json!({ "seconds": seconds }),
            Self::UnsupportedChallengeKind(challenge_kind) => json!({ "challenge_kind": challenge_kind }),
            Self::InvalidMimeType(file_type) => json!({ "file_type": file_type }),
            Self::FileTooLarge(max_size) => json!({ "max_size": max_size }),
            Self::ExistingVault(token) => json!({ "token": token }),
            Self::MissingAuthHeader(h) => json!({"header": h}),
            _ => return None,
        };
        Some(context)
    }

    fn code(&self) -> String {
        ErrorWithCodeKind::from(self).to_string()
    }

    fn status_code(&self) -> StatusCode {
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
            Self::MissingAuthHeader(_) => StatusCode::UNAUTHORIZED,
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::errors::error_with_code::ErrorWithCodeKind;
    use itertools::Itertools;
    use strum::IntoEnumIterator;

    #[test]
    fn test_unique_error_codes() {
        assert!(ErrorWithCodeKind::iter().all(|e| !e.to_string().is_empty()));
        let codes = ErrorWithCodeKind::iter().map(|e| e.to_string()).unique().count();
        let total = ErrorWithCodeKind::iter().count();
        assert_eq!(codes, total, "Duplicate or missing error codes");
    }
}
