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
pub struct FpError(pub Box<dyn FpErrorTrait>);

impl std::ops::Deref for FpError {
    type Target = dyn FpErrorTrait;

    fn deref(&self) -> &Self::Target {
        &*self.0 as &dyn FpErrorTrait
    }
}

/// Most functions should return an FpResult<T> in order to properly handle all errors from around
/// the Footprint ecosystem
pub type FpResult<T> = Result<T, FpError>;

impl<T: FpErrorTrait + 'static> From<T> for FpError {
    fn from(value: T) -> Self {
        FpError(Box::new(value))
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

impl std::error::Error for FpError {
    fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
        self.0.source()
    }
}

mod base;
mod code;

pub use base::*;
pub use code::BadRequestWithCode;
pub use code::FpErrorCode;

impl From<std::convert::Infallible> for FpError {
    fn from(_: std::convert::Infallible) -> Self {
        panic!("impossible condition convert Infallible to ApiError")
    }
}
