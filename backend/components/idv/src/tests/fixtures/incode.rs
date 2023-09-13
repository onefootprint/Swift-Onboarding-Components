use newtypes::{PiiJsonValue, PiiString};
use serde_json::json;

use crate::incode::{
    response::OnboardingStartResponse,
    watchlist::response::{Content, Data, Doc, Hit, WatchlistResultResponse},
    IncodeAPIResult, IncodeResponse,
};

pub fn start_onboarding_response() -> IncodeResponse<OnboardingStartResponse> {
    let result = OnboardingStartResponse {
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
    };
    IncodeResponse {
        result: IncodeAPIResult::Success(result.clone()),
        raw_response: PiiJsonValue::from(serde_json::to_value(&result).unwrap()),
    }
}

pub fn watchlist_result_response(list_types: Vec<String>) -> IncodeResponse<WatchlistResultResponse> {
    let content = Content {
        data: Some(Data {
            id: None,
            ref_: None,
            filters: None,
            hits: Some(vec![Hit {
                score: Some(3.3),
                is_whitelisted: None,
                match_types: None,
                match_type_details: None,
                doc: Some(Doc {
                    aka: None,
                    fields: None,
                    id: None,
                    last_updated_utc: None,
                    media: None,
                    name: None,
                    sources: None,
                    types: Some(list_types),
                }),
            }]),
            searcher_id: None,
            assignee_id: None,
            match_status: None,
            risk_level: None,
            search_term: None,
            total_hits: None,
            total_matches: None,
            updated_at: None,
            created_at: None,
            tags: None,
            limit: None,
            offset: None,
            share_url: None,
        }),
    };
    IncodeResponse {
        result: IncodeAPIResult::Success(WatchlistResultResponse {
            status: Some("sucess".to_owned()),
            content: Some(content),
            error: None,
        }),
        raw_response: PiiJsonValue::from(json!({})),
    }
}
