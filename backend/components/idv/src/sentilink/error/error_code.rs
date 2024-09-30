#[derive(Debug, derive_more::Display)]
pub enum SentilinkErrorCode {
    // Unauthorized
    Unauthorized,
    // This error code reflects an invalid request. The error message returned will specify the cause (e.g.,
    // “The SSN was invalid.”).
    InvalidRequest,
    // A dependency error occurred when processing the request. Please contact tech-support@sentilink.com.
    DependencyError,
    // This error code reflects a rate limit issue. The error message returned will specify whether the rate
    // limit is missing or has been exceeded. Please contact support@sentilink.com to resolve the issue.
    RateLimited,
    // An error occurred when processing the request.
    ErrorProcessing,
    // Multiple errors occurred. The error message returned will specify the causes. (e.g., ["city is
    // required","state_code is missing or not a valid code","zipcode is required"])
    MulipleErrors,
    Other(i32),
}

impl From<i32> for SentilinkErrorCode {
    fn from(value: i32) -> SentilinkErrorCode {
        match value {
            1000 => SentilinkErrorCode::Unauthorized,
            2000 => SentilinkErrorCode::InvalidRequest,
            3000 => SentilinkErrorCode::DependencyError,
            4000 => SentilinkErrorCode::RateLimited,
            5000 => SentilinkErrorCode::ErrorProcessing,
            6000 => SentilinkErrorCode::MulipleErrors,
            val => SentilinkErrorCode::Other(val),
        }
    }
}
