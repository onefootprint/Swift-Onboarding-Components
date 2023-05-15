use super::{Error, VResult};
use crate::{CardDataKind as CDK, CardInfo as CI, PiiString, ValidateArgs};
use crate::{NtResult, Validate};
use card_validate::Validate as CardValidate;
use itertools::Itertools;

impl Validate for CI {
    fn validate(&self, value: PiiString, _args: ValidateArgs) -> NtResult<PiiString> {
        let Self { alias: _, kind } = self;
        let result = match kind {
            CDK::Number => validate_card_number(value)?,
            CDK::Cvc => validate_cc_cvc(value)?,
            CDK::Expiration => Expiration::validate(&value)?.into(),
            CDK::ExpMonth => Expiration::validate_month(value.leak())?,
            CDK::ExpYear => Expiration::validate_year(value.leak())?,
            CDK::Last4 => validate_card_number_last4(value)?,
        };
        Ok(result)
    }
}

fn validate_card_number(value: PiiString) -> VResult<PiiString> {
    CardValidate::from(value.leak()).map_err(|e| Error::CardError(format!("{:?}", e)))?;
    Ok(value)
}

fn validate_card_number_last4(value: PiiString) -> VResult<PiiString> {
    if !(value.leak().len() == 4 && value.leak().chars().all(|c| c.is_ascii_digit())) {
        return Err(Error::CardError("card last 4 are invalid".into()));
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

fn validate_cc_cvc(value: PiiString) -> VResult<PiiString> {
    if value.leak().chars().any(|c| !c.is_numeric()) {
        return Err(Error::NonDigitCharacter);
    }
    // TODO this is a slightly new paradigm - the length we expect depends on the card number
    if value.leak().len() < 3 || value.leak().len() > 4 {
        return Err(Error::InvalidLength);
    }
    Ok(value)
}

#[cfg(test)]
mod test {
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
            .validate(PiiString::new(pii.to_owned()), args)
            .ok()
            .map(|pii| pii.leak_to_string())
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
}
