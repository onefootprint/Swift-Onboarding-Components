pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use regex::Regex;
use serde::{Deserialize, Deserializer, Serialize};
use std::str::FromStr;

#[doc = "Email address"]
#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
#[serde(transparent)]
/// Email address. Will be checked against a basic regex for validity and
/// uppercased for consistency.
pub struct Email(String);

lazy_static! {
    pub static ref EMAIL_RE: Regex =
        Regex::new(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)").unwrap();
}

impl std::str::FromStr for Email {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // sanitize by checking against simple regex
        // todo, do we want to try to strip out + variations for gmail accounts / standardize further?
        if !EMAIL_RE.is_match(s) {
            return Err(crate::Error::InvalidEmail);
        }
        // lowercase for consistency & readability
        Ok(Email(s.to_string().to_uppercase()))
    }
}

impl<'de> Deserialize<'de> for Email {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        FromStr::from_str(&s).map_err(serde::de::Error::custom)
    }
}

fn email_fmt(email: &Email) -> String {
    let mut split = email.0.split('@');
    let name = String::from_iter(split.next().unwrap().chars().map(|_| '*'));
    let domain = split.next().unwrap();
    format!("{name}@{domain}")
}

impl std::fmt::Display for Email {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", email_fmt(self))
    }
}

impl std::fmt::Debug for Email {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", email_fmt(self))
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_email() {
        #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
        struct Test {
            pub email: Email,
        }
        let example_1 = "{\"email\": \"beep_boop+@gmail.com\"}";
        let example_2 = "{\"email\": \"yoooooo.o.o@biz.real\"}";

        let deserialized_good_1: Test = serde_json::from_str(example_1).unwrap();
        let deserialized_good_2: Test = serde_json::from_str(example_2).unwrap();

        let email_1 = &deserialized_good_1.email;
        let email_2 = &deserialized_good_2.email;

        assert_eq!(
            deserialized_good_1,
            Test {
                email: Email("BEEP_BOOP+@GMAIL.COM".to_owned())
            }
        );
        assert_eq!(
            deserialized_good_2,
            Test {
                email: Email("YOOOOOO.O.O@BIZ.REAL".to_owned())
            }
        );
        assert_eq!(format!("{email_1:#?}"), "**********@GMAIL.COM");
        assert_eq!(format!("{email_2:#?}"), "***********@BIZ.REAL");

        let bad_examples = vec![
            "{\"email\": \"12345a@\"}",
            "{\"email\": \"12345a@dot\"}",
            "{\"email\": \"@dot.com\"}",
            "{\"email\": \"???\"}",
        ];

        let bad_deserialized: Vec<Result<Email, serde_json::Error>> =
            bad_examples.into_iter().map(serde_json::from_str).collect();

        for v in bad_deserialized {
            assert!(v.is_err());
        }
    }
}
