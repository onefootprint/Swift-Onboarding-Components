use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct ManualReview {
    pub review_reasons: Vec<ManualReviewReason>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct ManualReviewReason {
    pub review_reason: ReviewReason,
    pub canned_response: String,
}
