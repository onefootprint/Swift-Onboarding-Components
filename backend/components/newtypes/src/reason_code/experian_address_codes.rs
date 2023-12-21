use strum_macros::{EnumIter, EnumString};

use super::reason_code_helpers::{AddressAttribute::*, AddressGrouping::*, NameGrouping::*, *};
use crate::{vendor_reason_codes_enum, FootprintReasonCode, MatchLevel::*};

// As of 2023-05-18 we consider Experian's "Level 5 and Level 4" matching.
// If we receive a code that isn't covered here, we consider both the name and address to be not matching
vendor_reason_codes_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum ExperianAddressAndNameMatchReasonCodes {
        // Exact match on first and last name; Exact match on address
        #[ser = "A1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Exact)).into()]
        A1,
        // Exact match on first name, last name matches one of hyphenated last names; Exact match on address
        #[ser = "H1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Exact)).into()]
        H1,
        // First name matches last, last name matches first (exact matches only); Exact match on address
        #[ser = "Q1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Exact)).into()]
        Q1,
        // Exact match on first and last name; Misspelling of street name (all other fields match)
        #[ser = "A2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, NoMatch)])).into()]
        A2,
        // Exact match on first and last name; Street number missing on input (all other fields match)
        #[ser = "A5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetNumber, NoMatch)])).into()]
        A5,
        // Exact match on first and last name; No match to city (all other fields match)
        #[ser = "A7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(City, NoMatch)])).into()]
        A7,
        // Exact match on first and last name; No match to ZIP code (all other fields match)
        #[ser = "A8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        A8,
        // Exact match on first and last name; Partial match to street name (all other fields match)
        #[ser = "AC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        AC,
        // Exact match on first and last name; Partial match to street name and no match to city (all other fields match)
        #[ser = "AF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
        AF,
        // Exact match on first and last name; Close match to street name; no match to city (all other fields match)
        #[ser = "AG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
        AG,
        // Exact match on first and last name; Close match to street name; no match to state (all other fields match)
        #[ser = "AH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
        AH,
        // Exact match on first and last name; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "AJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
        AJ,
        // Exact match on first and last name; Partial match to street name; no match to state (all other fields match)
        #[ser = "AK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
        AK,
        // Exact match on first and last name; No match to state (all other fields match)
        #[ser = "AU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(State, NoMatch)])).into()]
        AU,
        // Exact match on first and last name; Partial match to street name; no match to ZIP code (all fields match)
        #[ser = "AV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
        AV,
        // Misspelling of either first OR last name; Exact match on address
        #[ser = "C1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        C1,
        // Misspelling of either first OR last name; Misspelling of street name (all other fields match)
        #[ser = "C2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        C2,
        // Misspelling of either first OR last name; No match to city (all other fields match)
        #[ser = "C7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(City, NoMatch)])).into()]
        C7,
        // Misspelling of either first OR last name; No match to ZIP code (all other fields match)
        #[ser = "C8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        C8,
        // Misspelling of either first OR last name; Partial match to street name (all other fields match)
        #[ser = "CC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        CC,
        // Misspelling of either first OR last name; No match to state (all other fields match)
        #[ser = "CU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(State, NoMatch)])).into()]
        CU,
        // Misspelling of first AND last name; Exact match on address
        #[ser = "D1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        D1,
        // Misspelling of first AND last name; Misspelling of street name (all other fields match)
        #[ser = "D2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        D2,
        // Misspelling of first AND last name; No match to city (all other fields match)
        #[ser = "D7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(City, NoMatch)])).into()]
        D7,
        // Misspelling of first AND last name; No match to ZIP code (all other fields match)
        #[ser = "D8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        D8,
        // Misspelling of first AND last name; Partial match to street name (all other fields match)
        #[ser = "DC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        DC,
        // Misspelling of first AND last name; No match to state (all other fields match)
        #[ser = "DU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), AddressExactExcept(vec![(State, NoMatch)])).into()]
        DU,
        // Exact match on first name, last name matches one of hyphenated last names; Misspelling of street name (all other fields match)
        #[ser = "H2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        H2,
        // Exact match on first name, last name matches one of hyphenated last names; Street number missing on input (all other fields match)
        #[ser = "H5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetNumber, NoMatch)])).into()]
        H5,
        // Exact match on first name, last name matches one of hyphenated last names; No match to city
        #[ser = "H7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(City, NoMatch)])).into()]
        H7,
        // Exact match on first name, last name matches one of hyphenated last names; No match to ZIP
        #[ser = "H8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        H8,
        // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name (all other fields match)
        #[ser = "HC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        HC,
        // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name and no match to city (all other fields match)
        #[ser = "HF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
        HF,
        // Exact match on first name, last name matches one of hyphenated last names; Close match to street name; no match to city (all other fields match)
        #[ser = "HG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
        HG,
        // Exact match on first name, last name matches one of hyphenated last names; Close match to street name; no match to state (all other fields match)
        #[ser = "HH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
        HH,
        // Exact match on first name, last name matches one of hyphenated last names; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "HJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
        HJ,
        // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name; no match to state (all other fields match)
        #[ser = "HK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
        HK,
        // Exact match on first name, last name matches one of hyphenated last names; No match to state
        #[ser = "HU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(State, NoMatch)])).into()]
        HU,
        // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "HV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
        HV,
        // First name misspelled, last name matches one of hyphenated last names; Exact match on address
        #[ser = "I1"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), FullAddress(Exact)).into()]
        I1,
        // First name misspelled, last name matches one of hyphenated last names; Misspelling of street name (all other fields match)
        #[ser = "I2"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        I2,
        // First name misspelled, last name matches one of hyphenated last names; No match to city (all other fields match)
        #[ser = "I7"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(City, NoMatch)])).into()]
        I7,
        // First name misspelled, last name matches one of hyphenated last names; No match to ZIP code (all other fields match)
        #[ser = "I8"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        I8,
        // First name misspelled, last name matches one of hyphenated last names; Partial match to street name (all other fields match)
        #[ser = "IC"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        IC,
        // First name misspelled, last name matches one of hyphenated last names; No match to state (all other fields match)
        #[ser = "IU"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(State, NoMatch)])).into()]
        IU,
        // Partial match on first name, last name matches on one of hyphenated last names; Exact match on address
        #[ser = "P1"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), FullAddress(Exact)).into()]
        P1,
        // Partial match on first name, last name matches on one of hyphenated last names; Misspelling of street name (all other fields match)
        #[ser = "P2"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        P2,
        // Partial match on first name, last name matches on one of hyphenated last names; No match to city (all other fields match)
        #[ser = "P7"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(City, NoMatch)])).into()]
        P7,
        // Partial match on first name, last name matches on one of hyphenated last names; No match to ZIP code (all other fields match)
        #[ser = "P8"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        P8,
        // Partial match on first name, last name matches on one of hyphenated last names; Partial match to street name (all other fields match)
        #[ser = "PC"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        PC,
        // Partial match on first name, last name matches on one of hyphenated last names; No match to state (all other fields match)
        #[ser = "PU"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(State, NoMatch)])).into()]
        PU,

        // NOTE:
        // Considering these as exact matches, but we'd need to swap fields maybe
        //
        // First name matches last, last name matches first (exact matches only); Misspelling of street name (all other fields match)
        #[ser = "Q2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        Q2,
        // First name matches last, last name matches first (exact matches only); Street number missing on input (all other fields match)
        #[ser = "Q5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetNumber, NoMatch)])).into()]
        Q5,
        // First name matches last, last name matches first (exact matches only); No match to city (all other fields match)
        #[ser = "Q7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(City, NoMatch)])).into()]
        Q7,
        // First name matches last, last name matches first (exact matches only); No match to ZIP code all other ones match
        #[ser = "Q8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        Q8,
        // First name matches last, last name matches first (exact matches only); Partial match to street name (all other fields match)
        #[ser = "QC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        QC,
        // First name matches last, last name matches first (exact matches only); Partial match to street name and no match to city (all other fields match)
        #[ser = "QF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
        QF,
        // First name matches last, last name matches first (exact matches only); Close match to street name; no match to city (all other fields match)
        #[ser = "QG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
        QG,
        // First name matches last, last name matches first (exact matches only); Close match to street name; no match to state (all other fields match)
        #[ser = "QH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
        QH,
        // First name matches last, last name matches first (exact matches only); Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "QJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
        QJ,
        // First name matches last, last name matches first (exact matches only); Partial match to street name, no match to state (all other fields match)
        #[ser = "OK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
        OK,
        // First name matches last, last name matches first (exact matches only); No match to state (all other fields match)
        #[ser = "QU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(State, NoMatch)])).into()]
        QU,
        // First name matches last, last name matches first (exact matches only); Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "QV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
        QV,
        // Partial match on first name, exact match on last name; Exact match on address
        #[ser = "R1"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), FullAddress(Exact)).into()]
        R1,
        // Partial match on first name, exact match on last name; Misspelling of street name (all other fields match)
        #[ser = "R2"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        R2,
        // Partial match on first name, exact match on last name; No match to city (all other fields match)
        #[ser = "R7"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(City, NoMatch)])).into()]
        R7,
        // Partial match on first name, exact match on last name; No match to ZIP code (all other fields match)
        #[ser = "R8"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
        R8,
        // Partial match on first name, exact match on last name; Partial match to street name (all other
        #[ser = "RC"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
        RC,
        // Partial match on first name, exact match on last name; No match to state (all other fields
        #[ser = "RU"]
        #[footprint_reason_codes = AddressRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(State, NoMatch)])).into()]
        RU,
        // Partial match on first name, exact match on last name; No match to state (all other fields
        #[ser = "XO"]
        #[footprint_reason_codes = AddressRCH::new(FullName(NoMatch), FullAddress(NoMatch)).into()]
        XO,
        #[ser = "DEFAULT_NO_MATCH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(NoMatch), FullAddress(NoMatch)).into()]
        DefaultNoMatch
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use crate::{ExperianAddressAndNameMatchReasonCodes, FootprintReasonCode};
    use FootprintReasonCode::*;

    // TODO: add more tests
    #[test_case(ExperianAddressAndNameMatchReasonCodes::A1 => vec![NameFirstMatches, NameLastMatches, NameMatches, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches, AddressMatches])]
    fn test_experian_address_and_name_match_reason_codes(
        reason_code: ExperianAddressAndNameMatchReasonCodes,
    ) -> Vec<FootprintReasonCode> {
        (&reason_code).into()
    }
}
