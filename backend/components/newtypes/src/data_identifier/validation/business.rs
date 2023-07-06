use super::utils;
use super::{Error, VResult};
use crate::email::Email;
use crate::{
    AllData, BoLinkId, BusinessDataKind as BDK, BusinessOwnerKind, PhoneNumber, PiiString, ValidateArgs,
};
use crate::{NtResult, Validate};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use serde_with::DeserializeFromStr;
use strum::EnumString;
use url::{Host, Url};

impl Validate for BDK {
    fn validate(&self, value: PiiString, args: ValidateArgs, _: &AllData) -> NtResult<PiiString> {
        let value = utils::validate_not_empty(value)?;
        let result = match self {
            BDK::Name => value,
            BDK::Dba => value,
            BDK::Website => clean_and_validate_website(value)?,
            BDK::PhoneNumber => PhoneNumber::parse(value)?.e164(),
            BDK::Tin => clean_and_validate_tin(value)?,
            BDK::AddressLine1 => value,
            BDK::AddressLine2 => value,
            BDK::City => value,
            BDK::State => value,
            BDK::Zip => utils::clean_and_validate_zip(value)?,
            BDK::Country => utils::clean_and_validate_country(value)?,
            BDK::BeneficialOwners => clean_and_validate_beneficial_owners(value)?,
            BDK::KycedBeneficialOwners => clean_and_validate_kyced_beneficial_owners(value, args)?,
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

#[derive(Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct BusinessOwnerData {
    #[allow(unused)]
    pub first_name: PiiString,
    #[allow(unused)]
    pub last_name: PiiString,
    pub ownership_stake: u32,
}

fn clean_and_validate_beneficial_owners(input: PiiString) -> VResult<PiiString> {
    utils::parse_json_and_validate::<Vec<BusinessOwnerData>, _>(input, |l| {
        if l.is_empty() {
            return Err(Error::InvalidLength);
        }
        if l.iter().map(|bo| bo.ownership_stake).sum::<u32>() > 100 {
            return Err(Error::BusinessOwnersStakeAbove100);
        }
        Ok(())
    })
}

// Or should we branch validation logic based on a ParseArg
#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "snake_case")]
pub struct KycedBusinessOwnerData<IdT = BoLinkId, EmailT = Email, PhoneT = PhoneNumber>
where
    IdT: Serialize,
{
    /// We'll autogenerate a link_id that is used as the PK of the BO in the DB
    pub link_id: IdT,
    pub first_name: PiiString,
    pub last_name: PiiString,
    pub email: EmailT,
    pub phone_number: PhoneT,
    pub ownership_stake: u32,
}

type KycedBusinessOwnerDataDe = KycedBusinessOwnerData<Option<()>>;

fn clean_and_validate_kyced_beneficial_owners(input: PiiString, args: ValidateArgs) -> VResult<PiiString> {
    utils::parse_json_and_map::<Vec<KycedBusinessOwnerDataDe>, _>(input, |bos| {
        if bos.is_empty() {
            return Err(Error::InvalidLength);
        }
        if bos.iter().map(|bo| bo.ownership_stake).sum::<u32>() > 100 {
            return Err(Error::BusinessOwnersStakeAbove100);
        }
        // Allow non-unique emails and phones in sandbox for easier testing
        if args.is_live && bos.iter().map(|bo| &bo.phone_number).unique().count() != bos.len() {
            return Err(Error::NonUniqueBusinessOwners);
        }
        if args.is_live && bos.iter().map(|bo| &bo.email).unique().count() != bos.len() {
            return Err(Error::NonUniqueBusinessOwners);
        }
        // TODO make sure unique set of emails + phones
        // Create a BoID for each Kyced BO item. This ID will be used to link the JSON BO to the
        // BO in the DB
        let bos_with_id = bos
            .into_iter()
            .enumerate()
            .map(|(i, bo)| {
                let KycedBusinessOwnerData {
                    link_id: _,
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    ownership_stake,
                } = bo;
                let kind = if i == 0 {
                    BusinessOwnerKind::Primary
                } else {
                    BusinessOwnerKind::Secondary
                };
                KycedBusinessOwnerData {
                    link_id: BoLinkId::generate(kind),
                    first_name,
                    last_name,
                    email,
                    phone_number,
                    ownership_stake,
                }
            })
            .collect_vec();
        let serialized_value = PiiString::from(serde_json::ser::to_string(&bos_with_id)?);
        Ok(serialized_value)
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
    use std::collections::HashMap;

    use super::KycedBusinessOwnerData;
    use super::BDK::*;
    use crate::BusinessDataKind as BDK;
    use crate::PiiString;
    use crate::Validate;
    use crate::ValidateArgs;
    use serde_json::json;
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
        bdk.validate(
            PiiString::new(pii.to_owned()),
            ValidateArgs::for_tests(),
            &HashMap::new(),
        )
        .ok()
        .map(|pii| pii.leak_to_string())
    }

    #[test]
    fn test_clean_and_validate_kyced_bo() {
        // Make sure we autopopulate a link_id when parsing
        let input = json!([{
            "first_name": "Piip",
            "last_name": "Penguin",
            "email": "piip@onefootprint.com",
            "phone_number": "+14155555555",
            "ownership_stake": 90
        }]);
        let input_str = serde_json::ser::to_string(&input).unwrap();
        let result = BDK::KycedBeneficialOwners
            .validate(
                PiiString::new(input_str),
                ValidateArgs::for_tests(),
                &HashMap::new(),
            )
            .unwrap();
        let result: Vec<KycedBusinessOwnerData> = serde_json::de::from_str(result.leak()).unwrap();
        let owner = result.into_iter().next().unwrap();
        assert!(owner.link_id.to_string().starts_with("bo_link_"));
        assert_eq!(owner.first_name.leak(), "Piip");
        assert_eq!(owner.last_name.leak(), "Penguin");
        assert_eq!(owner.email.leak(), "piip@onefootprint.com");
        assert_eq!(owner.phone_number.e164().leak(), "+14155555555",);
        assert_eq!(owner.ownership_stake, 90);

        // Test bad email
        let input = json!([{
            "first_name": "Piip",
            "last_name": "Penguin",
            "email": "piip",
            "phone_number": "+14155555555",
            "ownership_stake": 90
        }]);

        let input_str = serde_json::ser::to_string(&input).unwrap();
        let result = BDK::KycedBeneficialOwners.validate(
            PiiString::new(input_str),
            ValidateArgs::for_tests(),
            &HashMap::new(),
        );
        assert!(result.is_err());

        // Test bad phone
        let input = json!([{
            "first_name": "Piip",
            "last_name": "Penguin",
            "email": "piip@onefootprint.com",
            "phone_number": "merp",
            "ownership_stake": 90
        }]);

        let input_str = serde_json::ser::to_string(&input).unwrap();
        let result = BDK::KycedBeneficialOwners.validate(
            PiiString::new(input_str),
            ValidateArgs::for_tests(),
            &HashMap::new(),
        );
        assert!(result.is_err());

        // Test duplicate phones
        let input = json!([{
            "first_name": "Piip",
            "last_name": "Penguin",
            "email": "piip@onefootprint.com",
            "phone_number": "+14155555555",
            "ownership_stake": 50
        }, {
            "first_name": "Franklin",
            "last_name": "Frog",
            "email": "franklin@onefootprint.com",
            "phone_number": "+14155555555", // same phone number
            "ownership_stake": 25
        }]);

        let input_str = serde_json::ser::to_string(&input).unwrap();
        let result = BDK::KycedBeneficialOwners.validate(
            PiiString::new(input_str),
            ValidateArgs::for_tests(),
            &HashMap::new(),
        );
        assert!(result.is_err());
    }
}
