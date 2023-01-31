use crate::api_schema_helper::string_api_data_type_alias;
use crate::PiiString;

pub use derive_more::{Add, Display, From, FromStr, Into};
use serde_with::DeserializeFromStr;
use std::fmt::Debug;
use std::marker::PhantomData;
use std::str::FromStr;

#[derive(Debug, Clone, Hash, PartialEq, Eq, Default, DeserializeFromStr)]
/// Phone number string. Must be valid e164 length and include a country code
pub struct PhoneNumber {
    pub number: PiiString,
    pub suffix: String,
}

string_api_data_type_alias!(PhoneNumber);

impl PhoneNumber {
    pub fn leak(&self) -> &str {
        self.number.leak()
    }

    #[allow(dead_code)]
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

fn sanitize_phone(s: &str) -> Result<String, crate::Error> {
    // else check valid digits + e164 lengths
    let number = s.chars().filter(|c| c.is_ascii_digit()).collect::<String>();
    match number.len() {
        7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 => Ok(number),
        _ => Err(crate::Error::InvalidPhoneNumber),
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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
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
    use serde::Deserialize;

    #[test]
    fn test_number() {
        #[derive(Eq, Debug, PartialEq, Deserialize)]
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
    }

    #[test]
    fn test_sandbox() {
        #[derive(Eq, Debug, PartialEq, Deserialize)]
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
    }
}
