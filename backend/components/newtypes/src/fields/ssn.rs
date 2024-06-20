use crate::Error;
use crate::PiiString;
use regex::Regex;

lazy_static! {
    static ref SSN9_FORMAT: Regex = Regex::new(r"^\d{3}-?\d{2}-?\d{4}$").unwrap();
    // Numbers with 666 or 900–999 in the first digit group are not allowed.
    // Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
    static ref SSN9_BAD_GROUP_1: Regex = Regex::new(r"^(000|666|9\d{2})-?\d{2}-?\d{4}$").unwrap();
    static ref SSN9_BAD_GROUP_2: Regex = Regex::new(r"^\d{3}-?00-?\d{4}$").unwrap();
    static ref SSN9_BAD_GROUP_3: Regex = Regex::new(r"^\d{3}-?\d{2}-?0000$").unwrap();
}

pub struct Ssn9(PiiString);

impl Ssn9 {
    pub fn parse(value: PiiString) -> Result<Self, Error> {
        let value = value.leak();
        if !SSN9_FORMAT.is_match(value) {
            Err(Error::InvalidSsn9(
                "Must have format ###-##-####, with optional dashes".into(),
            ))
        } else if SSN9_BAD_GROUP_1.is_match(value) {
            Err(Error::InvalidSsn9(
                "Leading three digit number must not be 000, 666, or a value between 900 and 999 (inclusive)"
                    .into(),
            ))
        } else if SSN9_BAD_GROUP_2.is_match(value) {
            Err(Error::InvalidSsn9("Middle two digits must not be 00".into()))
        } else if SSN9_BAD_GROUP_3.is_match(value) {
            Err(Error::InvalidSsn9("Last four digits must not be 0000".into()))
        } else {
            let digits: String = value.chars().filter(|c| c.is_ascii_digit()).collect();
            if digits.len() != 9 {
                Err(Error::InvalidSsn9("Must contain exactly 9 digits".into()))
            } else {
                Ok(Ssn9(digits.into()))
            }
        }
    }

    pub fn format_no_dashes(&self) -> PiiString {
        self.0.clone()
    }
}

pub struct Ssn4(PiiString);

impl Ssn4 {
    pub fn parse(value: PiiString) -> Result<Self, Error> {
        let value = value.leak();
        if value.len() != 4 {
            return Err(Error::InvalidSsn4("Must contain exactly 4 digits".into()));
        }
        if value.chars().any(|c| !c.is_ascii_digit()) {
            return Err(Error::InvalidSsn4("Must contain only ASCII digits".into()));
        }
        if value == "0000" {
            return Err(Error::InvalidSsn4("Last 4 digits of SSN can not be 0000".into()));
        }
        Ok(Ssn4(value.into()))
    }

    pub fn format(&self) -> PiiString {
        self.0.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ssn9_parsing() {
        for (s, expect) in [
            // Any combination of dashes.
            ("123-45-6789", Some("123456789")),
            ("12345-6789", Some("123456789")),
            ("123-456789", Some("123456789")),
            ("123456789", Some("123456789")),
            // Leading zeros are okay.
            ("023-45-6789", Some("023456789")),
            ("123-05-6789", Some("123056789")),
            ("123-45-0789", Some("123450789")),
            // Bad dash position.
            ("12-3456789", None),
            // All zeros in any group are not allowed.
            ("000-45-6789", None),
            ("00045-6789", None),
            ("000-456789", None),
            ("000456789", None),
            ("123-00-6789", None),
            ("12300-6789", None),
            ("123-006789", None),
            ("123006789", None),
            ("123-45-0000", None),
            ("12345-0000", None),
            ("123-450000", None),
            ("123450000", None),
            // Leading 666 or 900-999 are not allowed.
            ("666-45-6789", None),
            ("66645-6789", None),
            ("666-456789", None),
            ("666456789", None),
            ("900-45-6789", None),
            ("90045-6789", None),
            ("900-456789", None),
            ("900456789", None),
            ("999-45-6789", None),
            ("99945-6789", None),
            ("999-456789", None),
            ("999456789", None),
            ("950-45-6789", None),
            ("95045-6789", None),
            ("950-456789", None),
            ("950456789", None),
            // Spaces invalid.
            ("  123-45-6789  ", None),
        ] {
            let ssn = Ssn9::parse(s.into());
            if let Some(expect) = expect {
                assert_eq!(
                    ssn.unwrap_or_else(|e| panic!(
                        "expected {:?} for input: {:?}, got error: {:?}",
                        expect, s, e
                    ))
                    .format_no_dashes()
                    .leak(),
                    expect
                );
            } else {
                assert!(ssn.is_err());
            }
        }
    }

    #[test]
    fn test_ssn4_parsing() {
        assert_eq!(Ssn4::parse("1234".into()).unwrap().format().leak(), "1234");
        assert_eq!(Ssn4::parse("7436".into()).unwrap().format().leak(), "7436");
        assert!(Ssn4::parse("-1234".into()).is_err());
        assert!(Ssn4::parse("1-234".into()).is_err());
        assert!(Ssn4::parse("12a34".into()).is_err());
        assert!(Ssn4::parse("abc".into()).is_err());
        assert!(Ssn4::parse("0000".into()).is_err());
        assert!(Ssn4::parse(" 1234 ".into()).is_err());
    }
}
