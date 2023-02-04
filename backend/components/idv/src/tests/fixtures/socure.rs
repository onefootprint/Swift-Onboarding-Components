use newtypes::PiiJsonValue;
use serde_json::json;

use crate::socure::{response::SocureIDPlusResponse, SocureIDPlusAPIResponse};

pub fn create_response() -> SocureIDPlusAPIResponse {
    SocureIDPlusAPIResponse {
        raw_response: PiiJsonValue::from(json!({})),
        parsed_response: SocureIDPlusResponse {
            reference_id: "123".to_string(),
            ..Default::default()
        },
    }
}
