use crate::{experian_address_reason_code_enum, vendor_reason_code_enum, FootprintReasonCode};
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

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    #[serde(try_from = "&str")]
    pub enum ExperianFraudShieldCodes {
        // Address used on the inquiry is different GLB from the address Experian has as the consumer’s best, most current address.
        #[ser = "01", description = "Inquiry/On-file Current Address Conflict"]
        #[footprint_reason_code = None]
        InputAddressConflict,
        // Address used on the inquire was first GLB reported for the consumer within the last 90 days.
        #[ser = "02", description = "Inquiry Address First Reported < 90 Days"]
        #[footprint_reason_code = None]
        InputAddressFirstResponseRecently,
        // Inquiry address does not match an address GLB that File One has for this consumer
        #[ser = "03", description = "Inquiry Current Address Not On-file"]
        #[footprint_reason_code = None]
        InputAddressNotOnFile,
        // The issues date of the SSN provided on the GLB inquiry cannot be verified by the Social Security Administration (SSA).
        #[ser = "04", description = "Input SSN Issue Date Cannot Be Verified"]
        #[footprint_reason_code = None]
        InputSSNIssueDataCannotBeVerified,
        // The SSA has reported that death benefits GLB are being paid on this SSN submitted on the inquiry.
        #[ser = "05", description = "Inquiry SSN Recorded As Deceased"]
        #[footprint_reason_code = Some(FootprintReasonCode::SubjectDeceased)]
        InputSSNDeceased,
        // The Age used on the inquiry is younger GLB than the SSN issue date.
        #[ser = "06", description = "Inquiry Age Younger Than SSN Issue Date"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnIssuedPriorToDob)]
        InputAgeYoungerThanSSN,
        // The consumer established credit before the FCRA age of 18.
        #[ser = "07", description = "Credit Established Before Age 18"]
        #[footprint_reason_code = None]
        CreditEstablishedBefore18,
        // The consumer’s first trade was opened prior FCRA to the SSN issue date.
        #[ser = "08", description = "Credit Established Prior To SSN Issue Date"]
        #[footprint_reason_code = None]
        CreditEstablishedBeforeSSNDate,
        // More than 3 inquiries have been posted to FCRA the consumer’s profile within the last 30 days
        #[ser = "09", description = "More Than 3 Inquiries In Last 30 Days"]
        #[footprint_reason_code = None]
        MoreThan3InquiriesRecently,
        // The inquiry address is a business address GLB having a potential for fraudulent activity.
        #[ser = "10", description = "Inquiry Address: Alert"]
        #[footprint_reason_code = None]
        InputAddressAlert,
        // The inquiry address is a business address GLB
        #[ser = "11", description = "Inquiry Address: Non-Residential"]
        #[footprint_reason_code = None]
        InputAddressNonResidential,
        // According to File One, the SSN used is GLB more closely associated with another consumer.
        #[ser = "13", description = "High Probability SSN Belongs To Another"]
        #[footprint_reason_code = None]
        InputAddressProbablyBelongsToAnother,
        // The SSN provided is not a valid number as GLB reported by the SSA.
        #[ser = "14", description = "Inquiry SSN Format Is Invalid"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputIsInvalid)]
        InputSSNFormatInvalid,
        // Fraud has been perpetrated at the inquiry GLB address.
        #[ser = "15", description = "Inquiry Address: Cautious"]
        #[footprint_reason_code = None]
        InputAddressCautious,
        // One of the consumer’s on-file addresses is a GLB business address having a potential for fraudulent activity.
        #[ser = "16", description = "On-File Address: Alert"]
        #[footprint_reason_code = None]
        LocatedAddressAlert,
        // One of the consumer’s on-file addresses is a GLB business address.
        #[ser = "17", description = "On-File Address: Non-Residential"]
        #[footprint_reason_code = None]
        LocatedAddressNonResidential,
        // Fraud has been perpetrated at the GLB consumer’s on-file addresses.
        #[ser = "18", description = "On-File Address: Cautious"]
        #[footprint_reason_code = None]
        LocatedAddressCautious,
        // The consumer’s current address on the FCRA credit report has only been reported by the more recently opened trade.
        #[ser = "19", description = "Current Address Rpt By New Trade"]
        #[footprint_reason_code = None]
        CurrentAddressReportByNewTrade,
        // The consumer’s current address has been FCRA reported by a trade opened within the last 90 days.
        #[ser = "20", description = "Current Address Rpt By Trade Open < 90 Days"]
        #[footprint_reason_code = None]
        CurrentAddressReportByTradeOpenedRecently,
        // The SSA has reported that death benefits GLB are being paid on the best on-file SSN.
        #[ser = "25", description = "Best On-File SSN Recorded As Deceased"]
        #[footprint_reason_code = None]
        BestLocatedSSNDeceased,
        // The issues date of the best on-file SSN GLB cannot be verified by the SSA.
        #[ser = "26", description = "Best On-File SSN Issue Date Cannot Be Verified"]
        #[footprint_reason_code = None]
        BestLocatedSSNCannotBeVerified,
        // According to File One, the SSN used is FCRA more frequently reported for another consumer.
        #[ser = "27", description = "SSN Reported More Frequently For Another"]
        #[footprint_reason_code = None]
        SSNReportedMoreFrequentlyForAnother
    }
}

