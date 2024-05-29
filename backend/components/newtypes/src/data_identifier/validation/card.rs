use super::{
    utils,
    Error,
    VResult,
};
use crate::{
    AliasId,
    AllData,
    CardDataKind as CDK,
    CardInfo as CI,
    CleanAndValidate,
    DataIdentifierValue,
    NtResult,
    PiiJsonValue,
    PiiString,
    ValidateArgs,
};
use card_validate::Validate as CardValidate;
use itertools::Itertools;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use std::str::FromStr;
use strum::{
    Display,
    EnumIter,
    EnumString,
};

pub enum CardData {
    CardNumber(CardNumber),
    LuhnValidatedCardNumber(LuhnValidatedCardNumber),
    Expiration(CardExpiration),
}

pub struct CardNumber {
    pub(crate) alias: AliasId,
    pub(crate) number: PiiString,
}

pub struct LuhnValidatedCardNumber {
    pub(crate) number: CardNumber,
    pub(crate) issuer: CardIssuer,
}

pub struct CardExpiration {
    pub(crate) alias: AliasId,
    pub(crate) expiration: Expiration,
}

impl CleanAndValidate for CI {
    type Parsed = Option<CardData>;

    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        args: ValidateArgs,
        all_data: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        let Self { alias, kind } = &self;
        let value = value.as_string()?;

        let (value, card_data) = match kind {
            CDK::Cvc => (validate_cc_cvc(value, alias, all_data)?, None),
            CDK::Name => (validate_card_name(value)?, None),
            CDK::BillingZip => (utils::clean_and_validate_zip(value)?, None),
            CDK::BillingCountry => (utils::clean_and_validate_country(value)?, None),
            CDK::Number => parse_card_number(alias, value, args).map(|(v, cd)| (v, Some(cd)))?,
            CDK::Expiration => parse_expiration(alias, value).map(|(v, cd)| (v, Some(cd)))?,
            CDK::Last4 => (validate_last_4(value)?, None),
            CDK::Issuer => (validate_issuer(value)?, None),
            CDK::ExpMonth => (Expiration::validate_month(value.leak())?, None),
            CDK::ExpYear => (Expiration::validate_year(value.leak())?, None),
        };

