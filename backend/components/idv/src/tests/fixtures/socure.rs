use newtypes::PiiJsonValue;

use crate::socure::{response::SocureIDPlusResponse, SocureIDPlusAPIResponse};

pub fn create_response() -> SocureIDPlusAPIResponse {
    let parsed_response = SocureIDPlusResponse {
        reference_id: "123".to_string(),
        ..Default::default()
    };
    SocureIDPlusAPIResponse {
        raw_response: PiiJsonValue::from(serde_json::to_value(&parsed_response).unwrap()),
        parsed_response,
    }
}
