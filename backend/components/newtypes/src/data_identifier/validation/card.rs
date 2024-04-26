use super::{utils, Error, VResult};
use crate::{
    AliasId, AllData, CardDataKind as CDK, CardInfo as CI, DataIdentifier, NtResult, PiiJsonValue, PiiString,
    Validate, ValidateArgs,
};
use card_validate::Validate as CardValidate;
use itertools::Itertools;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::{Display, EnumIter, EnumString};

impl Validate for CI {
    fn validate(
        self,
        value: PiiJsonValue,
        args: ValidateArgs,
        all_data: &AllData,
    ) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
        let Self { alias, kind } = &self;
        let value = value.as_string()?;
        let result = match kind {
            CDK::Cvc => validate_cc_cvc(value, alias, all_data)?,
            CDK::Name => validate_card_name(value)?,
            CDK::BillingZip => utils::clean_and_validate_zip(value)?,
            CDK::BillingCountry => utils::clean_and_validate_country(value)?,
            // Special ones that return derived entries
            CDK::Number => return validate_card_number(alias, value, args),
            CDK::Expiration => return validate_expiration(alias, value),
            CDK::Last4 => return Err(Error::CannotSpecifyDerivedEntry.into()),
            CDK::Issuer => return Err(Error::CannotSpecifyDerivedEntry.into()),
            CDK::ExpMonth => return Err(Error::CannotSpecifyDerivedEntry.into()),
            CDK::ExpYear => return Err(Error::CannotSpecifyDerivedEntry.into()),
        };
        Ok(vec![(self.into(), result)])
    }
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, SerializeDisplay, EnumString, Display, EnumIter)]
#[strum(serialize_all = "snake_case")]
pub enum CardIssuer {
    // Debit
    VisaElectron,
    Maestro,
    Forbrugsforeningen,
    Dankort,

    // Credit
    Visa,
    Mir,
    MasterCard,
    Amex,
    DinersClub,
    Discover,
    UnionPay,
    Jcb,

    Unknown,
}

impl From<card_validate::Type> for CardIssuer {
    fn from(value: card_validate::Type) -> Self {
        match value {
            card_validate::Type::VisaElectron => Self::VisaElectron,
            card_validate::Type::Maestro => Self::Maestro,
            card_validate::Type::Forbrugsforeningen => Self::Forbrugsforeningen,
            card_validate::Type::Dankort => Self::Dankort,
            card_validate::Type::Visa => Self::Visa,
            card_validate::Type::MIR => Self::Mir,
            card_validate::Type::MasterCard => Self::MasterCard,
            card_validate::Type::Amex => Self::Amex,
            card_validate::Type::DinersClub => Self::DinersClub,
            card_validate::Type::Discover => Self::Discover,
            card_validate::Type::UnionPay => Self::UnionPay,
            card_validate::Type::JCB => Self::Jcb,
            card_validate::Type::__NonExhaustive => Self::Unknown,
        }
    }
}

fn validate_card_number(
    alias: &AliasId,
    value: PiiString,
    args: ValidateArgs,
) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
    // Derive the issuer
    let issuer_entry = if args.ignore_luhn_validation {
        // Silence almost all validation for a handful of cards that don't obey the normal validation rules
        if !value.leak().chars().all(|c| c.is_numeric()) {
            return Err(Error::CardError(
                "Invalid format. Please verify that the number is correct".to_owned(),
            )
            .into());
        }
        if value.len() < 10 || value.len() > 19 {
            return Err(Error::CardError(
                "Invalid length. Please verify that the number is correct".to_owned(),
            )
            .into());
        }
        None
    } else {
        let validate = CardValidate::from(value.leak()).map_err(|e| {
            Error::CardError(match e {
                card_validate::ValidateError::InvalidLuhn => {
                    "Invalid checksum. Please verify that the number is correct".to_owned()
                }
                card_validate::ValidateError::InvalidLength => {
                    "Invalid length. Please verify that the number is correct".to_owned()
                }
                card_validate::ValidateError::InvalidFormat => {
                    "Invalid format. Please verify that the number is correct".to_owned()
                }
                card_validate::ValidateError::UnknownType => {
                    "Unknown type. Please verify that the number is correct".to_owned()
                }
                _ => format!("{:?}", e),
            })
        })?;
        let issuer = CardIssuer::from(validate.card_type);
        let di = CI {
            alias: alias.clone(),
            kind: CDK::Issuer,
        }
        .into();
        Some((di, PiiString::from(issuer)))
    };
    // Derive the last 4
    let last4: PiiString = PiiString::new(value.leak().chars().skip(value.leak().len() - 4).collect());
    let last4_di = CI {
        alias: alias.clone(),
        kind: CDK::Last4,
    }
    .into();
    let last4_entry = Some((last4_di, last4));

    let number_di = CI {
        alias: alias.clone(),
        kind: CDK::Number,
    }
    .into();
    let number_entry = Some((number_di, value));
    let entries = vec![number_entry, last4_entry, issuer_entry]
        .into_iter()
        .flatten()
        .collect();
    Ok(entries)
}

