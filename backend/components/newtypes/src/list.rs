use crate::email::Email;
use crate::ssn::Ssn9;
use crate::Error;
use crate::ListKind;
use crate::NtResult;
use crate::PhoneNumber;
use crate::PiiString;
use email_address::EmailAddress;
use phonenumber::metadata::DATABASE as PHONE_DB;
use std::net::IpAddr;
use std::str::FromStr;

pub enum ListEntryValue {
    EmailAddress(Email),
    EmailDomain(PiiString),
    Ssn9(Ssn9),
    PhoneNumber(PhoneNumber),
    PhoneCountryCode(u16),
    IpAddress(IpAddr),
}

impl ListEntryValue {
    pub fn parse(kind: ListKind, value: PiiString) -> NtResult<Self> {
        match kind {
            ListKind::EmailAddress => Ok(ListEntryValue::EmailAddress(Email::from_str(value.leak())?)),
            ListKind::EmailDomain => {
                let domain = value.leak().to_lowercase();
                if EmailAddress::is_valid_domain(&domain) {
                    Ok(ListEntryValue::EmailDomain(domain.into()))
                } else {
                    Err(Error::InvalidEmailDomain)
                }
            }
            ListKind::Ssn9 => Ok(ListEntryValue::Ssn9(Ssn9::parse(value)?)),
            ListKind::PhoneNumber => Ok(ListEntryValue::PhoneNumber(PhoneNumber::parse(value)?)),
            ListKind::PhoneCountryCode => {
                let code: u16 = value.leak().parse()?;
                if PHONE_DB.by_code(&code).unwrap_or_default().is_empty() {
                    // Country  code is not PII.
                    return Err(Error::InvalidPhoneCountryCode(code));
                };
                Ok(ListEntryValue::PhoneCountryCode(code))
            }
            ListKind::IpAddress => {
                let ip = value.leak().parse()?;
                Ok(ListEntryValue::IpAddress(ip))
            }
        }
    }

    pub fn canonicalize(&self) -> PiiString {
        match self {
            ListEntryValue::EmailAddress(e) => e.to_piistring(),
            ListEntryValue::EmailDomain(d) => d.clone(),
            ListEntryValue::Ssn9(s) => s.format_no_dashes(),
            ListEntryValue::PhoneNumber(p) => p.e164(),
            ListEntryValue::PhoneCountryCode(c) => c.to_string().into(),
            ListEntryValue::IpAddress(a) => a.to_canonical().to_string().into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_entry_value() {
        for (kind, input, expect) in [
            (
                ListKind::EmailAddress,
                "test@onefootprint.com",
                Some("test@onefootprint.com"),
            ),
            (
                ListKind::EmailAddress,
                " test@onefootprint.com",
                Some("test@onefootprint.com"),
            ),
            (
                ListKind::EmailAddress,
                "test@onefootprint",
                Some("test@onefootprint"),
            ),
            (
                ListKind::EmailAddress,
                "Test+1@onefootprint",
                Some("test+1@onefootprint"),
            ),
            (ListKind::EmailAddress, "test@1.1.1.1", Some("test@1.1.1.1")),
            (ListKind::EmailAddress, "test@", None),
            (ListKind::EmailAddress, " test-onefootprint.com", None),
            (
                ListKind::EmailDomain,
                "onefootprint.com",
                Some("onefootprint.com"),
            ),
            (ListKind::EmailDomain, "onefootprintcom", Some("onefootprintcom")),
            (ListKind::EmailDomain, "1.1.1.1", Some("1.1.1.1")),
            (ListKind::EmailDomain, "1.2.3", Some("1.2.3")), // Suspect...
            (ListKind::EmailDomain, ".a.", None),
            (ListKind::EmailDomain, " test ", None),
            (ListKind::Ssn9, "123-45-6789", Some("123456789")),
            (ListKind::Ssn9, "123456789", Some("123456789")),
            (ListKind::Ssn9, "000-45-6789", None),
            (ListKind::PhoneNumber, "+1-234-567-8987", Some("+12345678987")),
            (ListKind::PhoneNumber, "+12345678987", Some("+12345678987")),
            (
                ListKind::PhoneNumber,
                "+55 (12) 12345-1234",
                Some("+5512123451234"),
            ),
            (ListKind::PhoneNumber, "55 (12) 12345-1234", None),
            (ListKind::PhoneNumber, "12345", None),
            (ListKind::PhoneNumber, "555-555-5555", None),
            (ListKind::PhoneCountryCode, "1", Some("1")),
            (ListKind::PhoneCountryCode, "001", Some("1")),
            (ListKind::PhoneCountryCode, "55", Some("55")),
            (ListKind::PhoneCountryCode, "599", Some("599")),
            (ListKind::PhoneCountryCode, "690", Some("690")),
            (ListKind::PhoneCountryCode, "999", None), // Unassigned.
            (ListKind::PhoneCountryCode, "210", None), // Unassigned.
            (ListKind::PhoneCountryCode, "0", None),
            (ListKind::IpAddress, "1.2.3.4", Some("1.2.3.4")),
            (ListKind::IpAddress, "15.73.27.98", Some("15.73.27.98")),
            (ListKind::IpAddress, "1234:567::", Some("1234:567::")),
            (
                ListKind::IpAddress,
                "1234:0567:0000:0000:0000:0000:0000:0000",
                Some("1234:567::"),
            ),
            (ListKind::IpAddress, "::ffff:0:0", Some("0.0.0.0")),
            (ListKind::IpAddress, " 1.2.3.4", None),
            (ListKind::IpAddress, "1.2.3", None),
            (ListKind::IpAddress, ":::", None),
        ] {
            if let Some(expect) = expect {
                assert_eq!(
                    ListEntryValue::parse(kind, input.into())
                        .unwrap_or_else(|e| panic!(
                            "expected {:?} for kind: {:?}, input: {:?}, got error: {:?}",
                            expect, kind, input, e
                        ))
                        .canonicalize()
                        .leak(),
                    expect,
                    "kind: {:?}, input: {:?}",
                    kind,
                    input,
                )
            } else {
                assert!(
                    ListEntryValue::parse(kind, input.into()).is_err(),
                    "kind: {:?}, input: {:?}",
                    kind,
                    input,
                )
            }
        }
    }
}
