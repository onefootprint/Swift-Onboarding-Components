use newtypes::IdvData;
use newtypes::PiiJsonValue;
use newtypes::TwilioLookupField;
use twilio::response::lookup::LookupV2Response;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Phone number must be provided")]
    PhoneNumberNotPopulated,
    #[error("Twilio client error: {0}")]
    Twilio(#[from] twilio::error::Error),
    #[error("Json error: {0}")]
    JsonError(#[from] serde_json::Error),
}

#[derive(Debug, thiserror::Error)]
pub enum ReqwestError {
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("error sending request to socure api: {0}")]
    SendError(String),
}

pub struct TwilioLookupV2Request {
    pub idv_data: IdvData,
    pub lookup_fields: Vec<TwilioLookupField>,
}

#[derive(Clone)]
pub struct TwilioLookupV2APIResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: LookupV2Response,
}


// TODO: migrate twilio to idv crate
#[cfg(test)]
mod tests {
    use crate::test_fixtures;
    use twilio::response::lookup::LineType;
    use twilio::response::lookup::LookupV2Response;

    #[test]
    fn test_twilio_deser() {
        let raw = test_fixtures::test_twilio_lookupv2_response();
        let res: LookupV2Response = serde_json::from_value(raw).unwrap();
        assert_eq!(
            res.line_type_intelligence.unwrap().kind.unwrap(),
            LineType::NonFixedVoip
        );
    }
}
