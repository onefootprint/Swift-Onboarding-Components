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
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EA,
        // Exact SSN match, Exact Name match, Close Address match
        #[ser = "EB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        EB,
        // Exact SSN match, Close Name match, Exact Address match
        #[ser = "EC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        EC,
        // Exact SSN match, Exact Name match, Partial Address match
        #[ser = "ED"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        ED,
        // Exact SSN match, Exact Name match, Low Confidence Address match
        #[ser = "EE"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        EE,
        // Exact SSN match, Exact Name match, No Address match
        #[ser = "EF"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        EF,
        // Exact SSN match, Close Name match, Close Address match
        #[ser = "EH"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EH,
        // Exact SSN match, Partial Name match, Exact Address match
        #[ser = "EI"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        EI,
        // Exact SSN match, Close Name match, Partial Address match
        #[ser = "EJ"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EJ,
        // Exact SSN match, Close Name match, Low Confidence Address match
        #[ser = "EN"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EN,
        // Exact SSN match, Close Name match, No Address match
        #[ser = "EO"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EO,
        // Close SSN match, Exact Name match, Exact Address match
        #[ser = "CA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        CA,
        // Close SSN match, Exact Name match, Close Address match
        #[ser = "CB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CB,
        // Close SSN match, Close Name match, Exact Address match
        #[ser = "CC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CC,
        // Close SSN match, Exact Name match, Partial Address match
        #[ser = "CD"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CD,
        // Close SSN match, Exact Name match, Low Confidence Address match
        #[ser = "CE"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        CE,
        // Close SSN match, Exact Name match, No Address match
        #[ser = "CF"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        CF,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Exact Address match
        #[ser = "4A"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        FourA,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Close Address match
        #[ser = "4B"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        FourB,
        // Exact SSN match (only last 4 digits provided), Close Name match, Exact Address match
        #[ser = "4C"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        FourC,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Partial Address match
        #[ser = "4D"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        FourD,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Low Confidence Address match
        #[ser = "4E"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        FourE,
        // Exact SSN match (only last 4 digits provided), Exact Name match, No Address match
        #[ser = "4F"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        FourF,
        // Missing SSN, Exact Name match, Exact Address match
        #[ser = "MA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        MA,
        // Exact SSN match, No Name match, Exact Address match
        #[ser = "EK"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        EK,
        // Exact SSN match, Partial Name match, Close Address match
        #[ser = "EM"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EM,
        // Exact SSN match, Partial Name match, Partial Address match
        #[ser = "ER"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        ER,
        // Exact SSN match, Partial Name match, Low Confidence Address match
        #[ser = "ET"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        ET,
        // Close SSN match, Close Name match, Close Address match
        #[ser = "CH"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CH,
        // Close SSN match, Partial Name match, Exact Address match
        #[ser = "CI"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CI,
        // Close SSN match, Close Name match, Partial Address match
        #[ser = "CJ"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CJ,
        // Close SSN match, Close Name match, Low Confidence Address match
        #[ser = "CN"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CN,
        // Close SSN match, Close Name match, No Address match
        #[ser = "CO"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CO,
        // Partial SSN match, Exact Name match, Exact Address match
        #[ser = "PA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        PA,
        // Partial SSN match, Exact Name match, Close Address match
        #[ser = "PB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PB,
        // Partial SSN match, Close Name match, Exact Address match
        #[ser = "PC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        PC,
        // Partial SSN match, Exact Name match, Partial Address match
        #[ser = "PD"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PD,
        // Partial SSN match, Exact Name match, Low Confidence Address match
        #[ser = "PE"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        PE,
        // Partial SSN match, Exact Name match, No Address match
        #[ser = "PF"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        PF,
        // Exact SSN match (only last 4 digits provided), Close Name match, Close Address match
        #[ser = "4H"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        FourH,
        // Exact SSN match (only last 4 digits provided), Partial Name match, Exact Address match
        #[ser = "4I"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        FourI,
        // Exact SSN match (only last 4 digits provided), Close Name match, Partial Address match
        #[ser = "4J"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        FourJ,
        // Exact SSN match (only last 4 digits provided), Close Name match, Low Confidence Address match
        #[ser = "4N"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        FourN,
        // Exact SSN match (only last 4 digits provided), Close Name match, No Address match
        #[ser = "4O"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        FourO,
        // No match to SSN, Exact Name match, Exact Address match
        #[ser = "FA"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        FA,
        // No match to SSN, Exact Name match, Close Address match
        #[ser = "FB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        FB,
        // No match to SSN, Close Name match, Exact Address match
        #[ser = "FC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        FC,
        // Missing SSN, Exact Name match, Close Address match
        #[ser = "MB"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        MB,
        // Missing SSN, Close Name match, Exact Address match
        #[ser = "MC"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        MC,
        //
        // Level 0 Default cases
        //
        // No Match
        #[ser = "NX"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        NX,

        // Input SSN is missing
        #[ser = "MX"]
        #[footprint_reason_codes = ExpSsnRCH::new(Ssn9(NoMatch), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        MX,

        // Invalid SSN (no search performed)
        #[ser = "IX"]
        #[footprint_reason_codes = ExpSsnRCH::new(SsnInvalid, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        IX,

        // SSN is an ITIN (no search performed)
        #[ser = "VC"]
        #[footprint_reason_codes = ExpSsnRCH::new(SsnIsItin, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        VX
    }
}

