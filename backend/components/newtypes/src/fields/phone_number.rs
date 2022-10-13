use crate::{PhoneError, PiiString};

pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::v2::schema::TypedData;
use serde::{Deserialize, Deserializer, Serialize};
use std::fmt::Debug;
use std::marker::PhantomData;
use std::str::FromStr;

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default)]
/// Phone number string. Must be valid e164 length and include a country code
pub struct PhoneNumber {
    pub number: PiiString,
    pub suffix: String,
}

impl TypedData for PhoneNumber {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }
}

impl PhoneNumber {
    pub fn leak(&self) -> &str {
        self.number.leak()
    }

    fn is_live(&self) -> bool {
        self.suffix.is_empty()
    }
}

impl From<PhoneNumber> for PiiString {
    fn from(phone: PhoneNumber) -> Self {
        if phone.suffix.is_empty() {
            phone.number
        } else {
            PiiString::from(format!("{}#{}", phone.number.leak(), phone.suffix))
        }
    }
}

fn sanitize_phone(s: &str) -> Result<String, PhoneError> {
    // else check valid digits + e164 lengths
    let number = s.chars().filter(|c| c.is_ascii_digit()).collect::<String>();
    match number.len() {
        7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 => Ok(number),
        _ => Err(crate::PhoneError::InvalidPhoneNumber),
    }
}

impl FromStr for PhoneNumber {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (number, sandbox_suffix) = super::sandbox::split_sandbox_parts(s)?;
        let sanitized = sanitize_phone(number)?;
        Ok(PhoneNumber {
            number: PiiString::from(format!("+{}", sanitized)),
            suffix: sandbox_suffix.to_owned(),
        })
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
    let number = phone.number.leak();
    let skip = number.len() - 2;
    let phone_str = format!(
        "{}{}",
        "*".repeat(skip),
        phone.number.leak().chars().skip(skip).collect::<String>()
    );
    let suffix = if !phone.is_live() {
        format!("#{}", phone.suffix)
    } else {
        "".to_string()
    };
    format!("{phone_str}{suffix}")
}

impl Debug for PhoneNumber {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", phone_fmt(self))
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
/// Validated phone number string. Only output from the twilio client
/// iso_country_code is two digit country code for e164 formatted number,
/// such as "US" or "CH"
pub struct ValidatedPhoneNumber {
    pub e164: PiiString,
    pub iso_country_code: PiiString,
    pub suffix: String,
    phantom: PhantomData<()>,
}

impl From<ValidatedPhoneNumber> for PiiString {
    fn from(v: ValidatedPhoneNumber) -> Self {
        v.to_piistring()
    }
}

impl ValidatedPhoneNumber {
    pub fn without_us_country_code(&self) -> PiiString {
        if self.iso_country_code.equals("US") {
            return self
                .e164
                .leak()
                .strip_prefix("+1")
                .map(PiiString::from)
                .unwrap_or_else(|| self.e164.clone());
        }
        self.e164.clone()
    }

    pub fn to_piistring(&self) -> PiiString {
        if self.suffix.is_empty() {
            self.e164.clone()
        } else {
            PiiString::from(format!("{}#{}", self.e164.leak(), self.suffix))
        }
    }

    pub fn is_live(&self) -> bool {
        self.suffix.is_empty()
    }

    pub fn leak_last_two(&self) -> String {
        let mut phone_number = self.e164.leak().to_owned();
        let len = phone_number.len();
        phone_number.drain((len - 2)..len).into_iter().collect()
    }
}

impl Debug for ValidatedPhoneNumber {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let number = self.e164.leak();
        let skip = number.len() - 2;

        let phone_number = format!(
            "{}{}",
            "*".repeat(skip),
            number.chars().skip(skip).collect::<String>()
        );
        let suffix = if !self.is_live() {
            format!("#{}", self.suffix)
        } else {
            "".to_owned()
        };
        let out = format!("{phone_number}{suffix}");
        std::fmt::Display::fmt(&out, f)
    }
}

impl ValidatedPhoneNumber {
    /// escape hatch for constructing a known validated phone number
    pub fn __build(e164: String, iso_country_code: String, suffix: String) -> Self {
        Self {
            e164: PiiString::from(e164),
            iso_country_code: PiiString::from(iso_country_code),
            suffix,
            phantom: PhantomData,
        }
    }

    pub fn __build_from_vault(number: PiiString, iso_country_code: PiiString) -> Result<Self, crate::Error> {
        let number = PhoneNumber::from_str(number.leak())?;
        Ok(Self {
            e164: number.number,
            iso_country_code,
            suffix: number.suffix,
            phantom: PhantomData,
        })
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
        let example = "{\"phone_number\": \"+1-123-456-7890\"}";
        let example_1 = "{\"phone_number\": \"1-123-456-7890\"}";

        let bad_example = "{\"phone_number\": \"12345\"}";

        let deserialized: Test = serde_json::from_str(example).unwrap();
        let deserialized_1: Test = serde_json::from_str(example_1).unwrap();
        let bad_example: Result<Test, _> = serde_json::from_str(bad_example);
        assert!(bad_example.is_err());
        assert_eq!(
            deserialized,
            Test {
                phone_number: PhoneNumber {
                    number: PiiString::from("+11234567890".to_owned()),
                    suffix: "".to_string()
                }
            }
        );
        assert_eq!(
            deserialized_1,
            Test {
                phone_number: PhoneNumber {
                    number: PiiString::from("+11234567890".to_owned()),
                    suffix: "".to_string()
                }
            }
        );

        let test_bad_str = "12345";
        assert!(PhoneNumber::from_str(test_bad_str).is_err());

        assert_eq!(format!("{:#?}", deserialized.phone_number), "**********90");
    }

    #[test]
    fn test_sandbox() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub phone_number: PhoneNumber,
        }
        let example = "{\"phone_number\": \"1-123-456-7890#abc\"}";
        let example_2 = "{\"phone_number\": \"12345#123\"}";
        let example_3 = "{\"phone_number\": \"123#456#789\"}";

        let deserialized: Test = serde_json::from_str(example).unwrap();
        let example_2: Result<Test, _> = serde_json::from_str(example_2);
        let example_3: Result<Test, _> = serde_json::from_str(example_3);
        assert!(example_2.is_err());
        assert!(example_3.is_err());

        assert_eq!(
            deserialized,
            Test {
                phone_number: PhoneNumber {
                    number: PiiString::from("+11234567890".to_owned()),
                    suffix: "abc".to_string()
                }
            }
        );

        let test_bad_str = "12345";
        assert!(PhoneNumber::from_str(test_bad_str).is_err());

        assert_eq!(format!("{:#?}", deserialized.phone_number), "**********90#abc");
    }
}