        Ok(DataIdentifierValue {
            di: self.into(),
            value,
            parsed: card_data,
        })
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

fn parse_card_number(
    alias: &AliasId,
    value: PiiString,
    args: ValidateArgs,
) -> NtResult<(PiiString, CardData)> {
    if args.ignore_luhn_validation {
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
        return Ok((
            value.clone(),
            CardData::CardNumber(CardNumber {
                alias: alias.clone(),
                number: value,
            }),
        ));
    }

    // Derive the issuer
    let validated = CardValidate::from(value.leak()).map_err(|e| {
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

    Ok((
        value.clone(),
        CardData::LuhnValidatedCardNumber(LuhnValidatedCardNumber {
            number: CardNumber {
                alias: alias.clone(),
                number: value,
            },
            issuer: CardIssuer::from(validated.card_type),
        }),
    ))
}

fn parse_expiration(alias: &AliasId, value: PiiString) -> NtResult<(PiiString, CardData)> {
    let expiration = Expiration::parse(&value)?;

    Ok((
        expiration.clone().into(),
        CardData::Expiration(CardExpiration {
            alias: alias.clone(),
            expiration,
        }),
    ))
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

fn validate_last_4(value: PiiString) -> VResult<PiiString> {
    if value.leak().chars().any(|c| !c.is_numeric()) {
        return Err(Error::NonDigitCharacter);
    }
    if value.len() != 4 {
        return Err(Error::InvalidLength);
    }

    Ok(value)
}

fn validate_issuer(value: PiiString) -> VResult<PiiString> {
    let issuer = CardIssuer::from_str(value.leak())?;
    Ok(issuer.to_string().into())
}

#[derive(Debug, Clone)]
pub(crate) struct Expiration {
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
    fn parse(value: &PiiString) -> VResult<Expiration> {
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
        let month_int = month.parse::<u8>()?;
        if !(1..=12).contains(&month_int) {
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

    let len = value.leak().len();
    if !(len == 3 || len == 4) {
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
    use super::CDK::{
        self,
        *,
    };
    use super::{
        parse_expiration,
        CI,
    };
    use crate::{
        AliasId,
        CardData,
        CleanAndValidate,
        DataIdentifier,
        PiiJsonValue,
        PiiString,
        ValidateArgs,
    };
    use std::collections::HashMap;
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
            .clean_and_validate(PiiJsonValue::string(pii), args, &HashMap::new())
            .ok()
            .map(|div| div.value.leak_to_string())
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
        .clean_and_validate(PiiJsonValue::string(pii), args, &HashMap::new())
        .ok()
        .map(|div| div.value.leak_to_string())
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
        let cvc_di = DataIdentifier::Card(CI {
            alias,
            kind: CDK::Cvc,
        });
        cvc_di
            .clean_and_validate(PiiJsonValue::string(cvc), args, &other_data)
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
    #[test_case("1/123" => None)]
    #[test_case("1/0" => None; "Invalid 1")]
    #[test_case("1/000" => None; "Invalid 3")]
    #[test_case("0/0" => None; "Invalid 5")]
    #[test_case("0/00" => None; "Invalid 6")]
    #[test_case("0/000" => None; "Invalid 7")]
    #[test_case("0/0000" => None; "Invalid 8")]
    #[test_case("0/23" => None; "Invalid 9")]
    #[test_case("0/123" => None; "Invalid 10")]
    #[test_case("0/2023" => None; "Invalid 11")]
    #[test_case("00/0" => None; "Invalid 12")]
    #[test_case("00/00" => None; "Invalid 13")]
    #[test_case("00/000" => None; "Invalid 14")]
    #[test_case("00/0000" => None; "Invalid 15")]
    #[test_case("00/23" => None; "Invalid 16")]
    #[test_case("00/123" => None; "Invalid 17")]
    #[test_case("00/2023" => None; "Invalid 18")]
    #[test_case("1-0" => None; "Invalid 19")]
    #[test_case("1-000" => None; "Invalid 21")]
    #[test_case("0-0" => None; "Invalid 23")]
    #[test_case("0-00" => None; "Invalid 24")]
    #[test_case("0-000" => None; "Invalid 25")]
    #[test_case("0-0000" => None; "Invalid 26")]
    #[test_case("0-23" => None; "Invalid 27")]
    #[test_case("0-123" => None; "Invalid 28")]
    #[test_case("0-2023" => None; "Invalid 29")]
    #[test_case("00-0" => None; "Invalid 30")]
    #[test_case("00-00" => None; "Invalid 31")]
    #[test_case("00-000" => None; "Invalid 32")]
    #[test_case("00-0000" => None; "Invalid 33")]
    #[test_case("00-23" => None; "Invalid 34")]
    #[test_case("00-123" => None; "Invalid 35")]
    #[test_case("00-2023" => None; "Invalid 36")]
    #[test_case("January 2023" => None; "Invalid 37")]
    #[test_case("Jan 2023" => None; "Invalid 38")]
    #[test_case("Jan. 2023" => None; "Invalid 39")]
    #[test_case("01/2023" => Some("01/2023".into()); "Valid 1")]
    #[test_case("12/2023" => Some("12/2023".into()); "Valid 2")]
    #[test_case("02/0000" => Some("02/0000".into()); "Valid 3")]
    #[test_case("03/1990" => Some("03/1990".into()); "Valid 4")]
    #[test_case("01-2023" => Some("01/2023".into()); "Valid 5")]
    #[test_case("12-2023" => Some("12/2023".into()); "Valid 6")]
    #[test_case("02-0000" => Some("02/0000".into()); "Valid 7")]
    #[test_case("03-1990" => Some("03/1990".into()); "Valid 8")]
    #[test_case("01/23" => Some("01/2023".into()); "Valid 9")]
    #[test_case("12/23" => Some("12/2023".into()); "Valid 10")]
    #[test_case("02/00" => Some("02/2000".into()); "Valid 11")]
    #[test_case("03/90" => Some("03/2090".into()); "Valid 12")]
    #[test_case("01-23" => Some("01/2023".into()); "Valid 13")]
    #[test_case("12-23" => Some("12/2023".into()); "Valid 14")]
    #[test_case("02-00" => Some("02/2000".into()); "Valid 15")]
    #[test_case("03-90" => Some("03/2090".into()); "Valid 16")]
    #[test_case("1/23" => Some("01/2023".into()); "Valid 17")]
    #[test_case("2/00" => Some("02/2000".into()); "Valid 18")]
    #[test_case("3/90" => Some("03/2090".into()); "Valid 19")]
    #[test_case("1-23" => Some("01/2023".into()); "Valid 20")]
    #[test_case("2-00" => Some("02/2000".into()); "Valid 21")]
    #[test_case("3-90" => Some("03/2090".into()); "Valid 22")]
    #[test_case("1/00" => Some("01/2000".into()); "Valid 23")]
    #[test_case("1/0000" => Some("01/0000".into()); "Valid 24")]
    #[test_case("1-00" => Some("01/2000".into()); "Valid 25")]
    #[test_case("1-0000" => Some("01/0000".into()); "Valid 26")]
    fn test_expiration(input: &str) -> Option<String> {
        let alias = AliasId::fixture();

        parse_expiration(&alias, PiiString::from(input))
            .ok()
            .map(|(cleaned, _)| cleaned.leak().to_string())
    }

    #[test_case("Alex Grinman" => true)]
    #[test_case("Alissa P Hacker" => true)]
    #[test_case("Ben 😃 Bitdiddle" => true)]
    fn test_card_name(name: &str) -> bool {
        super::validate_card_name(PiiString::from(name)).is_ok()
    }

    #[test]
    fn test_exp_year_formatting() {
        let alias = AliasId::fixture();
        let (cleaned, card_data) = parse_expiration(&alias, PiiString::from("12/35")).unwrap();
        assert_eq!(cleaned.leak(), "12/2035");

        match card_data {
            CardData::Expiration(ce) => {
                assert_eq!(ce.expiration.month.leak(), "12");
                assert_eq!(ce.expiration.year.leak(), "2035");
            }
            _ => panic!("wrong type for card_data"),
        }
    }
}
