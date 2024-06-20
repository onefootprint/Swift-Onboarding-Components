use super::reason_code_helpers::AddressAttribute::*;
use super::reason_code_helpers::AddressGrouping::*;
use super::reason_code_helpers::NameGrouping::*;
use super::reason_code_helpers::*;
use crate::vendor_reason_codes_enum;
use crate::FootprintReasonCode;
use crate::MatchLevel::*;
use strum_macros::EnumIter;
use strum_macros::EnumString;

// As of 2023-05-18 we consider Experian's "Level 5 and Level 4" matching.
// If we receive a code that isn't covered here, we consider both the name and address to be not
// matching
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
        #[ser = "QK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
        QK,
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

        //
        // L3
        //
        // Exact match on first and last name; No match to street name (all other fields match)
        #[ser = "A3"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        A3,
        // Exact match on first and last name; No match to street number (all other fields match)
        #[ser = "A6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        A6,
        // "Exact match on first and last name; Street number does not match or is missing, close match to street name (all other fields match)	"
        #[ser = "AA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        AA,
        // Exact match on first and last name; Street number and ZIP code are missing or do not match (all other fields match)
        #[ser = "AD"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        AD,
        // Exact match on first and last name; Street number does not match or is missing and partialmatch to street name (all other fields match)
        #[ser = "AE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        AE,
        // Exact match on first and last name; City and state do not match (all other fields match)
        #[ser = "AN"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        AN,
        // Exact match on first and last name; State and ZIP code do not match (all other fields match)
        #[ser = "AP"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        AP,
        // "Exact match on first and last name; Street number and state are missing or do not match (all other fields match)	"
        #[ser = "AQ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        AQ,
        // Exact match on first and last name; Street number and city are missing or do not match (all other fields match)
        #[ser = "AT"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Exact), FullAddress(Partial)).into()]
        AT,
        // 	Misspelling of either first OR last name; Street number missing on input (all other fields
        #[ser = "C5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        C5,
        // 	Misspelling of either first OR last name; No match to street number (all other fields match)match)
        #[ser = "C6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        C6,
        // 	"Misspelling of either first OR last name; Street number does not match or is missing, closematch to street name (all other fields match)	"
        #[ser = "CA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CA,
        // 	"Misspelling of either first OR last name; Street number does not match or is missing and partial match to street name (all other fields match)	"
        #[ser = "CE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CE,
        // 	Misspelling of either first OR last name; Partial match to street name and no match to city (all other fields match)
        #[ser = "CF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CF,
        // 	"Misspelling of either first OR last name; Close match to street name; no match to city (all other fields match)	"
        #[ser = "CG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CG,
        // 	Misspelling of either first OR last name; Close match to street name; no match to state (all other fields match)
        #[ser = "CH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CH,
        // 	Misspelling of either first OR last name; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "CJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CJ,
        // 	Misspelling of either first OR last name; Partial match to street name; no match to state (all other fields match)
        #[ser = "CK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CK,
        // 	Misspelling of either first OR last name; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "CV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        CV,
        // 	Misspelling of first AND last name; Street number missing on input (all other fields match)
        #[ser = "D5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        D5,
        // 	Misspelling of first AND last name; No match to street number (all other fields match)
        #[ser = "D6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        D6,
        // 	Misspelling of first AND last name; Street number does not match or is missing, close match to street name (all other fields match)
        #[ser = "DA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DA,
        // 	Misspelling of first AND last name; Street number does not match or is missing and partialmmatch to street name (all other fields match)
        #[ser = "DE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DE,
        // 	Misspelling of first AND last name; Partial match to street name and no match to city (all other fields match)
        #[ser = "DF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DF,
        // 	Misspelling of first AND last name; Close match to street name; no match to city (all other
        #[ser = "DG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DG,
        // 	Misspelling of first AND last name; Close match to street name; no match to state (all other fields match)
        #[ser = "DH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DH,
        // 	Misspelling of first AND last name; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "DJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DJ,
        // 	Misspelling of first AND last name; Partial match to street name; no match to state (all other fields match)
        #[ser = "DK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DK,
        // 	Misspelling of first AND last name; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "DV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        DV,
        // 	First initial match, exact match on last name; Exact match on address
        #[ser = "E1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        E1,
        // 	First initial match, exact match on last name; Misspelling of street name (all other fields match)
        #[ser = "E2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        E2,
        // 	First initial match, exact match on last name; Street number missing on input (all other fields match)
        #[ser = "E5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        E5,
        // 	First initial match, exact match on last name; No match to city (all other fields match)
        #[ser = "E7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        E7,
        // 	First initial match, exact match on last name; No match to ZIP code (all other fields match)
        #[ser = "E8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        E8,
        // 	First initial match, exact match on last name; Partial match to street name (all other fields match)
        #[ser = "EC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EC,
        // 	First initial match, exact match on last name; Partial match to street name and no match to cit (all other fields match)
        #[ser = "EF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EF,
        // 	First initial match, exact match on last name; Close match to street name; no match to city (all other fields match)
        #[ser = "EG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EG,
        // 	First initial match, exact match on last name; Close match to street name; no match to state (allother fields match)
        #[ser = "EH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EH,
        // 	First initial match, exact match on last name; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "EJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EJ,
        // 	First initial match, exact match on last name; Partial match to street name; no match to state (all other fields match)
        #[ser = "EK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EK,
        // 	First initial match, exact match on last name; No match to state (all other fields match)
        #[ser = "EU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EU,
        // 	First initial match, exact match on last name; Partial match to street name; no match to ZIPcode (all other fields match)
        #[ser = "EV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        EV,
        // 	First initial match, last name misspelled; Exact match on address
        #[ser = "F1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        F1,
        // 	First initial match, last name misspelled; Misspelling of street name (all other fields match)
        #[ser = "F2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        F2,
        // 	First initial match, last name misspelled; Street number missing on input (all other fieldsmatch)
        #[ser = "F5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        F5,
        // 	First initial match, last name misspelled; No match to city (all other fields match)
        #[ser = "F7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        F7,
        // 	First initial match, last name misspelled; No match to ZIP code (all other fields match)
        #[ser = "F8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        F8,
        // 	First initial match, last name misspelled; Partial match to street name (all other fields match)
        #[ser = "FC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FC,
        // 	First initial match, last name misspelled; Partial match to street name and no match to city (allother fields match)
        #[ser = "FF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FF,
        // 	First initial match, last name misspelled; Close match to street name, no match to city (allother fields match)
        #[ser = "FG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FG,
        // 	First initial match, last name misspelled; Close match to street name; no match to state (all other fields match)
        #[ser = "FH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FH,
        // 	First initial match, last name misspelled; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "FJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FJ,
        // 	First initial match, last name misspelled; Partial match to street name; no match to state (all other fields match)
        #[ser = "FK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FK,
        // 	First initial match, last name misspelled; No match to state (all other fields match)
        #[ser = "FU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FU,
        // 	First initial match, last name misspelled; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "FV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        FV,
        // 	First name does not match or is missing, exact match on last name; Exact match on address
        #[ser = "G1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        G1,
        // 	First name does not match or is missing, exact match on last name; Misspelling of street name (all other fields match)
        #[ser = "G2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        G2,
        // 	First name does not match or is missing, exact match on last name; No match to city (all other fields match)
        #[ser = "G7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        G7,
        // 	First name does not match or is missing, exact match on last name; No match to ZIP code (all other fields match)
        #[ser = "G8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        G8,
        // 	First name does not match or is missing, exact match on last name; Partial match to street name (all other fields match)
        #[ser = "GC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        GC,
        // 	First name does not match or is missing, exact match on last name; No match to state (all other fields match)
        #[ser = "GU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        GU,
        // 	Exact match on first name, last name matches one of hyphenated last names; No match to street name (all other fields match)
        #[ser = "H3"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        H3,
        // 	Exact match on first name, last name matches one of hyphenated last names; No match to street number (all other fields match)
        #[ser = "H6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        H6,
        // 	Exact match on first name, last name matches one of hyphenated last names; Street number does not match or is missing, close match to street name (all other fields match)
        #[ser = "HA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        HA,
        // 	Exact match on first name, last name matches one of hyphenated last names; Street number and ZIP code are missing or do not match (all other fields match)
        #[ser = "HD"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        HD,
        // 	Exact match on first name, last name matches one of hyphenated last names; Street number does not match or is missing and partial match to street name (all other fields match)
        #[ser = "HE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        HE,
        // 	Exact match on first name, last name matches one of hyphenated last names; City and state do not match (all other fields match)
        #[ser = "HN"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        HN,
        //   Exact match on first name, last name matches one of hyphenated last name;	State and ZIP code do not match (all other fields match)
        #[ser = "HP"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        HP,
        // 	Exact match on first name, last name matches one of hyphenated last names; Street number and state are missing or do not match (all other fields match)
        #[ser = "HQ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        HQ,
        // 	Exact match on first name, last name matches one of hyphenated last names; Street number and city are missing or do not match (all other fields match)
        #[ser = "HT"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        HT,
        // 	First name misspelled, last name matches one of hyphenated last names; Street number missing on input (all other fields match)
        #[ser = "I5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        I5,
        // 	First name misspelled, last name matches one of hyphenated last names; No match to street number (all other fields match)
        #[ser = "I6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        I6,
        // 	First name misspelled, last name matches one of hyphenated last names; Street number does not match or is missing, close match to street name (all other fields match)
        #[ser = "IA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IA,
        // 	First name misspelled, last name matches one of hyphenated last names; Street number does not match or is missing and partial match to street name (all other fields match)
        #[ser = "IE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IE,
        // 	First name misspelled, last name matches one of hyphenated last names; Partial match to street name and no match to city (all other fields match)
        #[ser = "IF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IF,
        // 	First name misspelled, last name matches one of hyphenated last names; Close match to street name; no match to city (all other fields match)
        #[ser = "IG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IG,
        // 	First name misspelled, last name matches one of hyphenated last names; Close match to street name; no match to state (all other fields match)
        #[ser = "IH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IH,
        // 	First name misspelled, last name matches one of hyphenated last names; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "IJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IJ,
        // 	First name misspelled, last name matches one of hyphenated last names; Partial match to street name; no match to state (all other fields match)
        #[ser = "IK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IK,
        // 	First name misspelled, last name matches one of hyphenated last names; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "IV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        IV,
        // 	First initial match, last name matches one of hyphenated last names; Exact match on address
        #[ser = "J1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        J1,
        // 	First initial match, last name matches one of hyphenated last names; Misspelling of street name (all other fields match)
        #[ser = "J2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        J2,
        // 	First initial match, last name matches one of hyphenated last names; Street number missing on input (all other fields match)
        #[ser = "J5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        J5,
        // 	First initial match, last name matches one of hyphenated last names; No match to city (all other fields match)
        #[ser = "J7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        J7,
        // 	First initial match, last name matches one of hyphenated last names; No match to ZIP code (all other fields match)
        #[ser = "J8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        J8,
        // 	First initial match, last name matches one of hyphenated last names; Partial match to street name (all other fields match)
        #[ser = "JC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JC,
        // 	First initial match, last name matches one of hyphenated last names; Partial match to street name and no match to city (all other fields match)
        #[ser = "JF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JF,
        // 	First initial match, last name matches one of hyphenated last names; Close match to streetname; no match to city (all other fields match)
        #[ser = "JG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JG,
        // 	First initial match, last name matches one of hyphenated last names; Close match to street name, no match to state (all other fields match)
        #[ser = "JH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JH,
        // 	First initial match, last name matches one of hyphenated last names; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "JJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JJ,
        // 	First initial match, last name matches one of hyphenated last names; Partial match to street name; no match to state (all other fields match)
        #[ser = "JK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JK,
        // 	First initial match, last name matches one of hyphenated last names; No match to state (all other fields match)
        #[ser = "JU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JU,
        //  First initial match, last name matches one of hyphenated last names; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "JV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        JV,
        // 	First name does not match or is missing, last name matches on one of hyphenated last names; Exact match on address
        #[ser = "M1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        M1,
        // 	First name does not match or is missing, last name matches on one of hyphenated last names; Misspelling of street name (all other fields match)
        #[ser = "M2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        M2,
        // 	First name does not match or is missing, last name matches on one of hyphenated last names; No match to city (all other fields match)
        #[ser = "M7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        M7,
        // 	 First name does not match or is missing, last is name matches on one of hyphenated last names; No match to ZIP code (all other fields match)
        #[ser = "M8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        M8,
        // 	First name does not match or is missing, last name matches on one of hyphenated last names; Partial match to street name (all other fields match)
        #[ser = "MC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        MC,
        // 	First name does not match or is missing, last name matches on one of hyphenated last names; No match to state (all other fields match)
        #[ser = "MU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        MU,
        // 	Partial match on first name, close match on last name; Exact match on address
        #[ser = "O1"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Exact)).into()]
        O1,
        // 	Partial match on first name, close match on last name; Misspelling of street name (all otherfields match)
        #[ser = "O2"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        O2,
        // 	Partial match on first name, close match on last name; Street number missing on input (allother fields match)
        #[ser = "O5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        O5,
        // 	Partial match on first name, close match on last name; No match to city (all other fields match)
        #[ser = "O7"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        O7,
        // 	Partial match on first name, close match on last name; No match to ZIP code (all other fields match)
        #[ser = "O8"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        O8,
        //  Partial match on first	name, close match on last name; Partial match to street name (all other fields match)
        #[ser = "OC"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OC,
        // 	Partial match on first name, close match on last name; Partial match to street name and no match to city (all other fields match)
        #[ser = "OF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OF,
        // 	Partial match on first name, close match on last name; Close match to street name; no match to city (all other fields match)
        #[ser = "OG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OG,
        //  Partial match on first name, close match on last name; Close match to street name; no match to state (all other fields match)
        #[ser = "OH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OH,
        //  Partial match on first name, close match on last name; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "OJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OJ,
        // 	Partial match on first name, close match on last name; Partial match to street name; no match to state (all other fields match)
        #[ser = "OK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OK,
        //  Partial match on first name, close match on last name, No match to state (all other fields match)
        #[ser = "OU"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OU,
        //  Partial match on first name, close match on last name; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "OV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        OV,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Street number missing on input (all other fields match)
        #[ser = "P5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        P5,
        // 	Partial match on first name, last name matches on one of hyphenated last names; No match to street number (all other fields match)
        #[ser = "P6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        P6,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Street number does not match or is missing, close match to street name (all other fields match)
        #[ser = "PA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PA,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Street number does not match or is missing and partial match to street name (all other fields match)
        #[ser = "PE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PE,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Partial match to street name and no match to city (all other fields match)
        #[ser = "PF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PF,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Close match to street name; no match to city (all other fields match)
        #[ser = "PG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PG,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Close match to street name; no match to state (all other fields match)
        #[ser = "PH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PH,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "PJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PJ,
        // 	Partial match on first name, last name matches on one of hyphenated last names; Partial match to street name; no match to state (all other fields match)
        #[ser = "PK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PK,
        //  Partial match on first name, last name matches on one of hyphenated last names; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "PV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        PV,
        // 	First name matches last, last name matches first (exact matches only); No match to street name (all other fields match)
        #[ser = "Q3"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        Q3,
        // 	First name matches last, last name matches first (exact matches only); No match to street number (all other fields match)
        #[ser = "Q6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        Q6,
        // 	First name matches last, last name matches first (exact matches only); Street number does not match or is missing, close match to street name (all other fields match)
        #[ser = "QA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        QA,
        // 	First name matches last, last name matches first (exact matches only); Street number and ZIP code are missing or do not match (all other fields match)
        #[ser = "QD"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        QD,
        // 	First name matches last, last name matches first (exact matches only); Street number does not match or is missing and partial match to street name (all other fields match)
        #[ser = "QE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        QE,
        // 	First name matches last, last name matches first (exact matches only); City and state do not match (all other fields match)
        #[ser = "QN"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        QN,
        // 	First name matches last, last name matches first (exact matches only); State and ZIP code do not match (all other fields match)
        #[ser = "QP"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        QP,
        //  First name matches last. last name matches first (exact matches only); Street number and state are missing or do not match (all other fields match)
        #[ser = "QQ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        QQ,
        // 	First name matches last, last name matches first (exact matches only); Street number and city are missing or do not match (all other fields match)
        #[ser = "QT"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        QT,
        // 	Partial match on first name, exact match on last name; Street number missing on input (all other fields match)
        #[ser = "R5"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        R5,
        // 	Partial match on first name, exact match on last name; No match to street number (all other fields match)
        #[ser = "R6"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        R6,
        //  Partial match on first name, exact match on last name; Street number does not match or is missing, close match to street name (all other fields match)
        #[ser = "RA"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RA,
        // 	Partial match on first name, exact match on last name; Street number does not match or is missing and partial match to street name (all other fields match)
        #[ser = "RE"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RE,
        // 	Partial match on first name, exact match on last name; Partial match to street name and no match to city (all other fields match)
        #[ser = "RF"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RF,
        //  Partial match on first name, exact match on last	name; Close match to street name; no match to city (all other fields match)
        #[ser = "RG"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RG,
        // 	Partial match on first name, exact match on last name; Close match to street name; no match to state (all other fields match)
        #[ser = "RH"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RH,
        // 	Partial match on first name, exact match on last name; Close match to street name; no match to ZIP code (all other fields match)
        #[ser = "RJ"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RJ,
        // 	Partial match on first name, exact match on last name; Partial match to street name; no match to state (all other fields match)
        #[ser = "RK"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RK,
        // 	Partial match on first name, exact match on last name; Partial match to street name; no match to ZIP code (all other fields match)
        #[ser = "RV"]
        #[footprint_reason_codes = AddressRCH::new(FullName(Partial), FullAddress(Partial)).into()]
        RV,
        //
        // Level 0
        //
        // No match on name; No match on address
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
    use crate::ExperianAddressAndNameMatchReasonCodes;
    use crate::FootprintReasonCode;
    use test_case::test_case;
    use FootprintReasonCode::*;

    // TODO: add more tests
    #[test_case(ExperianAddressAndNameMatchReasonCodes::A1 => vec![NameFirstMatches, NameLastMatches, NameMatches, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches, AddressMatches])]
    fn test_experian_address_and_name_match_reason_codes(
        reason_code: ExperianAddressAndNameMatchReasonCodes,
    ) -> Vec<FootprintReasonCode> {
        (&reason_code).into()
    }
}
