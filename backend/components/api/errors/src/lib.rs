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
pub struct FpError(Box<dyn FpErrorTraitWithLocation>);

impl std::ops::Deref for FpError {
    type Target = dyn FpErrorTrait;

    fn deref(&self) -> &Self::Target {
        self.0.upcast()
    }
}

/// Most functions should return an FpResult<T> in order to properly handle all errors from around
/// the Footprint ecosystem
pub type FpResult<T> = Result<T, FpError>;

impl<T: FpErrorTrait + 'static> From<T> for FpError {
    #[track_caller]
    fn from(value: T) -> Self {
        // Capture the backtrace at the point of creation
        let inner = InnerFpErrorWithLocation::new(value);
        Self(Box::new(inner))
    }
}

impl std::fmt::Display for FpError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.0, f)
    }
}

impl std::fmt::Debug for FpError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Debug::fmt(&self.0, f)
    }
}

impl FpError {
    pub fn emit_error(&self, is_error: bool, support_id: String) {
        if is_error {
            tracing::error!(err=?self.0, error.message=%self.0, error.stack=%self.location(), %support_id, status_code=%self.status_code().as_u16(), "{}", self.message());
        } else {
            tracing::info!(err=?self.0, error.message=%self.0, error.stack=%self.location(), %support_id, status_code=%self.status_code().as_u16(), "{}", self.message());
        };
    }

    pub fn location(&self) -> String {
        self.0.location()
    }

    pub fn on_request_end(&self, resp: &mut actix_web::HttpResponseBuilder) {
        self.mutate_response(resp);
        let ctx = ResponseErrorContext {
            message: self.message(),
            location: self.location(),
        };
        resp.extensions_mut().insert(ctx);
    }
}

/// Extension to add context on an error to the actix response
#[derive(Debug, Clone)]
pub struct ResponseErrorContext {
    pub message: String,
    pub location: String,
}

impl std::error::Error for FpError {
    fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
        self.0.source()
    }
}

mod anyhow;
mod backtrace;
mod base;
mod code;
mod diesel;

use backtrace::FpErrorTraitWithLocation;
use backtrace::InnerFpErrorWithLocation;
pub use base::*;
pub use code::BadRequestWithCode;
pub use code::FpErrorCode;
pub use diesel::*;

impl From<std::convert::Infallible> for FpError {
    #[track_caller]
    fn from(_: std::convert::Infallible) -> Self {
        panic!("impossible condition convert Infallible to FpError")
    }
}
