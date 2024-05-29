use crate::idology::IdologyError::RequestError;
use newtypes::{
    FootprintReasonCode,
    IDologyReasonCode,
    PiiString,
    ScrubbedPiiString,
};
use serde::{
    Deserialize,
    Deserializer,
};
use std::convert::Infallible;
use std::str::FromStr;
use strum::EnumString;

/// This file holds common structures used to work with Idology APIs
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct KeyResponse {
    pub key: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Eq, PartialEq)]
pub struct IDologyQualifiers {
    pub qualifier: serde_json::Value,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct ParsedIdologyQualifier {
    pub key: String,
    pub message: Option<String>,
    pub warm_address_list: Option<String>,
}

impl IDologyQualifiers {
    pub fn parse_qualifiers(&self) -> Vec<(ParsedIdologyQualifier, IDologyReasonCode)> {
        self.raw_qualifiers()
            .into_iter()
            .filter_map(|parsed_idology_qualifier| {
                let idology_reason_code = IDologyReasonCode::from_str(parsed_idology_qualifier.key.as_str());
                match idology_reason_code {
                    Ok(i) => Some((parsed_idology_qualifier, i)),
                    Err(err) => {
                        tracing::error!(?err, "Error parsing IdologyReasonCode");
                        None
                    }
                }
            })
            .collect()
    }

    pub fn raw_qualifiers(&self) -> Vec<ParsedIdologyQualifier> {
        // In the IDology API, the key named `qualifier` can either be a list of qualifiers OR
        // a single qualifier. Parse both cases here

        let parsed_qualifiers = match self.qualifier {
            serde_json::Value::Object(_) => {
                let parsed_qualifier =
                    serde_json::value::from_value::<ParsedIdologyQualifier>(self.qualifier.clone());
                vec![parsed_qualifier]
            }
            serde_json::Value::Array(ref qualifier_list) => qualifier_list
                .iter()
                .cloned()
                .map(serde_json::value::from_value)
                .collect(),
            _ => vec![],
        };

        parsed_qualifiers
            .into_iter()
            .flat_map(|p| match p {
                Ok(q) => Some(q),
                Err(err) => {
                    tracing::error!(?err, "Error parsing Idology qualifiers");
                    None
                }
            })
            .collect()
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

/// A touch-in-cheek representation of the fact that Idology sometimes sends integers
/// OR strings in various response fields
#[derive(Deserialize)]
#[serde(untagged)]
pub enum IdologyInteger {
    Str(String),
    Int(i32),
}

pub fn from_string_or_int<'de, D, T>(deserializer: D) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
    T: TryFrom<IdologyInteger>,
{
    Ok(Option::<IdologyInteger>::deserialize(deserializer)?.and_then(|i| T::try_from(i).ok()))
}

impl TryFrom<IdologyInteger> for ScrubbedPiiString {
    type Error = Infallible;

    fn try_from(i: IdologyInteger) -> Result<Self, Self::Error> {
        match i {
            IdologyInteger::Str(s) => Ok(ScrubbedPiiString::new(PiiString::from(s))),
            IdologyInteger::Int(i) => Ok(ScrubbedPiiString::new(PiiString::from(i.to_string()))),
        }
    }
}

impl TryFrom<IdologyInteger> for String {
    type Error = Infallible;

    fn try_from(i: IdologyInteger) -> Result<Self, Self::Error> {
        match i {
            IdologyInteger::Str(s) => Ok(s),
            IdologyInteger::Int(i) => Ok(format!("{}", i)),
        }
    }
}

impl TryFrom<IdologyInteger> for i32 {
    type Error = std::num::ParseIntError;

    fn try_from(i: IdologyInteger) -> Result<Self, Self::Error> {
        match i {
            IdologyInteger::Str(s) => s.parse::<i32>(),
            IdologyInteger::Int(i) => Ok(i),
        }
    }
}

#[derive(EnumString)]
pub enum WarmAddressType {
    #[strum(serialize = "mail drop")]
    MailDrop,
    #[strum(serialize = "hospital")]
    Hospital,
    #[strum(serialize = "hotel")]
    Hotel,
    #[strum(serialize = "prison")]
    Prison,
    #[strum(serialize = "campground")]
    Campground,
    #[strum(serialize = "college")]
    College,
    #[strum(serialize = "university")]
    University,
    #[strum(serialize = "USPO")]
    USPO,
    #[strum(serialize = "General Delivery")]
    GeneralDelivery,
}

impl WarmAddressType {
    pub fn to_input_address_footprint_reason_code(&self) -> FootprintReasonCode {
        match self {
            WarmAddressType::MailDrop => FootprintReasonCode::AddressInputIsNotStandardMailDrop,
            WarmAddressType::Hospital => FootprintReasonCode::AddressInputIsNotStandardHospital,
            WarmAddressType::Hotel => FootprintReasonCode::AddressInputIsNotStandardHotel,
            WarmAddressType::Prison => FootprintReasonCode::AddressInputIsNotStandardPrison,
            WarmAddressType::Campground => FootprintReasonCode::AddressInputIsNotStandardCampground,
            WarmAddressType::College => FootprintReasonCode::AddressInputIsNotStandardCollege,
            WarmAddressType::University => FootprintReasonCode::AddressInputIsNotStandardUniversity,
            WarmAddressType::USPO => FootprintReasonCode::AddressInputIsNotStandardUspo,
            WarmAddressType::GeneralDelivery => FootprintReasonCode::AddressInputIsNotStandardGeneralDelivery,
        }
    }

    pub fn to_located_address_footprint_reason_code(&self) -> FootprintReasonCode {
        match self {
            WarmAddressType::MailDrop => FootprintReasonCode::AddressLocatedIsNotStandardMailDrop,
            WarmAddressType::Hospital => FootprintReasonCode::AddressLocatedIsNotStandardHospital,
            WarmAddressType::Hotel => FootprintReasonCode::AddressLocatedIsNotStandardHotel,
            WarmAddressType::Prison => FootprintReasonCode::AddressLocatedIsNotStandardPrison,
            WarmAddressType::Campground => FootprintReasonCode::AddressLocatedIsNotStandardCampground,
            WarmAddressType::College => FootprintReasonCode::AddressLocatedIsNotStandardCollege,
            WarmAddressType::University => FootprintReasonCode::AddressLocatedIsNotStandardUniversity,
            WarmAddressType::USPO => FootprintReasonCode::AddressLocatedIsNotStandardUspo,
            WarmAddressType::GeneralDelivery => {
                FootprintReasonCode::AddressLocatedIsNotStandardGeneralDelivery
            }
        }
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
