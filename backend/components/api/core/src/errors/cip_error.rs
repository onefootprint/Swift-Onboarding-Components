use alpaca::Error;
use newtypes::ReviewReason;
use newtypes::VendorAPI;
use reqwest::StatusCode;

#[derive(Debug, thiserror::Error)]
pub enum CipError {
    #[error("The entity did not complete onboarding via Footprint")]
    EntityDecisionDoesNotExist,

    #[error("The entity must have an approved decision status")]
    EntityDecisionStatusNotPass,

    #[error("The entity must have an approved decision status (if triggered manual review)")]
    EntityDecisionManualReviewStatusNotPass,

    #[error("Alpaca error: {0}")]
    AlpacaError(#[from] alpaca::Error),

    #[error("Watchlist results not found")]
    WatchlistResultsNotFoundError,

    #[error("Expected ReviewReason but not found: {0}")]
    ExpectedReviewReasonNotFound(ReviewReason),
    #[error("Expected VerificationResult not found for: {0}")]
    VerificationResultNotFound(VendorAPI),
}

impl CipError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            CipError::EntityDecisionManualReviewStatusNotPass
            | CipError::EntityDecisionDoesNotExist
            | CipError::EntityDecisionStatusNotPass
            | CipError::AlpacaError(Error::ConnectionError(_)) => StatusCode::BAD_REQUEST,
            CipError::AlpacaError(_)
            | CipError::WatchlistResultsNotFoundError
            | CipError::ExpectedReviewReasonNotFound(_)
            | CipError::VerificationResultNotFound(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