fn validate_expiration(alias: &AliasId, value: PiiString) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
    let exp = Expiration::validate(&value)?;
    let entries = vec![
        (
            CI {
                alias: alias.clone(),
                kind: CDK::Expiration,
            }
            .into(),
            exp.clone().into(),
        ),
        (
            CI {
                alias: alias.clone(),
                kind: CDK::ExpMonth,
            }
            .into(),
            exp.month,
        ),
        (
            CI {
                alias: alias.clone(),
                kind: CDK::ExpYear,
            }
            .into(),
            exp.year,
        ),
    ];
    Ok(entries)
}

fn validate_card_name(value: PiiString) -> VResult<PiiString> {
    if value.leak().is_empty() {
        return Err(Error::CardError("Cannot be empty".into()));
    }
    if value.len() >= 200 {
        return Err(Error::CardError("Cardholder name too long".into()));
    }

    Ok(value)
}

#[derive(Debug, Clone)]
struct Expiration {
    pub month: PiiString,
    pub year: PiiString,
}

impl Expiration {
    /// expirations can be parsed as the following grammar:
    /// expiration = month sep year | year_4 sep month
    /// month      = [0-9][0-9]
    /// sep        = '/' | '-' | ' ' | '\'
    /// year       = year_2 | year_4
    /// year_2     = [0-9][0-9]
    /// year_4     = [0-9][0-9][0-9][0-9]
    ///
    /// But stored as `MM/YYYY`
    fn validate(value: &PiiString) -> VResult<Expiration> {
        let mut iter = value
            .leak()
            .chars()
            .filter(|c| matches!(c, '/' | '-' | ' ' | '\\'));

        let sep = iter.next().ok_or(Error::InvalidExpiration)?;

        if iter.next().is_some() {
            return Err(Error::InvalidExpiration);
        }

        // above logic guarantees we have two components as there is exactly
        // one separator
        let components = value.leak().split(sep).collect_vec();

        let (month, year) = match (components[0], components[1]) {
            (month, year) if month.len() <= 2 && year.len() == 2 => {
                // maybe make this a bit smarter? :)
                // this will work for the next 70ish years
                (month, format!("20{}", year))
            }
            (month, year) if month.len() <= 2 && year.len() == 4 => (month, year.to_string()),
            (year, month) if month.len() <= 2 && year.len() == 4 => (month, year.to_string()),
            _ => return Err(Error::InvalidExpiration),
        };

        Ok(Expiration {
            month: Self::validate_month(month)?,
            year: Self::validate_year(&year)?,
        })
    }

    fn validate_year(year: &str) -> VResult<PiiString> {
        let _ = year.parse::<u32>()?;
        Ok(PiiString::from(year))
    }

    fn validate_month(month: &str) -> VResult<PiiString> {
        if month.parse::<u8>()? > 12 {
            return Err(Error::InvalidMonth);
        }
        let month = if month.len() == 2 {
            month.to_string()
        } else {
            format!("0{}", month)
        };
        Ok(PiiString::from(month))
    }
}

impl From<Expiration> for PiiString {
    fn from(Expiration { month, year }: Expiration) -> Self {
        PiiString::from(format!("{}/{}", month.leak(), year.leak()))
    }
}

