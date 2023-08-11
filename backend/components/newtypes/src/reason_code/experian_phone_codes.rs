use strum_macros::{EnumIter, EnumString};

use super::experian_reason_code_helpers::{AddressGrouping::*, NameGrouping::*, *};
use crate::{experian_reason_code_enum, FootprintReasonCode, MatchLevel::*};

experian_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum ExperianPhoneMatchReasonCodes {
        //
        // Level 5
        //
        // Exact match to Phone, Exact match to Name, Exact match to Address
        #[ser = "EA"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EA,
        // Exact match to Phone, Exact match to Name, Close match to Address
        #[ser = "EB"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EB,
        // Exact match to Phone, Close match to Name, Exact match to Address
        #[ser = "EC"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EC,
        // Exact match to Phone, Exact match to Name, Partial match to Address
        #[ser = "ED"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        ED,
        // Exact match to Phone, Exact match to Name, Low confidence match to Address
        #[ser = "EE"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EE,
        // Exact match to Phone, Exact match to Name, No match to Address
        #[ser = "EF"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EF,
        // Exact match to Phone, Close match to Name, Close match to Address
        #[ser = "EH"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EH,
        //
        // Level 4
        //
        // Exact match to Phone, Partial match to Name, Exact match to Address
        #[ser = "EI"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        EI,
        // Exact match to Phone, Close match to Name, Partial match to Address
        #[ser = "EJ"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EJ,
        // Exact match to Phone, Close match to Name, Low confidence match to Address
        #[ser = "EN"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EN,
        // Exact match to Phone, Close match to Name, No match to Address
        #[ser = "EO"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EO,
        // Close match to Phone, Exact match to Name, Exact match to Address
        #[ser = "CA"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CA,
        // Close match to Phone, Exact match to Name, Close match to Address
        #[ser = "CB"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CB,
        // Close match to Phone, Close match to Name, Exact match to Address
        #[ser = "CC"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CC,
        // Close match to Phone, Exact match to Name, Partial match to Address
        #[ser = "CD"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CD,
        // Close match to Phone, Exact match to Name, Low confidence match to Address
        #[ser = "CE"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CE,
        // Close match to Phone, Exact match to Name, No match to Address
        #[ser = "CF"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        CF,
        // Close match to Phone, Close match to Name, Close match to Address
        #[ser = "CH"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CH,
        // Partial match to Phone, Exact match to Name, Exact match to Address
        #[ser = "PA"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        PA,
        // Partial match to Phone, Exact match to Name, Close match to Address
        #[ser = "PB"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PB,
        // Partial match to Phone, Close match to Name, Exact match to Address
        #[ser = "PC"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        PC,
        // Partial match to Phone, Exact match to Name, Partial match to Address
        #[ser = "PD"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PD,
        // Partial match to Phone, Exact match to Name, Low confidence match to Address
        #[ser = "PE"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PE,
        // Partial match to Phone, Exact match to Name, No match to Address
        #[ser = "PF"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        PF,
        // Partial match to Phone, Close match to Name, Close match to Address
        #[ser = "PH"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PH,

        //
        // Level 3
        //
        // Exact match to Phone, No match to Name, Exact match to Address
        #[ser = "EK"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        EK,
        // Exact match to Phone, Partial match to Name, Close match to Address
        #[ser = "EM"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EM,
        // Exact match to Phone, Partial match to Name, Partial match to Address
        #[ser = "ER"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        ER,
        // Exact match to Phone, Partial match to Name, Low confidence match to Address
        #[ser = "ET"]
        #[footprint_reason_codes = ExpPhRCH::new(Exact, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        ET,
        // Close match to Phone, Partial match to Name, Exact match to Address
        #[ser = "CI"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CI,
        // Close match to Phone, Close match to Name, Partial match to Address
        #[ser = "CJ"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CJ,
        // Close match to Phone, Close match to Name, Low confidence match to Address
        #[ser = "CN"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CN,
        // Close match to Phone, Close match to Name, No match to Address
        #[ser = "CO"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CO,
        // Partial match to Phone, Partial match to Name, Exact match to Address
        #[ser = "PI"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        PI,
        // Partial match to Phone, Close match to Name, Partial match to Address
        #[ser = "PJ"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PJ,

        // Partial match to Phone, Close match to Name, Low confidence match to Address
        #[ser = "PN"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PN,
        // Partial match to Phone, Close match to Name, No match to Address
        #[ser = "PO"]
        #[footprint_reason_codes = ExpPhRCH::new(Partial, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PO,


        // Default no match
        #[ser = "NX"]
        #[footprint_reason_codes = ExpPhRCH::new(NoMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        NX,
        // Missing phone
        #[ser = "MX"]
        #[footprint_reason_codes = vec![]]
        MX
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use crate::{ExperianPhoneMatchReasonCodes, FootprintReasonCode};
    use FootprintReasonCode::*;

    #[test_case(ExperianPhoneMatchReasonCodes::EA => vec![PhoneLocatedMatches])]
    #[test_case(ExperianPhoneMatchReasonCodes::NX => vec![PhoneLocatedDoesNotMatch])]
    fn test_phone_codes(reason_code: ExperianPhoneMatchReasonCodes) -> Vec<FootprintReasonCode> {
        (&reason_code).into()
    }
}
