use crate::idology::common::response::{IDologyQualifiers, KeyResponse};
use crate::idology::expectid::response::{ExpectIDResponse, Response};
use crate::idology::pa;
use crate::idology::IdologyExpectIDAPIResponse;
use newtypes::PiiJsonValue;
use serde_json::json;

pub fn create_response(results: String, qualifier: Option<String>) -> IdologyExpectIDAPIResponse {
    let parsed_response = ExpectIDResponse {
        response: Response {
            qualifiers: qualifier.map(|q| IDologyQualifiers {
                qualifier: json!({ "key": q }),
            }),
            results: Some(KeyResponse { key: results }),
            summary_result: None,
            id_number: None,
            id_scan: None,
            error: None,
            restriction: None,
        },
    };
    IdologyExpectIDAPIResponse {
        raw_response: PiiJsonValue::from(serde_json::to_value(&parsed_response).unwrap()),
        parsed_response,
    }
}

pub fn create_response_pa_hit() -> pa::IdologyPaAPIResponse {
    let parsed_response = pa::response::PaResponse {
        response: pa::response::Response {
            restriction: Some(crate::idology::expectid::response::Restriction {
                key: Some("global.watch.list".to_owned()),
                pa: Some(json!({"dob":"09291967","list":"Office of Foreign Asset Control","score":100})),
                ..Default::default()
            }),
            ..Default::default()
        },
    };
    pa::IdologyPaAPIResponse {
        raw_response: PiiJsonValue::from(serde_json::to_value(&parsed_response).unwrap()),
        parsed_response,
    }
}

pub fn create_response_pa_no_hit() -> pa::IdologyPaAPIResponse {
    let parsed_response = pa::response::PaResponse {
        response: pa::response::Response {
            restriction: Some(crate::idology::expectid::response::Restriction {
                key: Some("global.watch.list.no.match".to_owned()),
                ..Default::default()
            }),
            ..Default::default()
        },
    };
    pa::IdologyPaAPIResponse {
        raw_response: PiiJsonValue::from(serde_json::to_value(&parsed_response).unwrap()),
        parsed_response,
    }
}

pub fn error_response_json() -> serde_json::Value {
    serde_json::json!(
        {
        "response":
            {
                "error": "Your IP address is not registered. Please contact IDology Customer Service at 866-520-1234 or email customerservice@idology.com",
                "id-scan": null,
                "results": null,
                "id-number": null,
                "qualifiers": null,
                "restriction": null,
                "summary-result": null
            }
        }
    )
}
