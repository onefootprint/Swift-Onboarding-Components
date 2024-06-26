use crate::api_schema_helper::string_api_data_type_alias;
use crate::PiiString;
use lazy_static::lazy_static;
use regex::Regex;
use serde_with::DeserializeFromStr;

/// Findigs wants some of their own emails to always produce a fixture PIN code for their own
/// internal QA testing
fn findigs_fixture_email_re() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"^qauserfootprint\+[A-Za-z0-9]+@findigs\.com$").unwrap()
}

fn example_com_regex() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"^[A-Za-z0-9._%+-]+@example\.com$").unwrap()
}

lazy_static! {
    pub static ref FINDIGS_FIXTURE_EMAIL_RE: Regex = findigs_fixture_email_re();
    pub static ref EXAMPLE_COM_REGEX: Regex = example_com_regex();
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, DeserializeFromStr, Default)]
/// Email address. Will be checked against a basic regex for validity and
/// uppercased for consistency.
pub struct Email {
    pub email: PiiString,
}

string_api_data_type_alias!(Email);

impl Email {
    const FIXTURE_EMAIL: &'static str = "sandbox@onefootprint.com";
    const FIXTURE_EMAIL2: &'static str = "sandbox2@onefootprint.com";

    pub fn leak(&self) -> &str {
        self.email.leak()
    }

    pub fn to_piistring(&self) -> PiiString {
        self.email.clone()
    }

    pub fn domain(&self) -> String {
        // it's ok for unchecked because we validated this already
        email_address::EmailAddress::new_unchecked(self.leak())
            .domain()
            .to_string()
    }

    pub fn is_fixture(&self) -> bool {
        self.email.leak() == Self::FIXTURE_EMAIL
            || self.email.leak() == Self::FIXTURE_EMAIL2
            || FINDIGS_FIXTURE_EMAIL_RE.is_match(self.email.leak())
            || EXAMPLE_COM_REGEX.is_match(self.email.leak())
    }

    /// Formats the Email with most scrubbed - just first letter of email and first letter of domain
    pub fn scrubbed(&self) -> PiiString {
        let domain_idx = self.email.leak().rfind('@');
        let last_dot_idx = self.email.leak().rfind('.');
        let last_dot_idx = if domain_idx.zip(last_dot_idx).is_some_and(|(x, y)| y < x) {
            // If the last dot isn't part of the domain, don't show anything after the dot
            None
        } else {
            last_dot_idx
        };
        let value: String = self
            .email
            .leak()
            .chars()
            .enumerate()
            .map(|(i, c)| {
                // Take the first character of the email
                let is_first_char = i == 0;
                // Take the first character of the domain
                let is_first_domain_char = domain_idx.is_some_and(|idx| i == idx || i == idx + 1);
                // Take the entire last subdomain (like .com)
                let is_after_last_dot = last_dot_idx.is_some_and(|idx| i >= idx);
                if is_first_char || is_first_domain_char || is_after_last_dot {
                    c
                } else {
                    '*'
                }
            })
            .collect();
        PiiString::new(value)
    }
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
        // todo, do we want to try to strip out + variations for gmail accounts / standardize further?

        if let Err(e) = email_address::EmailAddress::from_str(&s) {
            return Err(crate::Error::InvalidEmail(e));
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
    #[test_case("ç+example@gmail.com" => true)]
    #[test_case("flerp@derp.com#sandbox" => true)]
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

    #[test_case("sandbox@onefootprint.com" => true)]
    #[test_case("sandbox2@onefootprint.com" => true)]
    #[test_case("sandbox3@onefootprint.com" => false)]
    #[test_case("hayesvalley@gmail.com" => false)]
    #[test_case("qauserfootprint+123@findigs.com" => true)]
    #[test_case("qauserfootprint+ABcd098@findigs.com" => true)]
    #[test_case("qauserfootprint+123@findigs.co" => false)]
    #[test_case("xxxqauserfootprint+123@findigs.com" => false)]
    fn test_is_fixture(input: &str) -> bool {
        Email::from_str(input).unwrap().is_fixture()
    }

    #[test_case("sandbox@onefootprint.com" => "s******@o***********.com")]
    #[test_case("sandbox+12@onefootprint.com" => "s*********@o***********.com")]
    #[test_case("sandbox.hi@mydomain" => "s*********@m*******")]
    #[test_case("sandbox.hi@mydomain.com" => "s*********@m*******.com")]
    fn test_scrub(input: &str) -> String {
        Email::from_str(input).unwrap().scrubbed().leak_to_string()
    }
}
