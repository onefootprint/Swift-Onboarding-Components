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
}
