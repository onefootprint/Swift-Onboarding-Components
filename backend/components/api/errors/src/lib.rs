pub use actix_web::http::StatusCode;
pub use actix_web::HttpResponseBuilder;

pub trait FpErrorTrait:
    std::fmt::Debug + std::fmt::Display + std::error::Error + Send + std::any::Any + 'static
{
    /// The HTTP status code representing this error
    fn status_code(&self) -> StatusCode;
    /// For errors that clients can programatically respond to, a unique string to identify the
    /// error
    fn code(&self) -> Option<FpErrorCode> {
        None
    }
    /// For errors that clients can programatically respond to, any machine-readable context
    fn context(&self) -> Option<serde_json::Value> {
        None
    }
    /// A brief human-readable description of the error. This is visible to tenants and clients, so
    /// please choose language accordingly.
    fn message(&self) -> String;
    /// Used when the specific error implementation has some targeted logic
    fn mutate_response(&self, _resp: &mut actix_web::HttpResponseBuilder) {}
}

/// The magical error type that can hold any type T that implements FpErrorTrait.
/// As crates create their own Error struct, they only need to implement FpErrorTrait.
pub struct FpError {
    inner: Box<dyn FpErrorTrait>,
    location: String,
}

impl std::ops::Deref for FpError {
    type Target = dyn FpErrorTrait;

    fn deref(&self) -> &Self::Target {
        &*self.inner as &dyn FpErrorTrait
    }
}

/// Most functions should return an FpResult<T> in order to properly handle all errors from around
/// the Footprint ecosystem
pub type FpResult<T> = Result<T, FpError>;

impl<T: FpErrorTrait + 'static> From<T> for FpError {
    #[track_caller]
    fn from(value: T) -> Self {
        FpError {
            inner: Box::new(value),
            // Using std::backtrace::Backtrace::capture() here is extremely expensive. Slows down our
            // integration tests 6x.
            // Alteratively, we could just `tracing::warn!` right here?
            location: std::panic::Location::caller().to_string(),
        }
    }
}

impl std::fmt::Display for FpError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.inner, f)
    }
}

impl std::fmt::Debug for FpError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Debug::fmt(&self.inner, f)
    }
}

impl FpError {
    pub fn log_error(&self, support_id: String) {
        if self.status_code().is_server_error() {
            tracing::error!(err=?self.inner, error.message=%self.inner, error.stack=%self.location, %support_id, status_code=%self.status_code().as_u16(), "{}", self.message());
        } else {
            tracing::info!(err=?self.inner, error.message=%self.inner, error.stack=%self.location, %support_id, status_code=%self.status_code().as_u16(), "{}", self.message());
        };
    }

    pub fn location(&self) -> &str {
        &self.location
    }
}

impl std::error::Error for FpError {
    fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
        self.inner.source()
    }
}

mod base;
mod code;
mod diesel;

pub use base::*;
pub use code::BadRequestWithCode;
pub use code::FpErrorCode;
pub use diesel::*;

impl From<std::convert::Infallible> for FpError {
    #[track_caller]
    fn from(_: std::convert::Infallible) -> Self {
        panic!("impossible condition convert Infallible to ApiError")
    }
}
