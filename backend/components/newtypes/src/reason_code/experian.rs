use crate::{vendor_reason_code_enum, FootprintReasonCode};
use strum::EnumIter;
use strum_macros::EnumString;

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    #[serde(try_from = "&str")]
    pub enum ExperianIDScreeningV3ModelCodes {
        #[ser = "IS01", description = "Authentication of ID elements across multiple sources indicative of fraud risk"]
        #[footprint_reason_code = None]
        FraudRisk,
        #[ser = "IS02", description = "Address associated with risk"]
        #[footprint_reason_code = None]
        AddressRisk,
        #[ser = "IS03", description = "Email and/or IP address associated with risk"]
        #[footprint_reason_code = None]
        EmailAndOrIpRisk,
        #[ser = "IS04", description = "Time of application associated with risk"]
        #[footprint_reason_code = None]
        TimeOfApplicationRisk,
        #[ser = "IS05", description = "Location inconsistency associated with risk"]
        #[footprint_reason_code = None]
        LocationIncosistencyRisk,
        #[ser = "IS06", description = "Recent history of phone number associated with risk"]
        #[footprint_reason_code = None]
        PhoneHistoryRisk,
        #[ser = "IS07", description = "Recent history of SSN associated with risk"]
        #[footprint_reason_code = None]
        SSNHistoryRisk,
        #[ser = "IS08", description = "Recent history of name and address associated with risk"]
        #[footprint_reason_code = None]
        NameAndAddressHistoryRisk,
        #[ser = "IS09", description = "Recent history of identity elements associated with risk"]
        #[footprint_reason_code = None]
        IdentityRisk,
        #[ser = "S999", description = "No reason code available"]
        #[footprint_reason_code = None]
        NoReasonCodeAvailable
    }
}

impl serde::Serialize for ExperianIDScreeningV3ModelCodes {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
    }
}
