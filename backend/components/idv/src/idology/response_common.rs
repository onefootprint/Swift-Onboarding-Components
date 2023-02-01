use std::str::FromStr;

use newtypes::IDologyReasonCode;

use super::error::RequestError;

/// This file holds common structures used to work with Idology APIs
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct KeyResponse {
    pub key: String,
}

impl KeyResponse {
    fn parse_key(value: serde_json::Value) -> Option<String> {
        let response: Self = serde_json::value::from_value(value).ok()?;
        Some(response.key)
    }
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct IDologyQualifiers {
    pub qualifier: serde_json::Value,
}

impl IDologyQualifiers {
    pub fn parse_qualifiers(&self) -> Vec<IDologyReasonCode> {
        self.raw_qualifiers()
            .iter()
            .filter_map(|s| IDologyReasonCode::from_str(s.as_str()).ok())
            .collect()
    }

    pub fn raw_qualifiers(&self) -> Vec<String> {
        // In the IDology API, the key named `qualifier` can either be a list of qualifiers OR
        // a single qualifier. Parse both cases here
        match self.qualifier {
            serde_json::Value::Object(_) => {
                if let Some(qualifier_key) = KeyResponse::parse_key(self.qualifier.clone()) {
                    vec![qualifier_key]
                } else {
                    vec![]
                }
            }
            serde_json::Value::Array(ref qualifier_list) => qualifier_list
                .iter()
                .cloned()
                .flat_map(KeyResponse::parse_key)
                .collect(),
            _ => vec![],
        }
    }
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct SubmissionResponseError {
    pub error: Option<String>,
}
pub struct IdologyResponseHelpers;
impl IdologyResponseHelpers {
    pub fn parse_idology_error(error: String) -> RequestError {
        RequestError::from(error)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case("Invalid Username or Password".into() => RequestError::InvalidUserNameOrPassword)]
    #[test_case("Your IP Address is not registered, please provide a lock of hair to the Gods to pay the eternal price of registration".into() => RequestError::IpAddressNotRegistered)]
    #[test_case("Sorry no can do".into() => RequestError::UnknownError("Sorry no can do".into()))]
    fn test_parse_idology_error(error: String) -> RequestError {
        IdologyResponseHelpers::parse_idology_error(error)
    }
}
