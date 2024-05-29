use crate::api_schema_helper::string_api_data_type_alias;
use crate::{
    NtResult,
    PiiString,
};
use phonenumber::country::Id as CountryId;
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
}

string_api_data_type_alias!(PhoneNumber);

impl Debug for PhoneNumber {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

impl PhoneNumber {
    const FIXTURE_PHONE_NUMBER: &'static str = "+15555550100";
    const FIXTURE_PHONE_NUMBER2: &'static str = "+15555550111";

    pub fn parse(number: PiiString) -> NtResult<Self> {
        let number = phonenumber::parse(None, number.leak()).map_err(Error::from)?;
        // Should we be checking phonenumber::is_valid?
        Ok(Self { number })
    }

    /// Returns true for the SINGLE fake, fixture phone number we provide
    pub fn is_fixture_phone_number(&self) -> bool {
        self.e164().leak() == Self::FIXTURE_PHONE_NUMBER || self.e164().leak() == Self::FIXTURE_PHONE_NUMBER2
    }

    // Maybe make two versions of e164: one with sandbox and one without
    pub fn e164(&self) -> PiiString {
        self.number
            .format()
            .mode(phonenumber::Mode::E164)
            .to_string()
            .into()
    }

    pub fn country_code(&self) -> PiiString {
        self.number.country().code().to_string().into()
    }

    pub fn subscriber_number(&self) -> PiiString {
        self.national()
            .leak()
            .chars()
            .filter(|c| c.is_numeric())
            .collect::<String>()
            .into()
    }

    fn national(&self) -> PiiString {
        self.number
            .format()
            .mode(phonenumber::Mode::National)
            .to_string()
            .into()
    }

    /// Formats the PhoneNumber with all digits except the country code and last two scrubbed
    pub fn scrubbed(&self) -> PiiString {
        // Use the phonenumber library to format the number as a national number.
        // This includes nice formatting, aside from the country code
        let national = self.national();
        let len = national.len();
        let national: String = national
            .leak_to_string()
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
        PiiString::new(format!("+{} {}", self.number.country().code(), national))
    }
}

impl serde::Serialize for PhoneNumber {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let s = self.e164();
        s.serialize(serializer)
    }
}

impl FromStr for PhoneNumber {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s.into())
    }
}

impl PhoneNumber {
    const PREFER_WHATSAPP_COUNTRIES: &'static [CountryId] = &[CountryId::MX, CountryId::BR];

    /// Returns true if we decide the country of this phone number prefers to receive messages
    /// via WhatsApp over SMS
    pub fn prefers_whatsapp(&self) -> bool {
        self.number
            .country()
            .id()
            .is_some_and(|c| Self::PREFER_WHATSAPP_COUNTRIES.contains(&c))
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
    fn test_parse(number: &str) -> String {
        let phone_number = PhoneNumber::parse(number.into()).unwrap();
        assert!(!phone_number.is_fixture_phone_number());
        phone_number.e164().leak_to_string()
    }

    #[test_case("+1-415-123-1234" => "+1 (***) ***-**34".to_owned(); "US")]
    #[test_case("+55 (12) 12345-1234" => "+55 (**) *****-**34".to_owned(); "brazil")]
    #[test_case("+47 913 12 123" => "+47 *** ** *23".to_owned(); "norway")]
    fn test_leak_formatted_last_two(number: &str) -> String {
        let phone_number = PhoneNumber::parse(number.into()).unwrap();
        assert!(!phone_number.is_fixture_phone_number());
        phone_number.scrubbed().leak_to_string()
    }

    #[test_case("+1-415-123-1234" => "4151231234".to_owned(); "US")]
    #[test_case("+55 (12) 12345-1234" => "12123451234".to_owned(); "brazil")]
    #[test_case("+47 913 12 123" => "91312123".to_owned(); "norway")]
    fn test_subscriber_number(number: &str) -> String {
        let phone_number = PhoneNumber::parse(number.into()).unwrap();
        phone_number.subscriber_number().leak_to_string()
    }

    #[test_case("+1-415-123-1234" => false)]
    #[test_case("+55 (12) 12345-1234" => true)]
    #[test_case(" +52 55 1254 5678" => true)]
    #[test_case("+47 913 12 123" => false)]
    fn test_prefers_whatsapp(number: &str) -> bool {
        let phone_number = PhoneNumber::parse(number.into()).unwrap();
        phone_number.prefers_whatsapp()
    }

    #[test]
    fn test_fixture_number() {
        let phone_number = PhoneNumber::parse("+1-555-555-0100".into()).unwrap();
        assert!(phone_number.is_fixture_phone_number());
    }
}
