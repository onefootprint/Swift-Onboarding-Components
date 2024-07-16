use crate::PiiJsonValue;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;


/// This struct is used to scrub an _entire_ json response for saving
#[derive(Clone, Serialize, Deserialize, Default)]
pub struct ScrubbedPiiVendorResponse(PiiJsonValue);
impl ScrubbedPiiVendorResponse {
    pub fn new<T: serde::Serialize>(s: T) -> Result<Self, serde_json::Error> {
        let val = serde_json::to_value(s)?;
        Ok(Self(val.into()))
    }

    pub fn inner(self) -> PiiJsonValue {
        self.0
    }
}

impl From<serde_json::Value> for ScrubbedPiiVendorResponse {
    fn from(v: serde_json::Value) -> Self {
        Self(PiiJsonValue::from(v))
    }
}

impl From<ScrubbedPiiVendorResponse> for PiiJsonValue {
    fn from(s: ScrubbedPiiVendorResponse) -> Self {
        Self(s.into())
    }
}

impl From<ScrubbedPiiVendorResponse> for serde_json::Value {
    fn from(s: ScrubbedPiiVendorResponse) -> Self {
        s.0.into_leak()
    }
}

impl Debug for ScrubbedPiiVendorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ScrubbedPiiJsonResponse")
            .field("data", &"<redacted>")
            .finish()
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::ScrubbedPiiJsonValue;

    #[derive(Deserialize, Serialize, Debug)]
    pub struct SomeVendorResponse {
        pub pii: ScrubbedPiiJsonValue,
    }

    #[derive(Deserialize, Serialize, Debug)]
    pub struct NewVerificationResultRow {
        pub response: ScrubbedPiiVendorResponse,
    }

    #[test]
    fn test_response_scrubbing() {
        let raw = serde_json::json!({
            "pii": "SSN 12345"
        });
        let deserialized: SomeVendorResponse = serde_json::from_value(raw).unwrap();
        let serialized = ScrubbedPiiVendorResponse::new(deserialized).unwrap();
        let row = NewVerificationResultRow { response: serialized };
        let serialized_row = serde_json::to_string(&row).unwrap();

        assert_eq!(serialized_row, "{\"response\":{\"pii\":\"<SCRUBBED Value>\"}}")
    }
}
