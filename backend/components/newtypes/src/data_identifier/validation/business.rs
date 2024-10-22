use super::utils;
use super::utils::validate_state;
use super::Error;
use super::VResult;
use crate::email::Email;
use crate::AllData;
use crate::BoLinkId;
use crate::BusinessDataKind as BDK;
use crate::BusinessOwnerKind;
use crate::CleanAndValidate;
use crate::DataIdentifier;
use crate::DataIdentifierValue;
use crate::NtResult;
use crate::NtValidationError;
use crate::PhoneNumber;
use crate::PiiJsonValue;
use crate::PiiString;
use crate::ValidateArgs;
use itertools::Itertools;
use serde::Deserialize;
use serde::Serialize;
use serde_with::DeserializeFromStr;
use strum::EnumString;
use url::Host;
use url::Url;

impl CleanAndValidate for BDK {
    type Parsed = ();

    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        args: ValidateArgs,
        all_data: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        let value = match &self {
            BDK::Name => value.as_string()?,
            BDK::Dba => value.as_string()?,
            BDK::Website => clean_and_validate_website(value.as_string()?)?,
            BDK::PhoneNumber => PhoneNumber::parse(value.as_string()?)?.e164(),
            BDK::Tin => clean_and_validate_tin(value.as_string()?)?,
            BDK::AddressLine1 => value.as_string()?,
            BDK::AddressLine2 => value.as_string()?,
            BDK::City => value.as_string()?,
            BDK::State => validate_state(value.as_string()?, all_data.get(&BDK::Country.into()))?,
            BDK::Zip => utils::clean_and_validate_zip(value.as_string()?)?,
            BDK::Country => utils::clean_and_validate_country(value.as_string()?)?,
            BDK::BeneficialOwners => clean_and_validate_beneficial_owners(value)?,
            BDK::KycedBeneficialOwners => clean_and_validate_kyced_beneficial_owners(value, args)?,
            BDK::BeneficialOwnerData(_, di) => {
                clean_and_validate_beneficial_owner_data(*di.clone(), args, value, all_data)?
            }
            BDK::BeneficialOwnerExplanationMessage => value.as_string()?,
            BDK::CorporationType => utils::parse_enum::<CorporationType>(value.as_string()?)?,
            BDK::FormationState => {
                utils::validate_state(value.as_string()?, all_data.get(&BDK::Country.into()))?
            }
            BDK::FormationDate => utils::clean_and_validate_formation_date(value.as_string()?)?,
        };
        let value = utils::validate_not_empty(value)?;

        Ok(DataIdentifierValue {
            di: self.into(),
            value,
            parsed: (),
        })
    }
}

fn clean_and_validate_beneficial_owner_data(
    di: DataIdentifier,
    args: ValidateArgs,
    input: PiiJsonValue,
    all_data: &AllData,
) -> NtResult<PiiString> {
    let can_vault_bo_data = matches!(di, DataIdentifier::Id(_) | DataIdentifier::Custom(_));
    if !can_vault_bo_data {
        return Err(NtValidationError("Cannot vault this kind of beneficial owner data").into());
    }
    let DataIdentifierValue { value, .. } = di.clean_and_validate(input, args, all_data)?;
    Ok(value)
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, EnumString)]
#[strum(serialize_all = "snake_case")]
enum CorporationType {
    Corporation, // No longer used in the frontend
    CCorporation,
    SCorporation,
    BCorporation,
    Llc,
    Llp,
    Partnership,
    SoleProprietorship,
    NonProfit,
    Unknown,
    Trust,
    Agent,
}

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "snake_case")]
pub struct BusinessOwnerData {
    #[allow(unused)]
    pub first_name: PiiString,
    #[allow(unused)]
    pub last_name: PiiString,
    pub ownership_stake: u32,
}

fn clean_and_validate_beneficial_owners(input: PiiJsonValue) -> VResult<PiiString> {
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
pub struct KycedBusinessOwnerData<IdT = BoLinkId, EmailT = Option<Email>, PhoneT = Option<PhoneNumber>>
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

impl<IdT: Serialize> KycedBusinessOwnerData<IdT> {
    pub fn validate_has_email_and_phone(self) -> NtResult<KycedBusinessOwnerData<IdT, Email, PhoneNumber>> {
        let Self {
            link_id,
            first_name,
            last_name,
            email,
            phone_number,
            ownership_stake,
        } = self;

        let email = email.ok_or(Error::BoMissingEmail)?;
        let phone_number = phone_number.ok_or(Error::BoMissingPhoneNumber)?;
        let res = KycedBusinessOwnerData {
            link_id,
            first_name,
            last_name,
            email,
            phone_number,
            ownership_stake,
        };
        Ok(res)
    }
}

type KycedBusinessOwnerDataDe = KycedBusinessOwnerData<Option<()>>;

fn clean_and_validate_kyced_beneficial_owners(input: PiiJsonValue, args: ValidateArgs) -> VResult<PiiString> {
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
    use super::KycedBusinessOwnerData;
    use super::BDK::*;
    use crate::BusinessDataKind as BDK;
    use crate::CleanAndValidate;
    use crate::PiiJsonValue;
    use crate::ValidateArgs;
    use serde_json::json;
    use std::collections::HashMap;
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
        bdk.clean_and_validate(
            PiiJsonValue::string(pii),
            ValidateArgs::for_tests(),
            &HashMap::new(),
        )
        .ok()
        .map(|div| div.value.leak_to_string())
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
            .clean_and_validate(
                PiiJsonValue::string(&input_str),
                ValidateArgs::for_tests(),
                &HashMap::new(),
            )
            .unwrap()
            .value;
        let result: Vec<KycedBusinessOwnerData> = serde_json::de::from_str(result.leak()).unwrap();
        let owner = result.into_iter().next().unwrap();
        assert!(owner.link_id.to_string().starts_with("bo_link_"));
        assert_eq!(owner.first_name.leak(), "Piip");
        assert_eq!(owner.last_name.leak(), "Penguin");
        assert_eq!(owner.email.unwrap().leak(), "piip@onefootprint.com");
        assert_eq!(owner.phone_number.unwrap().e164().leak(), "+14155555555",);
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
        let result = BDK::KycedBeneficialOwners.clean_and_validate(
            PiiJsonValue::string(&input_str),
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
        let result = BDK::KycedBeneficialOwners.clean_and_validate(
            PiiJsonValue::string(&input_str),
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
        let result = BDK::KycedBeneficialOwners.clean_and_validate(
            PiiJsonValue::string(&input_str),
            ValidateArgs::for_tests(),
            &HashMap::new(),
        );
        assert!(result.is_err());
    }
}
