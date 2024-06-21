pub use actix_web::http::StatusCode;

pub trait FpErrorTrait: std::fmt::Debug + std::fmt::Display + std::error::Error + Send {
    /// The HTTP status code representing this error
    fn status_code(&self) -> StatusCode;
    // TODO maybe one day we'll make this return an enum to help guarantee that errors have unique codes
    /// For errors that clients can programatically respond to, a representative string
    fn code(&self) -> Option<String> {
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

// FpError needs to be separate from ModernApiError - FpError is the common type that all crates can
// return, ModernApiError wraps it and implements actix responder

/// The magical error type that can hold any type T that implements FpErrorTrait.
/// As crates create their own Error struct, they only need to implement FpErrorTrait.
#[derive(derive_more::Deref)]
pub struct FpError(pub Box<dyn FpErrorTrait>);

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
pub use base::AssertionError;
pub use base::ValidationError;

impl From<std::convert::Infallible> for FpError {
    fn from(_: std::convert::Infallible) -> Self {
        panic!("impossible condition convert Infallible to ApiError")
    }
}

pub const INCODE_MACHINE_CONCURRENT_CHANGE: &str = "incode_machine_concurrent_change";
pub const MIDDESK_ALREADY_COMPLETED: &str = "middesk_already_completed";
pub const MIGRATION_DRY_RUN: &str = "migration_dry_run";
