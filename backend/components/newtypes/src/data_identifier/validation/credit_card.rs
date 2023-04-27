use super::{Error, VResult};
use crate::{CreditCardDataKind as CCDK, CreditCardInfo as CCI, PiiString};
use crate::{NtResult, Validate};
use card_validate::Validate as CardValidate;

impl Validate for CCI {
    fn validate(&self, value: PiiString, _for_bifrost: bool) -> NtResult<PiiString> {
        let Self { alias: _, kind } = self;
        let result = match kind {
            CCDK::Number => validate_cc_number(value)?,
            CCDK::ExpMonth => validate_cc_month(value)?,
            CCDK::ExpYear => validate_cc_year(value)?,
            CCDK::Cvc => validate_cc_cvc(value)?,
            CCDK::Last4 => validate_cc_last4(value)?,
        };
        Ok(result)
    }
}

fn validate_cc_number(value: PiiString) -> VResult<PiiString> {
    CardValidate::from(value.leak()).map_err(|e| Error::CreditCardError(format!("{:?}", e)))?;
    Ok(value)
}

fn validate_cc_month(value: PiiString) -> VResult<PiiString> {
    let month: u32 = value.leak().parse()?;
    if month > 12 {
        return Err(Error::InvalidMonth);
    }
    Ok(value)
}

fn validate_cc_year(value: PiiString) -> VResult<PiiString> {
    // TODO more advanced expiration checking
    let _: u32 = value.leak().parse()?;
    Ok(value)
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

fn validate_cc_last4(value: PiiString) -> VResult<PiiString> {
    if value.leak().chars().any(|c| !c.is_numeric()) {
        return Err(Error::NonDigitCharacter);
    }
    if value.leak().len() != 4 {
        return Err(Error::InvalidLength);
    }
    Ok(value)
}

#[cfg(test)]
mod test {
    use super::CCDK::*;
    use super::{CCDK, CCI};
    use crate::PiiString;
    use crate::{AliasId, Validate};
    use test_case::test_case;

    // Invalid prefix
    #[test_case(Number, "1234123412341234" => None)]
    #[test_case(Number, "372658627861003" => Some("372658627861003".to_owned()))]
    #[test_case(Number, "4428680502681658" => Some("4428680502681658".to_owned()))]
    // Invalid checksum thing
    #[test_case(Number, "4428680502681659" => None)]
    #[test_case(ExpMonth, "12" => Some("12".to_owned()))]
    #[test_case(ExpMonth, "-1" => None)]
    #[test_case(ExpMonth, "13" => None)]
    #[test_case(ExpYear, "2013" => Some("2013".to_owned()))]
    #[test_case(ExpYear, "2 013" => None)]
    #[test_case(Cvc, "12" => None)]
    #[test_case(Cvc, "123" => Some("123".to_owned()))]
    #[test_case(Cvc, "1234" => Some("1234".to_owned()))]
    #[test_case(Cvc, "12345" => None)]
    #[test_case(Last4, "123" => None)]
    #[test_case(Last4, "1234" => Some("1234".to_owned()))]
    #[test_case(Last4, "12-" => None)]
    fn test_clean_and_validate_field_not_bifrost(kind: CCDK, pii: &str) -> Option<String> {
        let alias = AliasId::from("flerp".to_owned());
        CCI { alias, kind }
            .validate(PiiString::new(pii.to_owned()), false)
            .ok()
            .map(|pii| pii.leak_to_string())
    }
}