impl serde::Serialize for ExperianFraudShieldCodes {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
    }
}

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    #[serde(try_from = "&str")]
    pub enum ExperianDobMatchReasonCodes {
        #[ser = "1", description = "Match"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobMatches)]
        Match,
        #[ser = "2", description = "Partial match"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobPartialMatch)]
        PartialMatch,
        #[ser = "3", description = "No match"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobDoesNotMatch)]
        NoMatch,
        #[ser = "4", description = "Not on file"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobNotOnFile)]
        NotOnFile,
        #[ser = "5", description = "SSN not on file, search cannot be performed"]
        #[footprint_reason_code = None]
        SsnNotOnFile,
        #[ser = "6", description = "DOB not provided on search request"]
        #[footprint_reason_code = None]
        DobNotProvided,
        // bifrost will ensure we collect correctly formatted DOB
        #[ser = "7", description = "Invalid DOB format"]
        #[footprint_reason_code = None]
        InvalidFormat,
        #[ser = "8", description = "YOB only exact match (no +/- 1 year logic accommodation)"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobMobDoesNotMatch)]
        YobOnlyExactMatch,
        #[ser = "9", description = "DOB and MOB exact match, YOB exact match (no +/- 1 year logic accommodation)"]
        #[footprint_reason_code = None]
        DobMobExactMatchYobWithin1Year,
        // yeah I was gonna say, seems like too many numbers, let's switch to letters, makes sense
        #[ser = "A", description = "MOB exact match, YOB partial match (+/- 1 year)"]
        #[footprint_reason_code = None]
        MobExactMatchYobWithin1Year,
        #[ser = "B", description = "MOB exact match, YOB exact match (no +/- 1 year logic accommodation)"]
        #[footprint_reason_code = None]
        MobYobExactMatch,
        #[ser = "C", description = "DOB and MOB exact match, YOB +/- 10 years exactly"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobYobDoesNotMatchWithin1Year)]
        DobMobExactMatchYobWithin10Years,
        #[ser = "D", description = "MOB exact match, YOB +/- 10 years exactly"]
        #[footprint_reason_code = None]
        MobExactMatchYobWithin10Years,
        #[ser = "E", description = "DOB and MOB exact match, no YOB match"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobYobDoesNotMatch)]
        DobMobExactMatch
    }
}

impl serde::Serialize for ExperianDobMatchReasonCodes {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
    }
}

use super::experian_reason_code_helpers::{AddressAttribute::*, AddressGrouping::*, NameGrouping::*, *};
use crate::MatchLevel::*;

