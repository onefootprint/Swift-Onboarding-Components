use crate::*;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct ManualReview {
    pub review_reasons: Vec<ManualReviewReason>,
}

export_schema!(ManualReview);

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]

pub struct ManualReviewReason {
    pub review_reason: ReviewReason,
    pub canned_response: String,
}

export_schema!(ManualReviewReason);
