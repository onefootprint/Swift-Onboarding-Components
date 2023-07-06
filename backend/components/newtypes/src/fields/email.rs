pub use derive_more::{Add, From, FromStr, Into};
use regex::Regex;
use serde_with::DeserializeFromStr;

use crate::{api_schema_helper::string_api_data_type_alias, PiiString};

#[derive(Debug, Clone, Hash, PartialEq, Eq, DeserializeFromStr, Default)]
/// Email address. Will be checked against a basic regex for validity and
/// uppercased for consistency.
pub struct Email {
    pub email: PiiString,
}

string_api_data_type_alias!(Email);

impl Email {
    pub fn leak(&self) -> &str {
        self.email.leak()
    }

    pub fn to_piistring(&self) -> PiiString {
        self.email.clone()
    }
}

lazy_static! {
    pub static ref EMAIL_RE: Regex =
        Regex::new(r"(^[a-zA-Z0-9_.+\-!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)").unwrap();
}

impl serde::Serialize for Email {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let s = self.to_piistring();
        s.serialize(serializer)
    }
}

impl std::str::FromStr for Email {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // ALL emails are case insensitive
        let s = s.trim().to_lowercase();
        // sanitize by checking against simple regex
        // todo, do we want to try to strip out + variations for gmail accounts / standardize further?
        if !EMAIL_RE.is_match(&s) {
            return Err(crate::Error::InvalidEmail);
        }
        Ok(Email {
            email: PiiString::from(s),
        })
    }
}

impl From<Email> for PiiString {
    fn from(v: Email) -> Self {
        v.to_piistring()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case("beep_boop+@gmail.com" => Email {
        email: PiiString::from("beep_boop+@gmail.com"),
    })]
    #[test_case("yoooooo.o.o@biz.real" => Email {
        email: PiiString::from("yoooooo.o.o@biz.real"),
    })]
    #[test_case("flerpderpmerp@onefootprint.com" => Email {
        email: PiiString::from("flerpderpmerp@onefootprint.com"),
    })]
    #[test_case("example#@gmail.com" => Email {
        email: PiiString::from("example#@gmail.com"),
    })]
    fn test_email(input: &str) -> Email {
        Email::from_str(input).expect("Could not parse")
    }

    #[test_case("flerpderpmerp@onefootprint.com" => true)]
    #[test_case("flerpderpmerp!_sdf@onefootprint.com" => true)]
    #[test_case("abcABC098_.+-!#$%&'*+-/=?^_`{|}~@onefootprint.com" => true)]
    #[test_case("abcABC098_ .+-!#$%&'*+-/=?^_`{|}~@onefootprint.com" => false)]
    fn test_parse(input: &str) -> bool {
        Email::from_str(input).is_ok()
    }

    #[test]
    fn test_bad_email() {
        let bad_examples = vec![
            "{\"email\": \"12345a@\"}",
            "{\"email\": \"12345a@dot\"}",
            "{\"email\": \"@dot.com\"}",
            "{\"email\": \"???\"}",
            "{\"email\": \"bad@sandbox.com#\"}",
        ];

        let bad_deserialized: Vec<Result<Email, serde_json::Error>> =
            bad_examples.into_iter().map(serde_json::from_str).collect();

        for v in bad_deserialized {
            assert!(v.is_err());
        }
    }
}
