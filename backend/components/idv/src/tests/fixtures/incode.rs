use crate::incode::{
    response::{self, OnboardingStartResponse},
    watchlist::response::{Content, Data, Doc, Hit, WatchlistResultResponse},
    IncodeAPIResult, IncodeResponse,
};
use newtypes::{PiiJsonValue, PiiString};

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
            ref_: Some("ref123abc".to_owned().into()),
            filters: None,
            hits: Some(vec![Hit {
                score: Some(3.3),
                is_whitelisted: None,
                match_types: Some(vec!["name_exact".to_string()]),
                match_type_details: None,
                doc: Some(Doc {
                    aka: None,
                    fields: None,
                    id: None,
                    last_updated_utc: None,
                    media: None,
                    name: Some("Bob Boberto".into()),
                    sources: None,
                    types: Some(list_types),
                }),
            }]),
            searcher_id: None,
            assignee_id: None,
            match_status: None,
            risk_level: None,
            search_term: Some("Bob Boberto".into()),
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
    let res = WatchlistResultResponse {
        status: Some("sucess".to_owned()),
        content: Some(content),
        error: None,
    };
    IncodeResponse {
        result: IncodeAPIResult::Success(res.clone()),
        raw_response: PiiJsonValue::from(serde_json::to_value(&res).unwrap()),
    }
}

pub fn watchlist_result_error_response() -> IncodeResponse<WatchlistResultResponse> {
    let res = response::Error {
        timestamp: 16953352387367i64,
        status: 4040,
        error: "Something bad happened yo".to_owned(),
        message: None,
        path: None,
    };
    IncodeResponse {
        result: IncodeAPIResult::ResponseError(res.clone()),
        raw_response: PiiJsonValue::from(serde_json::to_value(&res).unwrap()),
    }
}
