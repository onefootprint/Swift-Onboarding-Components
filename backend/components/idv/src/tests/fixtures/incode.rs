use newtypes::{PiiJsonValue, PiiString};
use serde_json::json;

use crate::incode::{
    response::OnboardingStartResponse, watchlist::response::WatchlistResultResponse, IncodeAPIResult,
    IncodeResponse,
};

pub fn start_onboarding_response() -> IncodeResponse<OnboardingStartResponse> {
    IncodeResponse {
        result: IncodeAPIResult::Success(OnboardingStartResponse {
            token: PiiString::from("123".to_owned()),
            interview_code: None,
            interview_id: "123".to_owned(),
            flow_type: None,
            id_capture_timeout: None,
            id_capture_retries: None,
            selfie_capture_timeout: None,
            selfie_capture_retries: None,
            curp_validation_retries: None,
            client_id: None,
            env: None,
            existing_session: None,
            error: None,
        }),
        raw_response: PiiJsonValue::from(json!({})),
    }
}

pub fn watchlist_result_response() -> IncodeResponse<WatchlistResultResponse> {
    IncodeResponse {
        result: IncodeAPIResult::Success(WatchlistResultResponse {
            status: Some("sucess".to_owned()),
            content: None,
            error: None,
        }),
        raw_response: PiiJsonValue::from(json!({})),
    }
}