#[derive(PartialEq, Eq, Debug, Clone)]
pub enum ExperianMatchLevel {
    Level5,
    Level4,
    Level3,
    Level2,
    Level1,
    Level0,
}
impl From<ExperianSSNReasonCodes> for ExperianMatchLevel {
    fn from(code: ExperianSSNReasonCodes) -> Self {
        use ExperianSSNReasonCodes::*;
        match code {
            EA | EB | EC | ED | EE | EF => Self::Level5,
            EH | EI | EJ | EN | EO | CA | CB | CC | CD | CE | CF | FourA | FourB | FourC | FourD | FourE
            | FourF | MA => Self::Level4,
            EK | EM | ER | ET | CH | CI | CJ | CN | CO | PA | PB | PC | PD | PE | PF | FourH | FourI
            | FourJ | FourN | FourO | FA | FB | FC | MB | MC => Self::Level3,
            NX | MX | IX | VX => Self::Level0,
        }
    }
}
impl ExperianSSNReasonCodes {
    pub fn input_missing_ssn(&self) -> bool {
        matches!(self, ExperianSSNReasonCodes::MX)
    }
}

#[cfg(test)]
mod tests {
    use strum::IntoEnumIterator;
    use test_case::test_case;

    use crate::{ExperianMatchLevel, ExperianSSNReasonCodes, FootprintReasonCode};
    use FootprintReasonCode::*;

    #[test_case(ExperianSSNReasonCodes::EA => vec![NameMatches, AddressMatches, SsnMatches])]
    fn test_experian_address_and_name_match_reason_codes(
        reason_code: ExperianSSNReasonCodes,
    ) -> Vec<FootprintReasonCode> {
        (&reason_code).into()
    }

    #[test]
    fn test_level_mapping() {
        let l5_frcs: Vec<Vec<FootprintReasonCode>> = ExperianSSNReasonCodes::iter()
            .filter(|rc| ExperianMatchLevel::from(rc.clone()) == ExperianMatchLevel::Level5)
            .map(|rc| std::convert::Into::<Vec<FootprintReasonCode>>::into(&rc))
            .collect();

        // not many other tests we can really do here unfortunately
        assert!(l5_frcs
            .iter()
            .all(|frcs_per_code| frcs_per_code.contains(&FootprintReasonCode::SsnMatches)))
    }
}
