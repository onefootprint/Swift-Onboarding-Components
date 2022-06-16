pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize, Deserializer};
use std::str::FromStr;

#[doc = "Phone number -- must be between 10-15 digits per e164 standard"]
#[derive(
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    Display,
    From,
    Into,
    Serialize,
    Default,
    Apiv2Schema,
)]
#[serde(transparent)]
pub struct PhoneNumber(
    String
);

impl FromStr for PhoneNumber {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by removing excess chars + checking length
        let numer = s.chars().filter(|char| char.is_digit(10)).collect::<String>();
        let sanitized = match numer.len() {
            // assume if the # is too short, we intended a u.s. country code
            10 => Ok("1".to_owned() + numer.as_str()),
            // valid e.164 lengths
            11 | 12 | 13 | 14 | 15 => Ok(numer),
            _ => Err("Invalid length phone number provided"),
        }?;
        Ok(PhoneNumber(sanitized))
    }
}


impl<'de> Deserialize<'de> for PhoneNumber {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where D: Deserializer<'de>
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}


#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_id() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub phone_number: PhoneNumber
        }
        let example = "{\"phone_number\": \"123-456-7890\"}";
        let bad_example = "{\"phone_number\": \"12345\"}";

        let deserialized: Test = serde_json::from_str(example).unwrap();
        let bad_example: Result<Test, _> = serde_json::from_str(bad_example);
        assert!(bad_example.is_err());
        assert_eq!(deserialized, Test {phone_number: PhoneNumber("11234567890".to_owned())});

        let test_bad_str = "12345";
        assert!(PhoneNumber::from_str(test_bad_str).is_err())
    }
}
