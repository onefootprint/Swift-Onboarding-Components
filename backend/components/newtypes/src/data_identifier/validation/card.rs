use super::{utils, Error, VResult};
use crate::{AliasId, AllData, CardDataKind as CDK, CardInfo as CI, PiiString, ValidateArgs};
use crate::{NtResult, Validate};
use card_validate::Validate as CardValidate;
use itertools::Itertools;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::{Display, EnumString};

impl Validate for CI {
    fn validate(&self, value: PiiString, args: ValidateArgs, all_data: &AllData) -> NtResult<PiiString> {
        let Self { alias, kind } = self;
        let result = match kind {
            CDK::Number => validate_card_number(value, args)?,
            CDK::Cvc => validate_cc_cvc(value, alias, all_data)?,
            CDK::Expiration => Expiration::validate(&value)?.into(),
            CDK::ExpMonth => Expiration::validate_month(value.leak())?,
            CDK::ExpYear => Expiration::validate_year(value.leak())?,
            CDK::Last4 => validate_card_number_last4(value)?,
            CDK::Name => validate_card_name(value)?,
            CDK::BillingZip => utils::clean_and_validate_zip(value)?,
            CDK::BillingCountry => utils::clean_and_validate_country(value)?,
            CDK::Issuer => utils::parse_enum::<CardIssuer>(value)?,
        };
        Ok(result)
    }
}

#[derive(Debug, Clone, Copy, DeserializeFromStr, SerializeDisplay, EnumString, Display)]
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

fn validate_card_number(value: PiiString, args: ValidateArgs) -> VResult<PiiString> {
    if args.ignore_luhn_validation {
        // Silence almost all validation for a handful of cards that don't obey the normal validation rules
        if !value.leak().chars().all(|c| c.is_numeric()) {
            return Err(Error::CardError(
                "Invalid format. Please verify that the number is correct".to_owned(),
            ));
        }
        if value.len() < 10 || value.len() > 19 {
            return Err(Error::CardError(
                "Invalid length. Please verify that the number is correct".to_owned(),
            ));
        }
        return Ok(value);
    } else {
        CardValidate::from(value.leak()).map_err(|e| {
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
    }
    Ok(value)
}

fn validate_card_number_last4(value: PiiString) -> VResult<PiiString> {
    if !(value.leak().len() == 4 && value.leak().chars().all(|c| c.is_ascii_digit())) {
        return Err(Error::CardError("Card last 4 are invalid".into()));
    }
    Ok(value)
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
pub struct Expiration {
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
    pub fn validate(value: &PiiString) -> VResult<Expiration> {
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

    use super::CDK::*;
    use super::{CDK, CI};
    use crate::{AliasId, Validate};
    use crate::{PiiString, ValidateArgs};
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
            .validate(PiiString::new(pii.to_owned()), args, &HashMap::new())
            .ok()
            .map(|pii| pii.leak_to_string())
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
        .validate(PiiString::new(pii.to_owned()), args, &HashMap::new())
        .ok()
        .map(|pii| pii.leak_to_string())
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
        let other_data = [(number_di.into(), PiiString::new(card_number.into()))]
            .into_iter()
            .collect();
        let cvc_di = CI {
            alias,
            kind: CDK::Cvc,
        };
        cvc_di
            .validate(PiiString::new(cvc.into()), args, &other_data)
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
