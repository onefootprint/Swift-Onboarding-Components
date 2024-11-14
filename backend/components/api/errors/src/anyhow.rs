use crate::FpError;
use crate::FpErrorTrait;
use crate::FpErrorTraitWithLocation;
use http::StatusCode;

#[derive(Debug, derive_more::Display)]
/// Wrapper around an `anyhow::Error` that can be converted into an `FpError`
struct AnyhowError(anyhow::Error);

impl std::error::Error for AnyhowError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.0.source()
    }
}

impl FpErrorTrait for AnyhowError {
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.0.to_string()
    }
}


impl FpErrorTraitWithLocation for AnyhowError {
    fn location(&self) -> String {
        // We can reuse the backtrace from the inner anyhow Error
        self.0.backtrace().to_string()
    }

    fn upcast(&self) -> &dyn FpErrorTrait {
        self as &dyn FpErrorTrait
    }
}

impl From<anyhow::Error> for FpError {
    fn from(value: anyhow::Error) -> Self {
        FpError(Box::new(AnyhowError(value)))
    }
}
