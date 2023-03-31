use super::utils;
use super::{Error, VResult};
use crate::email::Email;
use crate::{BusinessDataKind as BDK, PhoneNumber, PiiString};
use crate::{NtResult, Validate};
use serde::Deserialize;
use serde_with::DeserializeFromStr;
use strum::EnumString;
use url::{Host, Url};

impl Validate for BDK {
    fn validate(&self, value: PiiString, _for_bifrost: bool) -> NtResult<PiiString> {
        let value = utils::validate_not_empty(value)?;
        let result = match self {
            BDK::Name => value,
            BDK::Dba => value,
            BDK::Website => clean_and_validate_website(value)?,
            BDK::PhoneNumber => PhoneNumber::parse(value)?.e164_with_suffix(),
            BDK::Tin => clean_and_validate_tin(value)?,
            BDK::AddressLine1 => value,
            BDK::AddressLine2 => value,
            BDK::City => value,
            BDK::State => value,
            BDK::Zip => utils::clean_and_validate_zip(value)?,
            BDK::Country => utils::clean_and_validate_country(value)?,
            BDK::BeneficialOwners => clean_and_validate_beneficial_owners(value)?,
            BDK::CorporationType => utils::parse_enum::<CorporationType>(value)?,
        };
        Ok(result)
    }
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum CorporationType {
    Corporation,
    Llc,
    Partnership,
    SoleProprietorship,
    NonProfit,
    Unknown,
    Trust,
    Agent,
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct BusinessOwner {
    #[allow(unused)]
    first_name: PiiString,
    #[allow(unused)]
    last_name: PiiString,
    #[allow(unused)]
    email: Option<Email>,
    ownership_stake: u32,
}

fn clean_and_validate_beneficial_owners(input: PiiString) -> VResult<PiiString> {
    utils::parse_json_and_validate::<Vec<BusinessOwner>, _>(input, |l| {
        if l.iter().map(|bo| bo.ownership_stake).sum::<u32>() > 100 {
            return Err(Error::BusinessOwnersStakeAbove100);
        }
        Ok(())
    })
}

fn clean_and_validate_tin(input: PiiString) -> VResult<PiiString> {
    // Allow providing hyphens in input. This is permissive for now
    let input = PiiString::new(input.leak().chars().filter(|p| p != &'-').collect());
    if input.leak().len() != 9 {
        return Err(Error::InvalidLength);
    }
    if input.leak().chars().any(|c| !c.is_ascii_digit()) {
        return Err(Error::NonDigitCharacter);
    }
    Ok(input)
}

fn clean_and_validate_website(input: PiiString) -> VResult<PiiString> {
    let input = if !input.leak().contains("://") {
        // Prepend https:// prefix if no scheme is provided
        PiiString::from(format!("https://{}", input.leak()))
    } else {
        input
    };
    let url = Url::parse(input.leak())?;
    match url.host() {
        Some(Host::Ipv4(_)) | Some(Host::Ipv6(_)) | None => return Err(Error::InvalidHost),
        Some(Host::Domain(d)) => {
            if !d.contains('.') {
                return Err(Error::InvalidHost);
            }
        }
    }
    Ok(input)
}

#[cfg(test)]
mod test {
    use super::BDK::*;
    use crate::BusinessDataKind as BDK;
    use crate::PiiString;
    use crate::Validate;
    use test_case::test_case;

    #[test_case(Name, "Acme Bank" => Some("Acme Bank".to_owned()))]
    #[test_case(Dba, "Bank" => Some("Bank".to_owned()))]
    #[test_case(Website, "https://onefootprint.com" => Some("https://onefootprint.com".to_owned()))]
    #[test_case(Website, "http://onefootprint.com" => Some("http://onefootprint.com".to_owned()))]
    #[test_case(Website, "www.onefootprint.com/about.html" => Some("https://www.onefootprint.com/about.html".to_owned()))]
    #[test_case(Website, "onefootprint.com" => Some("https://onefootprint.com".to_owned()))]
    #[test_case(Website, "about.onefootprint.com" => Some("https://about.onefootprint.com".to_owned()))]
    #[test_case(Website, "foobar" => None)]
    #[test_case(Website, "hello . com" => None)]
    #[test_case(Website, "123?.com" => None)]
    #[test_case(PhoneNumber, "flerp" => None)]
    #[test_case(PhoneNumber, "+1-555-555-5555" => Some("+15555555555".to_owned()))]
    #[test_case(PhoneNumber, "+15555555555#sandbox" => Some("+15555555555#sandbox".to_owned()))] // Sandbox phone
    #[test_case(Tin, "12-1234567" => Some("121234567".to_owned()))]
    #[test_case(AddressLine1, "100 Nitro Way@" => Some("100 Nitro Way@".to_owned()))]
    #[test_case(AddressLine1, "100 Enclave Way" => Some("100 Enclave Way".to_owned()))]
    #[test_case(AddressLine2, "#1" => Some("#1".to_owned()))]
    #[test_case(City, "" => None)]
    #[test_case(City, "Footprint" => Some("Footprint".to_owned()))]
    #[test_case(City, "_Footprint1" => Some("_Footprint1".to_owned()))] // We don't care about special chars
    #[test_case(State, "CA" => Some("CA".to_owned()))]
    #[test_case(State, "CA1" => Some("CA1".to_owned()))] // We don't care about special chars
    #[test_case(Zip, "flerp!" => None)]
    #[test_case(Zip, "12345" => Some("12345".to_owned()))]
    #[test_case(Country, "BLERP" => None)]
    #[test_case(Country, "US" => Some("US".to_owned()))]
    #[test_case(BeneficialOwners, "[{\"first_name\": \"Piip\", \"last_name\": \"The Penguin\", \"ownership_stake\": 90}]" => Some("[{\"first_name\": \"Piip\", \"last_name\": \"The Penguin\", \"ownership_stake\": 90}]".to_owned()))]
    #[test_case(BeneficialOwners, "[{\"first_name\": \"Piip\", \"last_name\": \"The Penguin\", \"ownership_stake\": 90}, {\"first_name\": \"Marco\", \"last_name\": \"The Penguin\", \"ownership_stake\": 90}]" => None)]
    #[test_case(BeneficialOwners, "I am not json" => None)]
    fn test_clean_and_validate_field_not_bifrost(bdk: BDK, pii: &str) -> Option<String> {
        bdk.validate(PiiString::new(pii.to_owned()), false)
            .ok()
            .map(|pii| pii.leak_to_string())
    }
}
