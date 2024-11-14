use crate::FpErrorCode;
use crate::FpErrorTrait;
use http::StatusCode;

pub trait FpErrorTraitWithLocation: FpErrorTrait {
    fn location(&self) -> String;
    fn upcast(&self) -> &dyn FpErrorTrait;
}

/// Wrapper arround a dyn FpErrorTrait that also captures the backtrace at the point of creation
pub struct InnerFpErrorWithLocation {
    pub(crate) inner: Box<dyn FpErrorTrait>,
    pub(crate) location: String,
}

impl InnerFpErrorWithLocation {
    #[track_caller]
    pub fn new<T: FpErrorTrait + 'static>(inner: T) -> Self {
        Self {
            inner: Box::new(inner),
            // Using std::backtrace::Backtrace::capture() here is extremely expensive. Slows down our
            // integration tests 6x.
            // Alteratively, we could just `tracing::warn!` right here?
            location: std::panic::Location::caller().to_string(),
        }
    }
}

impl std::ops::Deref for InnerFpErrorWithLocation {
    type Target = dyn FpErrorTrait;

    fn deref(&self) -> &Self::Target {
        &*self.inner as &dyn FpErrorTrait
    }
}

impl std::fmt::Display for InnerFpErrorWithLocation {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.inner, f)
    }
}

impl std::fmt::Debug for InnerFpErrorWithLocation {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Debug::fmt(&self.inner, f)
    }
}

impl std::error::Error for InnerFpErrorWithLocation {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        self.inner.source()
    }
}

impl FpErrorTraitWithLocation for InnerFpErrorWithLocation {
    fn location(&self) -> String {
        self.location.clone()
    }

    fn upcast(&self) -> &dyn FpErrorTrait {
        &*self.inner as &dyn FpErrorTrait
    }
}

impl FpErrorTrait for InnerFpErrorWithLocation {
    fn status_code(&self) -> StatusCode {
        self.inner.status_code()
    }

    fn code(&self) -> Option<FpErrorCode> {
        self.inner.code()
    }

    fn message(&self) -> String {
        self.inner.message()
    }

    fn context(&self) -> Option<serde_json::Value> {
        self.inner.context()
    }

    fn mutate_response(&self, resp: &mut actix_web::HttpResponseBuilder) {
        self.inner.mutate_response(resp)
    }
}
