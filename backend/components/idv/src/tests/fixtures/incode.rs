use crate::incode::doc::response::{
    AddConsentResponse,
    AddSelfieResponse,
    AddSideResponse,
    FetchOCRResponse,
    FetchScoresResponse,
    GetOnboardingStatusResponse,
    IncodeOcrFixtureResponseFields,
    ProcessFaceResponse,
    ProcessIdResponse,
};
use crate::incode::response::{
    self,
    OnboardingStartResponse,
};
use crate::incode::watchlist::response::{
    Content,
    Data,
    Doc,
    Hit,
    WatchlistResultResponse,
};
use crate::incode::{
    IncodeAPIResult,
    IncodeResponse,
};
use newtypes::{
    PiiJsonValue,
    PiiString,
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
        result: IncodeAPIResult::ResponseErrorHandled(res.clone()),
        raw_response: PiiJsonValue::from(serde_json::to_value(&res).unwrap()),
    }
}

pub fn add_side_response() -> IncodeResponse<AddSideResponse> {
    let raw_response = serde_json::json!({
        "sharpness": 100,
        "glare": 100,
        "horizontalResolution": 0,
        "classification": false,
        "typeOfId": "DriversLicense",
        "countryCode": "USA",
        "issueYear": 2016,
        "issueName": "USA DriversLicense DRIVERS_LICENSE",
        "sessionStatus": "Alive",
    });

    let parsed: AddSideResponse = serde_json::from_value(raw_response.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed),
        raw_response: PiiJsonValue::from(serde_json::to_value(&raw_response).unwrap()),
    }
}

pub fn add_selfie_response() -> IncodeResponse<AddSelfieResponse> {
    let raw_response = serde_json::json!({
      "age": 31,
      "isBright": true,
      "hasLenses": false,
      "confidence": 0,
      "hasFaceMask": false,
      "sessionStatus": "Alive"
    });

    let parsed: AddSelfieResponse = serde_json::from_value(raw_response.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed),
        raw_response: PiiJsonValue::from(serde_json::to_value(&raw_response).unwrap()),
    }
}

pub fn process_face_response() -> IncodeResponse<ProcessFaceResponse> {
    let raw_response = serde_json::json!({
      "confidence": 1,
      "nameMatched": null,
      "existingUser": false,
      "existingExternalId": null,
      "existingInterviewId": null
    });

    let parsed: ProcessFaceResponse = serde_json::from_value(raw_response.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed),
        raw_response: PiiJsonValue::from(serde_json::to_value(&raw_response).unwrap()),
    }
}

pub fn process_id_response() -> IncodeResponse<ProcessIdResponse> {
    let raw_response = serde_json::json!(
        {
            "success": true
          }
    );

    let parsed: ProcessIdResponse = serde_json::from_value(raw_response.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed),
        raw_response: PiiJsonValue::from(serde_json::to_value(&raw_response).unwrap()),
    }
}

pub fn add_consent_response() -> IncodeResponse<AddConsentResponse> {
    let raw_response = serde_json::json!(
        {
            "success": true
          }
    );

    let parsed: AddConsentResponse = serde_json::from_value(raw_response.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed),
        raw_response: PiiJsonValue::from(serde_json::to_value(&raw_response).unwrap()),
    }
}

pub fn fetch_scores_response() -> IncodeResponse<FetchScoresResponse> {
    // TODO parameterize
    let parsed: FetchScoresResponse = FetchScoresResponse::fixture_response(None).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed.clone()),
        raw_response: PiiJsonValue::from(serde_json::to_value(&parsed).unwrap()),
    }
}

pub fn fetch_ocr_response(
    fixture: Option<IncodeOcrFixtureResponseFields>,
) -> IncodeResponse<FetchOCRResponse> {
    // TODO parameterize
    let raw = FetchOCRResponse::fixture_response(fixture);
    let parsed: FetchOCRResponse = serde_json::from_value(raw.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed.clone()),
        raw_response: PiiJsonValue::from(raw),
    }
}

pub fn get_onboarding_status_response() -> IncodeResponse<GetOnboardingStatusResponse> {
    let raw_response = serde_json::json!({
      "onboardingStatus": "ID_VALIDATION_FINISHED"
    });

    let parsed: GetOnboardingStatusResponse = serde_json::from_value(raw_response.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed),
        raw_response: PiiJsonValue::from(serde_json::to_value(&raw_response).unwrap()),
    }
}
