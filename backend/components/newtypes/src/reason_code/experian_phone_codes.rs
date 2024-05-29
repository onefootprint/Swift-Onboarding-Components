use super::reason_code_helpers::AddressGrouping::*;
use super::reason_code_helpers::NameGrouping::*;
use super::reason_code_helpers::*;
use crate::MatchLevel::*;
use crate::{
    vendor_reason_codes_enum,
    FootprintReasonCode,
};
use strum_macros::{
    EnumIter,
    EnumString,
};

vendor_reason_codes_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum ExperianPhoneMatchReasonCodes {
        //
        // Level 5
        //
        // Exact match to Phone, Exact match to Name, Exact match to Address
        #[ser = "EA"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EA,
        // Exact match to Phone, Exact match to Name, Close match to Address
        #[ser = "EB"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EB,
        // Exact match to Phone, Close match to Name, Exact match to Address
        #[ser = "EC"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EC,
        // Exact match to Phone, Exact match to Name, Partial match to Address
        #[ser = "ED"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        ED,
        // Exact match to Phone, Exact match to Name, Low confidence match to Address
        #[ser = "EE"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EE,
        // Exact match to Phone, Exact match to Name, No match to Address
        #[ser = "EF"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EF,
        // Exact match to Phone, Close match to Name, Close match to Address
        #[ser = "EH"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EH,
        //
        // Level 4
        //
        // Exact match to Phone, Partial match to Name, Exact match to Address
        #[ser = "EI"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        EI,
        // Exact match to Phone, Close match to Name, Partial match to Address
        #[ser = "EJ"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EJ,
        // Exact match to Phone, Close match to Name, Low confidence match to Address
        #[ser = "EN"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EN,
        // Exact match to Phone, Close match to Name, No match to Address
        #[ser = "EO"]
        #[footprint_reason_codes = PhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EO,
        // Close match to Phone, Exact match to Name, Exact match to Address
        #[ser = "CA"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CA,
        // Close match to Phone, Exact match to Name, Close match to Address
        #[ser = "CB"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CB,
        // Close match to Phone, Close match to Name, Exact match to Address
        #[ser = "CC"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CC,
        // Close match to Phone, Exact match to Name, Partial match to Address
        #[ser = "CD"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CD,
        // Close match to Phone, Exact match to Name, Low confidence match to Address
        #[ser = "CE"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CE,
        // Close match to Phone, Exact match to Name, No match to Address
        #[ser = "CF"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        CF,
        // Close match to Phone, Close match to Name, Close match to Address
        #[ser = "CH"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CH,
        // Partial match to Phone, Exact match to Name, Exact match to Address
        #[ser = "PA"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        PA,
        // Partial match to Phone, Exact match to Name, Close match to Address
        #[ser = "PB"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PB,
        // Partial match to Phone, Close match to Name, Exact match to Address
        #[ser = "PC"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        PC,
        // Partial match to Phone, Exact match to Name, Partial match to Address
        #[ser = "PD"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PD,
        // Partial match to Phone, Exact match to Name, Low confidence match to Address
        #[ser = "PE"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PE,
        // Partial match to Phone, Exact match to Name, No match to Address
        #[ser = "PF"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        PF,
        // Partial match to Phone, Close match to Name, Close match to Address
        #[ser = "PH"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PH,

        //
        // Level 3
        //
        // Exact match to Phone, No match to Name, Exact match to Address
        #[ser = "EK"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        EK,
        // Exact match to Phone, Partial match to Name, Close match to Address
        #[ser = "EM"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EM,
        // Exact match to Phone, Partial match to Name, Partial match to Address
        #[ser = "ER"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        ER,
        // Exact match to Phone, Partial match to Name, Low confidence match to Address
        #[ser = "ET"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        ET,
        // Close match to Phone, Partial match to Name, Exact match to Address
        #[ser = "CI"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CI,
        // Close match to Phone, Close match to Name, Partial match to Address
        #[ser = "CJ"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CJ,
        // Close match to Phone, Close match to Name, Low confidence match to Address
        #[ser = "CN"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CN,
        // Close match to Phone, Close match to Name, No match to Address
        #[ser = "CO"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CO,
        // Partial match to Phone, Partial match to Name, Exact match to Address
        #[ser = "PI"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        PI,
        // Partial match to Phone, Close match to Name, Partial match to Address
        #[ser = "PJ"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PJ,

        // Partial match to Phone, Close match to Name, Low confidence match to Address
        #[ser = "PN"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PN,
        // Partial match to Phone, Close match to Name, No match to Address
        #[ser = "PO"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PO,
        //
        // L2
        //
        // Exact match to Phone, No match to Name, Close match to Address
        #[ser = "EQ"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        EQ,
        // Exact match to Phone, Partial match to Name, No match to Address
        #[ser = "EU"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EU,
        // Exact match to Phone, No match to Name, Partial match to Address
        #[ser = "EW"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        EW,
        // Close match to Phone, No match to Name, Exact match to Address
        #[ser = "CK"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        CK,
        // Close match to Phone, Partial match to Name, Close match to Address
        #[ser = "CM"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CM,
        // Close match to Phone, Partial match to Name, Partial match to Address
        #[ser = "CR"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CR,
        // Close match to Phone, Partial match to Name, Low confidence match to Address
        #[ser = "CT"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CT,
        // Partial match to Phone, No match to Name, Exact match to Address
        #[ser = "PK"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        PK,
        // Partial match to Phone, Partial match to Name, Close match to Address
        #[ser = "PM"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PM,
        // Partial match to Phone, Partial match to Name, Partial match to Address
        #[ser = "PR"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PR,
        // Partial match to Phone, Partial match to Name, Low confidence match to Address
        #[ser = "PT"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PT,


        //
        // L1
        //
        // Exact match to Phone, No match to Name, Low confidence match to Address
        #[ser = "EY"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        EY,
        // Exact match to Phone, No match to Name, No match to Address
        #[ser = "EZ"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        EZ,
        // Close match to Phone, No match to Name, Close match to Address
        #[ser = "CQ"]
        #[footprint_reason_codes = PhRCH::new(Partial, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        CQ,
        // Close match to Phone, Partial match to Name, No match to Address
        #[ser = "CU"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CU,
        // Close match to Phone, No match to Name, Partial match to Address
        #[ser = "CW"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        CW,
        // Close match to Phone, No match to Name, Low confidence match to Address
        #[ser = "CY"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        CY,
        // Close match to Phone, No match to Name, No match to Address
        #[ser = "CZ"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        CZ,

        // Phone number is missing
        #[ser = "MX"]
        #[footprint_reason_codes = vec![]]
        MX,
        // Partial match to Phone, No match to Name, Close match to Address
        #[ser = "PQ"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        PQ,
        // Partial match to Phone, Partial match to Name, No match to Address
        #[ser = "PU"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PU,
        // Partial match to Phone, No match to Name, Partial match to Address
        #[ser = "PW"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        PW,
        // Partial match to Phone, No match to Name, Low confidence match to Address
        #[ser = "PY"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        PY,
        // Partial match to Phone, No match to Name, No match to Address
        #[ser = "PZ"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        PZ,
        // Default no match
        #[ser = "NX"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        NX
    }
}

#[cfg(test)]
mod tests {
    use crate::{
        ExperianPhoneMatchReasonCodes,
        FootprintReasonCode,
    };
    use test_case::test_case;
    use FootprintReasonCode::*;

    #[test_case(ExperianPhoneMatchReasonCodes::EA => vec![PhoneLocatedMatches])]
    #[test_case(ExperianPhoneMatchReasonCodes::NX => vec![PhoneLocatedDoesNotMatch])]
    #[test_case(ExperianPhoneMatchReasonCodes::CZ => vec![PhoneLocatedDoesNotMatch])]
    #[test_case(ExperianPhoneMatchReasonCodes::PZ => vec![PhoneLocatedDoesNotMatch])]
    fn test_phone_codes(reason_code: ExperianPhoneMatchReasonCodes) -> Vec<FootprintReasonCode> {
        (&reason_code).into()
    }
}
