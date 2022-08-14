pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use regex::Regex;
use serde::{Deserialize, Deserializer, Serialize};
use std::str::FromStr;

use crate::{DataKind, Decomposable, NewData, PiiString};

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Default, Apiv2Schema)]
/// Email address. Will be checked against a basic regex for validity and
/// uppercased for consistency.
pub struct Email {
    pub email: PiiString,
    pub suffix: String,
}

impl Email {
    pub fn leak(&self) -> &str {
        self.email.leak()
    }

    pub fn to_piistring(&self) -> PiiString {
        if self.suffix.is_empty() {
            self.email.clone()
        } else {
            PiiString::from(format!("{}#{}", self.email.leak(), self.suffix))
        }
    }

    pub fn is_live(&self) -> bool {
        self.suffix.is_empty()
    }
}

lazy_static! {
    pub static ref EMAIL_RE: Regex =
        Regex::new(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)").unwrap();
}

impl Decomposable for Email {
    fn decompose(self) -> Vec<NewData> {
        NewData::single(DataKind::Email, self.to_piistring())
    }
}

impl std::str::FromStr for Email {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // See if there's a sandbox suffix on the domain of the email
        let parts = s.split('@').collect::<Vec<&str>>();
        if parts.len() != 2 {
            return Err(crate::Error::InvalidEmail);
        }
        let (domain, sandbox_suffix) = super::sandbox::split_sandbox_parts(parts[1])?;
        let email = vec![parts[0], domain].join("@");
        // sanitize by checking against simple regex
        // todo, do we want to try to strip out + variations for gmail accounts / standardize further?
        if !EMAIL_RE.is_match(&email) {
            return Err(crate::Error::InvalidEmail);
        }
        Ok(Email {
            // uppercase for consistency & readability
            email: PiiString::from(email.to_uppercase()),
            suffix: sandbox_suffix.to_owned(),
        })
    }
}

impl From<Email> for PiiString {
    fn from(v: Email) -> Self {
        v.to_piistring()
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
    let mut split = email.leak().split('@');
    let name = String::from_iter(split.next().unwrap().chars().map(|_| '*'));
    let domain = split.next().unwrap();
    let suffix = if !email.is_live() {
        format!("#{}", email.suffix)
    } else {
        "".to_string()
    };
    format!("{name}@{domain}{suffix}")
}

impl std::fmt::Debug for Email {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", email_fmt(self))
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    macro_rules! email_tests {
        ($($name:ident: $value:expr,)*) => {
        $(
            #[test]
            fn $name() {
                #[derive(Eq, Debug, PartialEq, Serialize, Deserialize)]
                struct Test {
                    pub email: Email,
                }
                let (input, expected_email, expected_debug) = $value;
                let email: Test = serde_json::from_str(input).expect("Could not deserialize");
                assert_eq!(email.email, expected_email);
                assert_eq!(expected_debug, format!("{:#?}", email.email));
            }
        )*
        }
    }

    email_tests! {
        good_email1: (
            "{\"email\": \"beep_boop+@gmail.com\"}",
            Email {
                email: PiiString::from("BEEP_BOOP+@GMAIL.COM"),
                suffix: "".to_owned()
            },
            "**********@GMAIL.COM",
        ),
        good_email2: (
            "{\"email\": \"yoooooo.o.o@biz.real#sandbox1\"}",
            Email {
                email: PiiString::from("YOOOOOO.O.O@BIZ.REAL"),
                suffix: "sandbox1".to_owned()
            },
            "***********@BIZ.REAL#sandbox1",
        ),
        good_email3: (
            "{\"email\": \"flerpderpmerp@onefootprint.com#1\"}",
            Email {
                email: PiiString::from( "FLERPDERPMERP@ONEFOOTPRINT.COM"),
                suffix: "1".to_owned()
            },
            "*************@ONEFOOTPRINT.COM#1",
        ),
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
