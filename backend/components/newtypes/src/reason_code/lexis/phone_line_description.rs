use crate::FootprintReasonCode::*;
use crate::{
    vendor_reason_code_enum,
    FootprintReasonCode,
};
use strum_macros::EnumString;

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, Hash)]
    #[serde(try_from = "&str")]
    pub enum PhoneLineDescription {

        #[ser = "L", description = "Landline"]
        #[footprint_reason_code = None]
        Landline,

        #[ser = "W", description = "Wireless"]
        #[footprint_reason_code = None]
        Wireless,

        #[ser = "V", description = "Voip"]
        #[footprint_reason_code = Some(PhoneNumberLocatedIsVoip)]
        Voip,

        #[ser = "U", description = "Unknown"]
        #[footprint_reason_code = None]
        Unknown
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::FootprintReasonCode;
    use test_case::test_case;

    #[test_case(PhoneLineDescription::Landline => None)]
    #[test_case(PhoneLineDescription::Voip => Some(PhoneNumberLocatedIsVoip))]
    fn test(pld: PhoneLineDescription) -> Option<FootprintReasonCode> {
        (&pld).into()
    }
}