// As of 2023-05-18 we consider Experian's "Level 5 and Level 4" matching.
// If we receive a code that isn't covered here, we consider both the name and address to be not matching
experian_address_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum ExperianAddressAndNameMatchReasonCodes {
    // Exact match on first and last name; Exact match on address
    #[ser = "A1"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), FullAddress(Exact)).into()]
    A1,
    // Exact match on first name, last name matches one of hyphenated last names; Exact match on address
    #[ser = "H1"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), FullAddress(Exact)).into()]
    H1,
    // First name matches last, last name matches first (exact matches only); Exact match on address
    #[ser = "Q1"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), FullAddress(Exact)).into()]
    Q1,
    // Exact match on first and last name; Misspelling of street name (all other fields match)
    #[ser = "A2"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, NoMatch)])).into()]
    A2,
    // Exact match on first and last name; Street number missing on input (all other fields match)
    #[ser = "A5"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetNumber, NoMatch)])).into()]
    A5,
    // Exact match on first and last name; No match to city (all other fields match)
    #[ser = "A7"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(City, NoMatch)])).into()]
    A7,
    // Exact match on first and last name; No match to ZIP code (all other fields match)
    #[ser = "A8"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    A8,
    // Exact match on first and last name; Partial match to street name (all other fields match)
    #[ser = "AC"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    AC,
    // Exact match on first and last name; Partial match to street name and no match to city (all other fields match)
    #[ser = "AF"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
    AF,
    // Exact match on first and last name; Close match to street name; no match to city (all other fields match)
    #[ser = "AG"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
    AG,
    // Exact match on first and last name; Close match to street name; no match to state (all other fields match)
    #[ser = "AH"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
    AH,
    // Exact match on first and last name; Close match to street name; no match to ZIP code (all other fields match)
    #[ser = "AJ"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
    AJ,
    // Exact match on first and last name; Partial match to street name; no match to state (all other fields match)
    #[ser = "AK"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
    AK,
    // Exact match on first and last name; No match to state (all other fields match)
    #[ser = "AU"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(State, NoMatch)])).into()]
    AU,
    // Exact match on first and last name; Partial match to street name; no match to ZIP code (all fields match)
    #[ser = "AV"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
    AV,
    // Misspelling of either first OR last name; Exact match on address
    #[ser = "C1"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), FullAddress(Exact)).into()]
    C1,
    // Misspelling of either first OR last name; Misspelling of street name (all other fields match)
    #[ser = "C2"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    C2,
    // Misspelling of either first OR last name; No match to city (all other fields match)
    #[ser = "C7"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(City, NoMatch)])).into()]
    C7,
    // Misspelling of either first OR last name; No match to ZIP code (all other fields match)
    #[ser = "C8"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    C8,
    // Misspelling of either first OR last name; Partial match to street name (all other fields match)
    #[ser = "CC"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    CC,
    // Misspelling of either first OR last name; No match to state (all other fields match)
    #[ser = "CU"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(State, NoMatch)])).into()]
    CU,
    // Misspelling of first AND last name; Exact match on address
    #[ser = "D1"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), FullAddress(Exact)).into()]
    D1,
    // Misspelling of first AND last name; Misspelling of street name (all other fields match)
    #[ser = "D2"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    D2,
    // Misspelling of first AND last name; No match to city (all other fields match)
    #[ser = "D7"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(City, NoMatch)])).into()]
    D7,
    // Misspelling of first AND last name; No match to ZIP code (all other fields match)
    #[ser = "D8"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    D8,
    // Misspelling of first AND last name; Partial match to street name (all other fields match)
    #[ser = "DC"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    DC,
    // Misspelling of first AND last name; No match to state (all other fields match)
    #[ser = "DU"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Partial), AddressExactExcept(vec![(State, NoMatch)])).into()]
    DU,
    // Exact match on first name, last name matches one of hyphenated last names; Misspelling of street name (all other fields match)
    #[ser = "H2"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    H2,
    // Exact match on first name, last name matches one of hyphenated last names; Street number missing on input (all other fields match)
    #[ser = "H5"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetNumber, NoMatch)])).into()]
    H5,
    // Exact match on first name, last name matches one of hyphenated last names; No match to city
    #[ser = "H7"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(City, NoMatch)])).into()]
    H7,
    // Exact match on first name, last name matches one of hyphenated last names; No match to ZIP
    #[ser = "H8"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    H8,
    // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name (all other fields match)
    #[ser = "HC"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    HC,
    // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name and no match to city (all other fields match)
    #[ser = "HF"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
    HF,
    // Exact match on first name, last name matches one of hyphenated last names; Close match to street name; no match to city (all other fields match)
    #[ser = "HG"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
    HG,
    // Exact match on first name, last name matches one of hyphenated last names; Close match to street name; no match to state (all other fields match)
    #[ser = "HH"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
    HH,
    // Exact match on first name, last name matches one of hyphenated last names; Close match to street name; no match to ZIP code (all other fields match)
    #[ser = "HJ"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
    HJ,
    // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name; no match to state (all other fields match)
    #[ser = "HK"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
    HK,
    // Exact match on first name, last name matches one of hyphenated last names; No match to state
    #[ser = "HU"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(State, NoMatch)])).into()]
    HU,
    // Exact match on first name, last name matches one of hyphenated last names; Partial match to street name; no match to ZIP code (all other fields match)
    #[ser = "HV"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
    HV,
    // First name misspelled, last name matches one of hyphenated last names; Exact match on address
    #[ser = "I1"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), FullAddress(Exact)).into()]
    I1,
    // First name misspelled, last name matches one of hyphenated last names; Misspelling of street name (all other fields match)
    #[ser = "I2"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    I2,
    // First name misspelled, last name matches one of hyphenated last names; No match to city (all other fields match)
    #[ser = "I7"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(City, NoMatch)])).into()]
    I7,
    // First name misspelled, last name matches one of hyphenated last names; No match to ZIP code (all other fields match)
    #[ser = "I8"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    I8,
    // First name misspelled, last name matches one of hyphenated last names; Partial match to street name (all other fields match)
    #[ser = "IC"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    IC,
    // First name misspelled, last name matches one of hyphenated last names; No match to state (all other fields match)
    #[ser = "IU"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(State, NoMatch)])).into()]
    IU,
    // Partial match on first name, last name matches on one of hyphenated last names; Exact match on address
    #[ser = "P1"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), FullAddress(Exact)).into()]
    P1,
    // Partial match on first name, last name matches on one of hyphenated last names; Misspelling of street name (all other fields match)
    #[ser = "P2"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    P2,
    // Partial match on first name, last name matches on one of hyphenated last names; No match to city (all other fields match)
    #[ser = "P7"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(City, NoMatch)])).into()]
    P7,
    // Partial match on first name, last name matches on one of hyphenated last names; No match to ZIP code (all other fields match)
    #[ser = "P8"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    P8,
    // Partial match on first name, last name matches on one of hyphenated last names; Partial match to street name (all other fields match)
    #[ser = "PC"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    PC,
    // Partial match on first name, last name matches on one of hyphenated last names; No match to state (all other fields match)
    #[ser = "PU"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(State, NoMatch)])).into()]
    PU,

    // NOTE:
    // Considering these as exact matches, but we'd need to swap fields maybe
    //
    // First name matches last, last name matches first (exact matches only); Misspelling of street name (all other fields match)
    #[ser = "Q2"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    Q2,
    // First name matches last, last name matches first (exact matches only); Street number missing on input (all other fields match)
    #[ser = "Q5"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetNumber, NoMatch)])).into()]
    Q5,
    // First name matches last, last name matches first (exact matches only); No match to city (all other fields match)
    #[ser = "Q7"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(City, NoMatch)])).into()]
    Q7,
    // First name matches last, last name matches first (exact matches only); No match to ZIP code all other ones match
    #[ser = "Q8"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    Q8,
    // First name matches last, last name matches first (exact matches only); Partial match to street name (all other fields match)
    #[ser = "QC"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    QC,
    // First name matches last, last name matches first (exact matches only); Partial match to street name and no match to city (all other fields match)
    #[ser = "QF"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
    QF,
    // First name matches last, last name matches first (exact matches only); Close match to street name; no match to city (all other fields match)
    #[ser = "QG"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (City, NoMatch)])).into()]
    QG,
    // First name matches last, last name matches first (exact matches only); Close match to street name; no match to state (all other fields match)
    #[ser = "QH"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
    QH,
    // First name matches last, last name matches first (exact matches only); Close match to street name; no match to ZIP code (all other fields match)
    #[ser = "QJ"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
    QJ,
    // First name matches last, last name matches first (exact matches only); Partial match to street name, no match to state (all other fields match)
    #[ser = "OK"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (State, NoMatch)])).into()]
    OK,
    // First name matches last, last name matches first (exact matches only); No match to state (all other fields match)
    #[ser = "QU"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(State, NoMatch)])).into()]
    QU,
    // First name matches last, last name matches first (exact matches only); Partial match to street name; no match to ZIP code (all other fields match)
    #[ser = "QV"]
    #[footprint_reason_codes = ExpRCH::new(FullName(Exact), AddressExactExcept(vec![(StreetName, Partial), (Zip, NoMatch)])).into()]
    QV,
    // Partial match on first name, exact match on last name; Exact match on address
    #[ser = "R1"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), FullAddress(Exact)).into()]
    R1,
    // Partial match on first name, exact match on last name; Misspelling of street name (all other fields match)
    #[ser = "R2"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    R2,
    // Partial match on first name, exact match on last name; No match to city (all other fields match)
    #[ser = "R7"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(City, NoMatch)])).into()]
    R7,
    // Partial match on first name, exact match on last name; No match to ZIP code (all other fields match)
    #[ser = "R8"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(Zip, NoMatch)])).into()]
    R8,
    // Partial match on first name, exact match on last name; Partial match to street name (all other
    #[ser = "RC"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(StreetName, Partial)])).into()]
    RC,
    // Partial match on first name, exact match on last name; No match to state (all other fields
    #[ser = "RU"]
    #[footprint_reason_codes = ExpRCH::new(FirstAndLast((Partial, Exact)), AddressExactExcept(vec![(State, NoMatch)])).into()]
    RU,
    #[ser = "DEFAULT_NO_MATCH"]
    #[footprint_reason_codes = ExpRCH::new(FullName(NoMatch), FullAddress(NoMatch)).into()]
    DefaultNoMatch
    }
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use crate::{ExperianAddressAndNameMatchReasonCodes, FootprintReasonCode};
    use FootprintReasonCode::*;

    // TODO: add more tests
    #[test_case(ExperianAddressAndNameMatchReasonCodes::A1 => vec![NameFirstMatches, NameLastMatches, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    fn test_experian_address_and_name_match_reason_codes(
        reason_code: ExperianAddressAndNameMatchReasonCodes,
    ) -> Vec<FootprintReasonCode> {
        (&reason_code).into()
    }
}
