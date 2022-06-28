pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Deserializer, Serialize};
use std::fmt::{Debug, Display};
use std::str::FromStr;

#[doc = "Phone number -- must be between 7-15 digits per e164 standard and include a country code"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
#[serde(transparent)]
/// Phone number string. Must be valid e164 length and include a country code
pub struct PhoneNumber(String);

impl PhoneNumber {
    pub fn leak_to_string(self) -> String {
        self.0
    }
}

impl FromStr for PhoneNumber {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let number = s.chars().filter(|char| char.is_digit(10)).collect::<String>();
        let sanitized = match number.len() {
            7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 => Ok(number),
            _ => Err(crate::Error::InvalidPhoneNumber),
        }?;
        Ok(PhoneNumber(sanitized))
    }
}

impl<'de> Deserialize<'de> for PhoneNumber {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

fn phone_fmt(phone: &PhoneNumber) -> String {
    let skip = phone.0.len() - 2;

    format!(
        "{}{}",
        "*".repeat(skip),
        phone.0.chars().skip(skip).collect::<String>()
    )
}

impl Display for PhoneNumber {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", phone_fmt(self))
    }
}

impl Debug for PhoneNumber {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", phone_fmt(self))
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_number() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub phone_number: PhoneNumber,
        }
        let example = "{\"phone_number\": \"1-123-456-7890\"}";
        let bad_example = "{\"phone_number\": \"12345\"}";

        let deserialized: Test = serde_json::from_str(example).unwrap();
        let bad_example: Result<Test, _> = serde_json::from_str(bad_example);
        assert!(bad_example.is_err());
        assert_eq!(
            deserialized,
            Test {
                phone_number: PhoneNumber("11234567890".to_owned())
            }
        );

        let test_bad_str = "12345";
        assert!(PhoneNumber::from_str(test_bad_str).is_err());

        let test_bad_str2 = "+49 17629716301";
        let val = PhoneNumber::from_str(test_bad_str2).unwrap();
        assert!(val == PhoneNumber("4917629716301".to_owned()));

        assert_eq!(format!("{:#?}", deserialized.phone_number), "*********90");
    }
}
