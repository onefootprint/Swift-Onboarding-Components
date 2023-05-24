use strum_macros::{EnumIter, EnumString};

use super::experian_reason_code_helpers::{AddressGrouping::*, NameGrouping::*, SsnTypes::*, *};
use crate::{experian_reason_code_enum, FootprintReasonCode, MatchLevel::*};

// As of 2023-05-18 we consider Experian's "Level 5 and Level 4" matching.
// If we receive a code that isn't covered here, we consider SSN, name and address to be not matching
//
// TODO: https://linear.app/footprint/issue/FP-4280/change-fulladdresspartial-to-be-its-own-reason-code
experian_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum ExperianSSNReasonCodes {
        // Exact SSN match, Exact Name match, Exact Address match
        #[ser = "EA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Exact), FullAddress(Exact)).into()]
        EA,
        // Exact SSN match, Exact Name match, Close Address match
        #[ser = "EB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Exact), FullAddress(Partial)).into()]
        EB,
        // Exact SSN match, Close Name match, Exact Address match
        #[ser = "EC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(Exact)).into()]
        EC,
        // Exact SSN match, Exact Name match, Partial Address match
        #[ser = "ED"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Exact), FullAddress(Partial)).into()]
        ED,
        // Exact SSN match, Exact Name match, Low Confidence Address match
        #[ser = "EE"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Exact), FullAddress(NoMatch)).into()]
        EE,
        // Exact SSN match, Exact Name match, No Address match
        #[ser = "EF"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Exact), FullAddress(NoMatch)).into()]
        EF,
        // Exact SSN match, Exact Name match, Address missing
        #[ser = "EG"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Exact), FullAddress(NoMatch)).into()]
        EG,
        // Exact SSN match, Close Name match, Close Address match
        #[ser = "EH"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(Partial)).into()]
        EH,
        // Exact SSN match, Partial Name match, Exact Address match
        #[ser = "EI"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(Exact)).into()]
        EI,
        // Exact SSN match, Close Name match, Partial Address match
        #[ser = "EJ"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(Partial)).into()]
        EJ,
        // Exact SSN match, Name missing, Exact Address match
        #[ser = "EL"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(NoMatch), FullAddress(Exact)).into()]
        EL,
        // Exact SSN match, Close Name match, Low Confidence Address match
        #[ser = "EN"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(NoMatch)).into()]
        EN,
        // Exact SSN match, Close Name match, No Address match
        #[ser = "EO"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(NoMatch)).into()]
        EO,
        // Exact SSN match, Close Name match, Address missing
        #[ser = "EP"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(NoMatch)).into()]
        EP,
        // Close SSN match, Exact Name match, Exact Address match
        #[ser = "CA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(Exact)).into()]
        CA,
        // Close SSN match, Exact Name match, Close Address match
        #[ser = "CB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(Partial)).into()]
        CB,
        // Close SSN match, Close Name match, Exact Address match
        #[ser = "CC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(Exact)).into()]
        CC,
        // Close SSN match, Exact Name match, Partial Address match
        #[ser = "CD"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(Partial)).into()]
        CD,
        // Close SSN match, Exact Name match, Low Confidence Address match
        #[ser = "CE"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(NoMatch)).into()]
        CE,
        // Close SSN match, Exact Name match, No Address match
        #[ser = "CF"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(NoMatch)).into()]
        CF,
        // Close SSN match, Exact Name match, Address missing
        #[ser = "CG"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(NoMatch)).into()]
        CG,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Exact Address match
        #[ser = "4A"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Exact), FullAddress(Exact)).into()]
        FourA,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Close Address match
        #[ser = "4B"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Exact), FullAddress(Partial)).into()]
        FourB,
        // Exact SSN match (only last 4 digits provided), Close Name match, Exact Address match
        #[ser = "4C"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Partial), FullAddress(Exact)).into()]
        FourC,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Partial Address match
        #[ser = "4D"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Exact), FullAddress(Partial)).into()]
        FourD,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Low Confidence Address match
        #[ser = "4E"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Exact), FullAddress(NoMatch)).into()]
        FourE,
        // Exact SSN match (only last 4 digits provided), Exact Name match, No Address match
        #[ser = "4F"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Exact), FullAddress(NoMatch)).into()]
        FourF,
        // Missing SSN, Exact Name match, Exact Address match
        #[ser = "MA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(Exact), FullAddress(Exact)).into()]
        MA,
        // Exact SSN match, No Name match, Exact Address match
        #[ser = "EK"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(NoMatch), FullAddress(Exact)).into()]
        EK,
        // Exact SSN match, Partial Name match, Close Address match
        #[ser = "EM"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(Partial)).into()]
        EM,
        // Exact SSN match, Partial Name match, Partial Address match
        #[ser = "ER"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(Partial)).into()]
        ER,
        // Exact SSN match, Partial Name match, Low Confidence Address match
        #[ser = "ET"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullName(Partial), FullAddress(NoMatch)).into()]
        ET,
        // Close SSN match, Close Name match, Close Address match
        #[ser = "CH"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(Partial)).into()]
        CH,
        // Close SSN match, Partial Name match, Exact Address match
        #[ser = "CI"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(Exact)).into()]
        CI,
        // Close SSN match, Close Name match, Partial Address match
        #[ser = "CJ"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(Partial)).into()]
        CJ,
        // Close SSN match, Name missing, Exact Address match
        #[ser = "CL"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(NoMatch), FullAddress(Exact)).into()]
        CL,
        // Close SSN match, Close Name match, Low Confidence Address match
        #[ser = "CN"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(NoMatch)).into()]
        CN,
        // Close SSN match, Close Name match, No Address match
        #[ser = "CO"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(NoMatch)).into()]
        CO,
        // Close SSN match, Close Name match, Address missing
        #[ser = "CP"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(NoMatch)).into()]
        CP,
        // Partial SSN match, Exact Name match, Exact Address match
        #[ser = "PA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(Exact)).into()]
        PA,
        // Partial SSN match, Exact Name match, Close Address match
        #[ser = "PB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(Partial)).into()]
        PB,
        // Partial SSN match, Close Name match, Exact Address match
        #[ser = "PC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Partial), FullAddress(Exact)).into()]
        PC,
        // Partial SSN match, Exact Name match, Partial Address match
        #[ser = "PD"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(Partial)).into()]
        PD,
        // Partial SSN match, Exact Name match, Low Confidence Address match
        #[ser = "PE"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(NoMatch)).into()]
        PE,
        // Partial SSN match, Exact Name match, No Address match
        #[ser = "PF"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(NoMatch)).into()]
        PF,
        // Partial SSN match, Exact Name match, Address missing
        #[ser = "PG"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullName(Exact), FullAddress(NoMatch)).into()]
        PG,
        // Exact SSN match (only last 4 digits provided), Close Name match, Close Address match
        #[ser = "4H"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Partial), FullAddress(Partial)).into()]
        FourH,
        // Exact SSN match (only last 4 digits provided), Partial Name match, Exact Address match
        #[ser = "4I"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Partial), FullAddress(Exact)).into()]
        FourI,
        // Exact SSN match (only last 4 digits provided), Close Name match, Partial Address match
        #[ser = "4J"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Partial), FullAddress(Partial)).into()]
        FourJ,
        // Exact SSN match (only last 4 digits provided), Name missing, Exact Address match
        #[ser = "4L"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(NoMatch), FullAddress(Exact)).into()]
        FourL,
        // Exact SSN match (only last 4 digits provided), Close Name match, Low Confidence Address match
        #[ser = "4N"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Partial), FullAddress(NoMatch)).into()]
        FourN,
        // Exact SSN match (only last 4 digits provided), Close Name match, No Address match
        #[ser = "4O"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Partial), FullAddress(NoMatch)).into()]
        FourO,
        // Exact SSN match (only last 4 digits provided), Close Name match, Address missing
        #[ser = "4P"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullName(Partial), FullAddress(NoMatch)).into()]
        FourP,
        // No match to SSN, Exact Name match, Exact Address match
        #[ser = "FA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(Exact), FullAddress(Exact)).into()]
        FA,
        // No match to SSN, Exact Name match, Close Address match
        #[ser = "FB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(Exact), FullAddress(Partial)).into()]
        FB,
        // No match to SSN, Close Name match, Exact Address match
        #[ser = "FC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(Partial), FullAddress(Exact)).into()]
        FC,
        // Missing SSN, Exact Name match, Close Address match
        #[ser = "MB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(Exact), FullAddress(Partial)).into()]
        MB,
        // Missing SSN, Close Name match, Exact Address match
        #[ser = "MC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(Partial), FullAddress(Exact)).into()]
        MC,
        //
        // Level 0 Default cases
        //
        // No Match
        #[ser = "NX"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(NoMatch), FullAddress(NoMatch)).into()]
        NX,

        // Input SSN is missing
        #[ser = "MX"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullName(NoMatch), FullAddress(NoMatch)).into()]
        MX,

        // Invalid SSN (no search performed)
        #[ser = "IX"]
        #[footprint_reason_codes = ExpSsnRCH::new(SsnInvalid, FullName(NoMatch), FullAddress(NoMatch)).into()]
        IX,

        // SSN is an ITIN (no search performed)
        #[ser = "VC"]
        #[footprint_reason_codes = ExpSsnRCH::new(SsnIsItin, FullName(NoMatch), FullAddress(NoMatch)).into()]
        VX
    }
}

impl ExperianSSNReasonCodes {
    pub fn input_missing_ssn(&self) -> bool {
        matches!(self, ExperianSSNReasonCodes::MX)
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use crate::{ExperianSSNReasonCodes, FootprintReasonCode};
    use FootprintReasonCode::*;

    #[test_case(ExperianSSNReasonCodes::EA => vec![NameFirstMatches, NameLastMatches, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches, SsnMatches])]
    fn test_experian_address_and_name_match_reason_codes(
        reason_code: ExperianSSNReasonCodes,
    ) -> Vec<FootprintReasonCode> {
        (&reason_code).into()
    }
}
