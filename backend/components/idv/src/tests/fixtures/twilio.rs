use crate::twilio::TwilioLookupV2APIResponse;
use newtypes::{
    PiiJsonValue,
    PiiString,
    ScrubbedPiiString,
};
use twilio::response::lookup::LookupV2Response;

pub fn create_response() -> TwilioLookupV2APIResponse {
    let parsed_response = LookupV2Response {
        valid: None,
        country_code: "US".to_string(),
        national_format: ScrubbedPiiString::new(PiiString::new("".to_string())),
        phone_number: ScrubbedPiiString::new(PiiString::new("".to_string())),
        add_ons: None,
        url: ScrubbedPiiString::new(PiiString::new("".to_string())),
        carrier: None,
        call_forwarding: None,
        live_activity: None,
        sim_swap: None,
        caller_name: None,
        line_type_intelligence: None,
        name_str_distance: None,
    };
    TwilioLookupV2APIResponse {
        raw_response: PiiJsonValue::from(serde_json::to_value(&parsed_response).unwrap()),
        parsed_response,
    }
}
