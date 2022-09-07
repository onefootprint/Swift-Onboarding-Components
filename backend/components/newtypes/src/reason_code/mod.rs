mod idology;
mod signal;
mod signal_attribute;

use std::str::FromStr;

pub use idology::*;
pub use signal::*;
pub use signal_attribute::*;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(try_from = "&str")]
#[serde(untagged)]
pub enum ReasonCode {
    IDology(IDologyReasonCode),
    Other(String),
}

impl FromStr for ReasonCode {
    type Err = crate::Error;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        Self::try_from(value)
    }
}

impl TryFrom<&str> for ReasonCode {
    type Error = crate::Error;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value = if let Ok(value) = IDologyReasonCode::from_str(value) {
            ReasonCode::IDology(value)
        } else {
            ReasonCode::Other(value.to_owned())
        };
        Ok(value)
    }
}

impl ToString for ReasonCode {
    fn to_string(&self) -> String {
        match self {
            ReasonCode::IDology(idology) => idology.to_string(),
            ReasonCode::Other(s) => s.to_owned(),
        }
    }
}

impl ReasonCode {
    pub fn signal(self) -> Signal {
        match self {
            ReasonCode::IDology(idology) => idology.signal(),
            ReasonCode::Other(_) => Signal {
                kind: SignalKind::TODO,
                attributes: vec![],
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::*;

    #[test_case("idphone.not.available" => ReasonCode::IDology(IDologyReasonCode::PhoneNumberIsUnlistedOrUnavailable))]
    #[test_case("resultcode.coppa.alert" => ReasonCode::IDology(IDologyReasonCode::CoppaAlert))]
    #[test_case("flerpderp" => ReasonCode::Other("flerpderp".to_owned()))]
    fn test_deserialize(input: &str) -> ReasonCode {
        ReasonCode::from_str(input).unwrap()
    }

    #[test_case(ReasonCode::IDology(IDologyReasonCode::PhoneNumberIsUnlistedOrUnavailable) => r#""idphone.not.available""#)]
    #[test_case(ReasonCode::IDology(IDologyReasonCode::CoppaAlert) => r#""resultcode.coppa.alert""#)]
    #[test_case(ReasonCode::Other("flerpderp".to_owned()) => r#""flerpderp""#)]
    fn test_serialize(input: ReasonCode) -> String {
        serde_json::ser::to_string(&input).unwrap()
    }
}
