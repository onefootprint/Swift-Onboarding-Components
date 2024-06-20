pub use actix_web::http::StatusCode;

pub trait FpApiError: std::fmt::Debug + std::fmt::Display + std::error::Error {
    /// The HTTP status code representing this error
    fn status_code(&self) -> StatusCode;
    // TODO maybe one day we'll make this return an enum to help guarantee that errors have unique codes
    /// For errors that clients can programatically respond to, a representative string
    fn code(&self) -> Option<String>;
    /// For errors that clients can programatically respond to, any machine-readable context
    fn context(&self) -> Option<serde_json::Value>;
    /// A brief human-readable description of the error. This is visible to tenants and clients, so
    /// please choose language accordingly.
    fn message(&self) -> String;
    /// Used when the specific error implementation has some targeted logic
    fn mutate_response(&self, _resp: &mut actix_web::HttpResponseBuilder) {}
}
