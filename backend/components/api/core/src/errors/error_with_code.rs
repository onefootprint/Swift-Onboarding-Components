use api_errors::FpErrorCode;
use http::StatusCode;
use newtypes::SessionAuthToken;
use serde_json::json;
use serde_json::Value;

#[derive(Debug, thiserror::Error)]
pub enum ErrorWithCode {
    #[error("Cannot transition status backwards")]
    InvalidStatusTransition,
    #[error("Incorrect PIN code")]
    IncorrectPin,
    #[error("Challenge has timed out. Please try again")]
    ChallengeExpired,
    #[error("Please wait a few more seconds")]
    RateLimited(i64),
    #[error("Cannot initiate a challenge of requested kind")]
    UnsupportedChallengeKind(String),
    #[error("Cannot register passkey")]
    CannotRegisterPasskey,
    #[error("Login challenge initiated for non-existent user vault")]
    LoginChallengeUserNotFound,
    #[error("Provide one user identifier to initiate a challenge")]
    OnlyOneIdentifier,
    #[error("Identity document is not pending upload")]
    DocumentNotPending,
    #[error("Invalid file upload: body missing")]
    InvalidFileUploadMissing,
    #[error("Missing content type (mime)")]
    MissingMimeType,
    #[error("Invalid file type")]
    InvalidMimeType(String),
    #[error("Invalid file upload, try another file")]
    MultipartError,
    #[error("Image too large")]
    FileTooLarge(usize),
    #[error("Invalid content length")]
    InvalidContentLength,
    #[error("Missing filename")]
    MissingFilename,
    #[error("Session does not exist")]
    NoSessionFound,
    #[error("Session is expired")]
    SessionExpired,
    #[error("Session invalid")]
    CouldNotParseSession,
    #[error("Please log into your existing account")]
    ExistingVault(SessionAuthToken),
    #[error("File upload exceeded time limit")]
    FileUploadTimeout,
    #[error("Image too small")]
    FileTooSmall(usize),
}

impl api_errors::FpErrorTrait for ErrorWithCode {
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
        }
    }

    fn code(&self) -> Option<FpErrorCode> {
        let code = match self {
            Self::InvalidStatusTransition => FpErrorCode::InvalidStatusTransition,
            Self::IncorrectPin => FpErrorCode::IncorrectPin,
            Self::ChallengeExpired => FpErrorCode::ChallengeExpired,
            Self::RateLimited(_) => FpErrorCode::RateLimited,
            Self::UnsupportedChallengeKind(_) => FpErrorCode::UnsupportedChallengeKind,
            Self::CannotRegisterPasskey => FpErrorCode::CannotRegisterPasskey,
            Self::LoginChallengeUserNotFound => FpErrorCode::LoginChallengeUserNotFound,
            Self::OnlyOneIdentifier => FpErrorCode::OnlyOneIdentifier,
            Self::DocumentNotPending => FpErrorCode::DocumentNotPending,
            Self::InvalidFileUploadMissing => FpErrorCode::InvalidFileUploadMissing,
            Self::MissingMimeType => FpErrorCode::MissingMimeType,
            Self::InvalidMimeType(_) => FpErrorCode::InvalidMimeType,
            Self::MultipartError => FpErrorCode::MultipartError,
            Self::FileTooLarge(_) => FpErrorCode::FileTooLarge,
            Self::InvalidContentLength => FpErrorCode::InvalidContentLength,
            Self::MissingFilename => FpErrorCode::MissingFilename,
            Self::NoSessionFound => FpErrorCode::NoSessionFound,
            Self::SessionExpired => FpErrorCode::SessionExpired,
            Self::CouldNotParseSession => FpErrorCode::CouldNotParseSession,
            Self::ExistingVault(_) => FpErrorCode::ExistingVault,
            Self::FileUploadTimeout => FpErrorCode::FileUploadTimeout,
            Self::FileTooSmall(_) => FpErrorCode::FileTooSmall,
        };
        Some(code)
    }

    fn context(&self) -> Option<Value> {
        let context = match self {
            Self::RateLimited(seconds) => json!({ "seconds": seconds }),
            Self::UnsupportedChallengeKind(challenge_kind) => json!({ "challenge_kind": challenge_kind }),
            Self::InvalidMimeType(file_type) => json!({ "file_type": file_type }),
            Self::FileTooLarge(max_size) => json!({ "max_size": max_size }),
            Self::ExistingVault(token) => json!({ "token": token }),
            _ => return None,
        };
        Some(context)
    }

    fn message(&self) -> String {
        self.to_string()
    }

    fn mutate_response(&self, resp: &mut actix_web::HttpResponseBuilder) {
        // Failing to close the TCP connection after sending a timeout response allows clients to
        // continue sending request data even server has sent an error response. This would create
        // unneccesary work for both the server and the client.
        //
        // Closing the connection on FileTooLarge errors works around a long-standing actix-web
        // bug:
        // https://github.com/actix/actix-web/issues/2357
        // https://github.com/actix/actix-web/issues/3152
        // May not be necessary in all environments (e.g. load balancers mask the issue), but it's
        // necessary in local dev to prevent the client from hanging.
        match self {
            ErrorWithCode::FileUploadTimeout | ErrorWithCode::FileTooLarge(_) => {
                resp.force_close();
            }
            _ => {}
        };
    }
}
