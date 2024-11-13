use super::utils;
use super::utils::validate_state;
use super::Error;
use super::VResult;
use crate::AllData;
use crate::BusinessDataKind as BDK;
use crate::CleanAndValidate;
use crate::DataIdentifier;
use crate::DataIdentifierValue;
use crate::NtResult;
use crate::NtValidationError;
use crate::PhoneNumber;
use crate::PiiJsonValue;
use crate::PiiString;
use crate::ValidateArgs;
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
            BDK::BeneficialOwnerData(_, di) => {
                clean_and_validate_beneficial_owner_data(*di.clone(), args, value, all_data)?
            }
            BDK::BeneficialOwnerStake(_) => clean_and_validate_beneficial_owner_stake(value)?,
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

fn clean_and_validate_beneficial_owner_stake(input: PiiJsonValue) -> VResult<PiiString> {
    utils::parse_json_and_validate::<u32, _>(input, |stake| {
        if stake > 100 {
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
    use crate::CleanAndValidate;
    use crate::PiiJsonValue;
    use crate::ValidateArgs;
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
    fn test_clean_and_validate_field_not_bifrost(bdk: BDK, pii: &str) -> Option<String> {
        bdk.clean_and_validate(
            PiiJsonValue::string(pii),
            ValidateArgs::for_tests(),
            &HashMap::new(),
        )
        .ok()
        .map(|div| div.value.leak_to_string())
    }
}
