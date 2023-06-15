use newtypes::ReviewReason;
use reqwest::StatusCode;

#[derive(Debug, thiserror::Error)]
pub enum CipError {
    #[error("The entity must have an onboarding decision")]
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
}

impl CipError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            CipError::EntityDecisionManualReviewStatusNotPass
            | CipError::EntityDecisionDoesNotExist
            | CipError::EntityDecisionStatusNotPass => StatusCode::BAD_REQUEST,
            CipError::AlpacaError(_)
            | CipError::WatchlistResultsNotFoundError
            | CipError::ExpectedReviewReasonNotFound(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
