use actix_web::HttpMessage;
use actix_web::HttpRequest;
use std::time::Duration;
use tokio::time::Instant;

#[derive(Debug, Clone, Copy)]
pub struct ResponseDeadline(Instant);

impl ResponseDeadline {
    pub fn from_timeout(timeout: Duration) -> Self {
        Self(Instant::now() + timeout)
    }

    pub fn into_instant(self) -> Instant {
        self.0
    }

    pub fn from_req_or_timeout(req: &HttpRequest, timeout: Duration) -> Self {
        req.extensions()
            .get::<ResponseDeadline>()
            .cloned()
            .unwrap_or_else(|| ResponseDeadline::from_timeout(timeout))
    }
}
