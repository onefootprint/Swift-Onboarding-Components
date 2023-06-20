use crate::api_schema_helper::string_api_data_type_alias;
use crate::{NtResult, PiiString};

pub use derive_more::{Add, Display, From, FromStr, Into};
use serde_with::DeserializeFromStr;
use std::fmt::Debug;
use std::str::FromStr;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Invalid phone number")]
    InvalidPhoneNumber,
    #[error("{0}")]
    ParseError(#[from] phonenumber::ParseError),
}

#[derive(Clone, DeserializeFromStr, Eq, PartialEq, Hash)]
pub struct PhoneNumber {
    number: phonenumber::PhoneNumber,
    pub sandbox_suffix: String,
}

string_api_data_type_alias!(PhoneNumber);

impl Debug for PhoneNumber {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

impl PhoneNumber {
    const FIXTURE_PHONE_NUMBER: &str = "+15555550100";

    pub fn parse(number: PiiString) -> NtResult<Self> {
        let (number, sandbox_suffix) = super::sandbox::split_sandbox_parts(number.leak())?;
        let number = phonenumber::parse(None, number).map_err(Error::from)?;
        // Should we be checking phonenumber::is_valid?
        Ok(Self {
            number,
            sandbox_suffix: sandbox_suffix.to_owned(),
        })
    }

    pub fn is_live(&self) -> bool {
        self.sandbox_suffix.is_empty()
    }

    /// Returns true for the SINGLE fake, fixture phone number we provide
    pub fn is_fixture_phone_number(&self) -> bool {
        self.e164().leak() == Self::FIXTURE_PHONE_NUMBER
    }

    // Maybe make two versions of e164: one with sandbox and one without
    pub fn e164(&self) -> PiiString {
        self.number.format().mode(phonenumber::Mode::E164).into()
    }

    /// Returns a PiiString representation of the phone number in e164 format. Includes the sandbox
    /// suffix if any
    pub fn e164_with_suffix(&self) -> PiiString {
        let e164 = self.e164();
        if self.sandbox_suffix.is_empty() {
            e164
        } else {
            PiiString::from(format!("{}#{}", e164.leak(), self.sandbox_suffix))
        }
    }

    /// Formats the PhoneNumber with all digits except the country code and last two scrubbed
    pub fn leak_formatted_last_two(&self) -> String {
        // Use the phonenumber library to format the number as a national number.
        // This includes nice formatting, aside from the country code
        let national = format!("{}", self.number.format().mode(phonenumber::Mode::National));
        let len = national.len();
        let national: String = national
            .chars()
            .enumerate()
            .map(|(i, c)| {
                if i < len - 2 && c.is_alphanumeric() {
                    // For all but the last 2 characters, if alphanumeric, scrub.
                    // This preserves formatting characters, like (, -, and spaces
                    '*'
                } else {
                    c
                }
            })
            .collect();
        // Prepend the country code to the scrubbed, formatted national
        format!("+{} {}", self.number.country().code(), national)
    }
}

impl serde::Serialize for PhoneNumber {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let s = self.e164_with_suffix();
        s.serialize(serializer)
    }
}

impl FromStr for PhoneNumber {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s.into())
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use test_case::test_case;

    #[test_case("+1-123-123-1234" => "+11231231234".to_owned(); "dashes")]
    #[test_case("+1 (123) 123-1234" => "+11231231234".to_owned(); "parens")]
    #[test_case("+1 (123)-123-1234" => "+11231231234".to_owned(); "parens2")]
    #[test_case("+1 123 123 1234" => "+11231231234".to_owned(); "spaces")]
    #[test_case("+11231231234" => "+11231231234".to_owned(); "basic")]
    #[test_case("+55 (12) 12345-1234" => "+5512123451234".to_owned(); "brazil")]
    #[test_case("+47 123 12 123" => "+4712312123".to_owned(); "norway")]
    // Sandbox should be parseable too
    #[test_case("+1-123-123-1234#blerp" => "+11231231234#blerp".to_owned(); "dashes sandbox")]
    #[test_case("+55 (12) 12345-1234#derp" => "+5512123451234#derp".to_owned(); "brazil sandbox")]
    #[test_case("+47 123 12 123#test_1" => "+4712312123#test_1".to_owned(); "norway sandbox")]
    fn test_parse(number: &str) -> String {
        let phone_number = PhoneNumber::parse(number.into()).unwrap();
        assert!(!phone_number.is_fixture_phone_number());
        phone_number.e164_with_suffix().leak_to_string()
    }

    #[test_case("+1-415-123-1234" => "+1 (***) ***-**34".to_owned(); "US")]
    #[test_case("+55 (12) 12345-1234" => "+55 (**) *****-**34".to_owned(); "brazil")]
    #[test_case("+47 913 12 123" => "+47 *** ** *23".to_owned(); "norway")]
    fn test_leak_formatted_last_two(number: &str) -> String {
        let phone_number = PhoneNumber::parse(number.into()).unwrap();
        assert!(!phone_number.is_fixture_phone_number());
        phone_number.leak_formatted_last_two()
    }

    #[test]
    fn test_sandbox() {
        let phone_number = PhoneNumber::parse("+1-123-123-1234#sandbox".into()).unwrap();
        assert_eq!(phone_number.e164_with_suffix().leak(), "+11231231234#sandbox");
        assert!(!phone_number.is_live());

        let phone_number = PhoneNumber::parse("+1-123-123-1234".into()).unwrap();
        assert_eq!(phone_number.e164_with_suffix().leak(), "+11231231234");
        assert!(phone_number.is_live());
    }

    #[test]
    fn test_fixture_number() {
        let phone_number = PhoneNumber::parse("+1-555-555-0100#sandbox".into()).unwrap();
        assert!(!phone_number.is_live());
        assert!(phone_number.is_fixture_phone_number());

        let phone_number = PhoneNumber::parse("+1-555-555-0100".into()).unwrap();
        assert!(phone_number.is_live());
        assert!(phone_number.is_fixture_phone_number());
    }
}