fn validate_cc_cvc(value: PiiString, alias: &AliasId, all_data: &AllData) -> VResult<PiiString> {
    if value.leak().chars().any(|c| !c.is_numeric()) {
        return Err(Error::NonDigitCharacter);
    }
    if value.leak().len() < 3 || value.leak().len() > 4 {
        return Err(Error::InvalidLength);
    }

    // Then try to validate the CVC length as a function of the card issuer
    let number_di = CI {
        alias: alias.clone(),
        kind: CDK::Number,
    };
    let validated_card_number = all_data
        .get(&number_di.into())
        .map(|v| v.clone().as_string())
        .transpose()?
        .and_then(|v| CardValidate::from(v.leak()).ok());
    if let Some(card_number) = validated_card_number {
        let expected_length = match CardIssuer::from(card_number.card_type) {
            CardIssuer::Amex => 4,
            _ => 3,
        };
        if value.leak().len() != expected_length {
            return Err(Error::InvalidLength);
        }
    }
    Ok(value)
}

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use super::{CDK, CDK::*, CI};
    use crate::{AliasId, PiiJsonValue, PiiString, Validate, ValidateArgs};
    use test_case::test_case;

    // Invalid prefix
    #[test_case(Number, "1234123412341234" => None)]
    #[test_case(Number, "372658627861003" => Some("372658627861003".to_owned()))]
    #[test_case(Number, "4428680502681658" => Some("4428680502681658".to_owned()))]
    // Invalid checksum thing
    #[test_case(Number, "4428680502681659" => None)]
    #[test_case(Cvc, "12" => None)]
    #[test_case(Cvc, "123" => Some("123".to_owned()))]
    #[test_case(Cvc, "1234" => Some("1234".to_owned()))]
    #[test_case(Cvc, "12345" => None)]
    fn test_clean_and_validate_field_not_bifrost(kind: CDK, pii: &str) -> Option<String> {
        let alias = AliasId::from("flerp".to_owned());
        let args = ValidateArgs {
            for_bifrost: true,
            ..ValidateArgs::for_tests()
        };
        CI { alias, kind }
            .validate(PiiJsonValue::string(pii), args, &HashMap::new())
            .ok()
            .and_then(|pii| pii.into_iter().next())
            .map(|pii| pii.1.leak_to_string())
    }

    #[test_case("4428680502681658" => Some("4428680502681658".to_owned()))]
    // This has invalid luhn and should succeed
    #[test_case("4428680502681659" => Some("4428680502681659".to_owned()))]
    // Even though luhn validation is silenced, this shouldn't be parseable
    #[test_case("4428" => None)]
    fn test_validate_ignore_luhn(pii: &str) -> Option<String> {
        let alias = AliasId::from("flerp".to_owned());
        let args = ValidateArgs {
            for_bifrost: true,
            ignore_luhn_validation: true,
            ..ValidateArgs::for_tests()
        };
        CI {
            alias,
            kind: CDK::Number,
        }
        .validate(PiiJsonValue::string(pii), args, &HashMap::new())
        .ok()
        .and_then(|pii| pii.into_iter().next())
        .map(|pii| pii.1.leak_to_string())
    }

    // Visa
    #[test_case("4428680502681658", "123" => true)]
    #[test_case("4428680502681658", "1234" => false)]
    // Amex
    #[test_case("346501315038265", "123" => false)]
    #[test_case("346501315038265", "1234" => true)]
    fn test_validate_cvc(card_number: &str, cvc: &str) -> bool {
        let alias = AliasId::from("flerp".to_owned());
        let args = ValidateArgs::for_tests();
        let number_di = CI {
            alias: alias.clone(),
            kind: CDK::Number,
        };
        let other_data = [(number_di.into(), PiiJsonValue::string(card_number))]
            .into_iter()
            .collect();
        let cvc_di = CI {
            alias,
            kind: CDK::Cvc,
        };
        cvc_di
            .validate(PiiJsonValue::string(cvc), args, &other_data)
            .is_ok()
    }

    #[test_case("12/24" => Some("12/2024".into()))]
    #[test_case("3/24" => Some("03/2024".into()))]
    #[test_case("4-24" => Some("04/2024".into()))]
    #[test_case("2024-12" => Some("12/2024".into()))]
    #[test_case("2024/11" => Some("11/2024".into()))]
    #[test_case("13/24" => None)]
    #[test_case("10/3044" => Some("10/3044".into()))]
    #[test_case("13/124" => None)]
    #[test_case("311/23" => None)]
    #[test_case("11/23/25" => None)]
    #[test_case("8/1325" => Some("08/1325".into()))]
    #[test_case("8/4" => None)]
    fn test_expiration(input: &str) -> Option<String> {
        super::Expiration::validate(&PiiString::from(input))
            .ok()
            .map(PiiString::from)
            .map(|p| p.leak().to_string())
    }

    #[test_case("Alex Grinman" => true)]
    #[test_case("Alissa P Hacker" => true)]
    #[test_case("Ben 😃 Bitdiddle" => true)]
    fn test_card_name(name: &str) -> bool {
        super::validate_card_name(PiiString::try_from(name).unwrap()).is_ok()
    }
}
