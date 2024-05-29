use crate::utils::db2api::DbToApi;
use api_wire_types::ManualReviewReason;
use db::models::manual_review::ManualReview;

impl DbToApi<ManualReview> for api_wire_types::ManualReview {
    fn from_db(mr: ManualReview) -> Self {
        let ManualReview { review_reasons, .. } = mr;
        let review_reasons = review_reasons
            .iter()
            .map(|rr| ManualReviewReason {
                review_reason: *rr,
                canned_response: rr.canned_response().to_owned(),
            })
            .collect();
        api_wire_types::ManualReview { review_reasons }
    }
}
