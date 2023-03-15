use crate::idology::common::response::{IDologyQualifiers, KeyResponse};
use crate::idology::expectid::response::{ExpectIDResponse, Response};
use crate::idology::IdologyExpectIDAPIResponse;
use newtypes::PiiJsonValue;
use serde_json::json;

pub fn create_response(results: String, qualifier: Option<String>) -> IdologyExpectIDAPIResponse {
    IdologyExpectIDAPIResponse {
        raw_response: PiiJsonValue::from(json!({})),
        parsed_response: ExpectIDResponse {
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
        },
    }
}
