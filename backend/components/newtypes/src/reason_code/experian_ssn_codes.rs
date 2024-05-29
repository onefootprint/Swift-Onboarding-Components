use super::reason_code_helpers::AddressGrouping::*;
use super::reason_code_helpers::NameGrouping::*;
use super::reason_code_helpers::SsnTypes::*;
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

// TODO: https://linear.app/footprint/issue/FP-4280/change-fulladdresspartial-to-be-its-own-reason-code
vendor_reason_codes_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum ExperianSSNReasonCodes {
        // Exact SSN match, Exact Name match, Exact Address match
        #[ser = "EA"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        EA,
        // Exact SSN match, Exact Name match, Close Address match
        #[ser = "EB"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        EB,
        // Exact SSN match, Close Name match, Exact Address match
        #[ser = "EC"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        EC,
        // Exact SSN match, Exact Name match, Partial Address match
        #[ser = "ED"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        ED,
        // Exact SSN match, Exact Name match, Low Confidence Address match
        #[ser = "EE"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        EE,
        // Exact SSN match, Exact Name match, No Address match
        #[ser = "EF"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        EF,
        // Exact SSN match, Close Name match, Close Address match
        #[ser = "EH"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EH,
        // Exact SSN match, Partial Name match, Exact Address match
        #[ser = "EI"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        EI,
        // Exact SSN match, Close Name match, Partial Address match
        #[ser = "EJ"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EJ,
        // Exact SSN match, Close Name match, Low Confidence Address match
        #[ser = "EN"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EN,
        // Exact SSN match, Close Name match, No Address match
        #[ser = "EO"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EO,
        // Close SSN match, Exact Name match, Exact Address match
        #[ser = "CA"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        CA,
        // Close SSN match, Exact Name match, Close Address match
        #[ser = "CB"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CB,
        // Close SSN match, Close Name match, Exact Address match
        #[ser = "CC"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CC,
        // Close SSN match, Exact Name match, Partial Address match
        #[ser = "CD"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        CD,
        // Close SSN match, Exact Name match, Low Confidence Address match
        #[ser = "CE"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        CE,
        // Close SSN match, Exact Name match, No Address match
        #[ser = "CF"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        CF,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Exact Address match
        #[ser = "4A"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        FourA,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Close Address match
        #[ser = "4B"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        FourB,
        // Exact SSN match (only last 4 digits provided), Close Name match, Exact Address match
        #[ser = "4C"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        FourC,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Partial Address match
        #[ser = "4D"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        FourD,
        // Exact SSN match (only last 4 digits provided), Exact Name match, Low Confidence Address match
        #[ser = "4E"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        FourE,
        // Exact SSN match (only last 4 digits provided), Exact Name match, No Address match
        #[ser = "4F"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        FourF,
        // Missing SSN, Exact Name match, Exact Address match
        #[ser = "MA"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        MA,
        // Exact SSN match, No Name match, Exact Address match
        #[ser = "EK"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        EK,
        // Exact SSN match, Partial Name match, Close Address match
        #[ser = "EM"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        EM,
        // Exact SSN match, Partial Name match, Partial Address match
        #[ser = "ER"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        ER,
        // Exact SSN match, Partial Name match, Low Confidence Address match
        #[ser = "ET"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        ET,
        // Close SSN match, Close Name match, Close Address match
        #[ser = "CH"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CH,
        // Close SSN match, Partial Name match, Exact Address match
        #[ser = "CI"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        CI,
        // Close SSN match, Close Name match, Partial Address match
        #[ser = "CJ"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CJ,
        // Close SSN match, Close Name match, Low Confidence Address match
        #[ser = "CN"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CN,
        // Close SSN match, Close Name match, No Address match
        #[ser = "CO"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CO,
        // Partial SSN match, Exact Name match, Exact Address match
        #[ser = "PA"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        PA,
        // Partial SSN match, Exact Name match, Close Address match
        #[ser = "PB"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PB,
        // Partial SSN match, Close Name match, Exact Address match
        #[ser = "PC"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        PC,
        // Partial SSN match, Exact Name match, Partial Address match
        #[ser = "PD"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        PD,
        // Partial SSN match, Exact Name match, Low Confidence Address match
        #[ser = "PE"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        PE,
        // Partial SSN match, Exact Name match, No Address match
        #[ser = "PF"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Partial), FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        PF,
        // Exact SSN match (only last 4 digits provided), Close Name match, Close Address match
        #[ser = "4H"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        FourH,
        // Exact SSN match (only last 4 digits provided), Partial Name match, Exact Address match
        #[ser = "4I"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        FourI,
        // Exact SSN match (only last 4 digits provided), Close Name match, Partial Address match
        #[ser = "4J"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        FourJ,
        // Exact SSN match (only last 4 digits provided), Close Name match, Low Confidence Address match
        #[ser = "4N"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        FourN,
        // Exact SSN match (only last 4 digits provided), Close Name match, No Address match
        #[ser = "4O"]
        #[footprint_reason_codes = SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        FourO,
        // No match to SSN, Exact Name match, Exact Address match
        #[ser = "FA"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        FA,
        // No match to SSN, Exact Name match, Close Address match
        #[ser = "FB"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        FB,
        // No match to SSN, Close Name match, Exact Address match
        #[ser = "FC"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        FC,
        // Missing SSN, Exact Name match, Close Address match
        #[ser = "MB"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        MB,
        // Missing SSN, Close Name match, Exact Address match
        #[ser = "MC"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        MC,
        //
        // Level 2
        //
        // Exact SSN match, No Name match, Close Address match
        #[ser = "EQ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Exact), FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        EQ,
        // Exact SSN match, Partial Name match, No Address match
        #[ser = "EU"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Exact), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        EU,
        // Exact SSN match, No Name match, Partial Address match
        #[ser = "EW"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Exact), FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        EW,
        // Close SSN match, No Name match, Exact Address match
        #[ser = "CK"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        CK,
        // Close SSN match, Partial Name match, Close Address match
        #[ser = "CM"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CM,
        // Close SSN match, Partial Name match, Partial Address match
        #[ser = "CR"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        CR,
        // Close SSN match, Partial Name match, Low Confidence Address match
        #[ser = "CT"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CT,
        // Partial SSN match, Close Name match, Close Address match
        #[ser = "PH"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PH,
        // Partial SSN match, Partial Name match, Exact Address match
        #[ser = "PI"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        PI,
        // Partial SSN match, Close Name match, Partial Address match
        #[ser = "PJ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PJ,
        // Partial SSN match, Close Name match, Low Confidence Address match
        #[ser = "PN"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PN,
        // Partial SSN match, Close Name match, No Address match
        #[ser = "PO"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PO,
        // Exact SSN match (only last 4 digits provided), No Name match, Exact Address match
        #[ser = "4K"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        FourK,
        // Exact SSN match (only last 4 digits provided), Partial Name match, Close Address match
        #[ser = "4M"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        FourM,
        // Exact SSN match (only last 4 digits provided), Partial Name match, Partial Address match
        #[ser = "4R"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        FourR,
        // Exact SSN match (only last 4 digits provided), Partial Name match, Low Confidence Address match
        #[ser = "4T"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        FourT,
        // No match to SSN, Close Name match, Close Address match
        #[ser = "FH"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        FH,
        // Missing SSN, Close Name match, Close Address match
        // We can't actually hit this case, we control if we send SSN
        #[ser = "MH"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(NoMatch), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        MH,

        //
        // Level 1
        //

        // Exact SSN match, No Name match, Low Confidence Address match
        #[ser = "EY"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Exact), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        EY,

        // Exact SSN match, No Name match, No Address match
        #[ser = "EZ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Exact), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        EZ,

        // Close SSN match, No Name match, Close Address match
        #[ser = "CQ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        CQ,

        // Close SSN match, Partial Name match, No Address match
        #[ser = "CU"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        CU,

        // Close SSN match, No Name match, Partial Address match
        #[ser = "CW"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        CW,

        // Close SSN match, No Name match, Low Confidence Address match
        #[ser = "CY"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        CY,

        // Close SSN match, No Name match, No Address match
        #[ser = "CZ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        CZ,

        // Partial SSN match, No Name match, Exact Address match
        #[ser = "PK"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        PK,

        // Partial SSN match, Partial Name match, Close Address match
        #[ser = "PM"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PM,

        // Partial SSN match, No Name match, Close Address match
        #[ser = "PQ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        PQ,

        // Partial SSN match, Partial Name match, Partial Address match
        #[ser = "PR"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        PR,

        // Partial SSN match, Partial Name match, Low Confidence Address match
        #[ser = "PT"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PT,

        // Partial SSN match, Partial Name match, No Address match
        #[ser = "PU"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        PU,

        // Partial SSN match, No Name match, Partial Address match
        #[ser = "PW"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        PW,

        // Partial SSN match, No Name match, Low Confidence Address match
        #[ser = "PY"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        PY,

        // Partial SSN match, No Name match, No Address match
        #[ser = "PZ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9(Partial), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        PZ,

        // Exact SSN match (input SSN reported as deceased), Exact Name match, Exact Address match
        #[ser = "QA"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        QA,
        // Exact SSN match (input SSN reported as deceased), Exact Name match, Close Address match
        #[ser = "QB"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        QB,
        // Exact SSN match (input SSN reported as deceased), Close Name match, Exact Address match
        #[ser = "QC"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        QC,
        // Exact SSN match (input SSN reported as deceased), Exact Name match, Partial Address
        #[ser = "QD"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        QD,
        // Exact SSN match (input SSN reported as deceased), Exact Name match, Low Confidence
        #[ser = "QE"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        QE,
        // Exact SSN match (input SSN reported as deceased), Exact Name match, No Address match
        #[ser = "OF"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        QF,
        // Exact SSN match (input SSN reported as deceased), Close Name match, Close Address match
        #[ser = "QH"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        QH,
        // Exact SSN match (input SSN reported as deceased), Partial Name match, Exact Address
        #[ser = "QI"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        QI,
        // Exact SSN match (input SSN reported as deceased), Close Name match, Partial Address
        #[ser = "QJ"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        QJ,
        // Exact SSN match (input SSN reported as deceased), No Name match, Exact Address match
        #[ser = "OK"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(NoMatch), FullAddressSimple(Exact)).into()]
        QK,
        // Exact SSN match (input SSN reported as deceased), Partial Name match, Close Address
        #[ser = "QM"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        QM,
        // Exact SSN match (input SSN reported as deceased), Close Name match, Low Confidence
        #[ser = "QN"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        QN,
        // Exact SSN match (input SSN reported as deceased), Close Name match, No Address match
        #[ser = "QO"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        QO,
        // 	Exact SSN match (input SSN reported as deceased), Close Name match, Missing Address
        #[ser = "QP"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        QP,
        // Exact SSN match (input SSN reported as deceased), No Name match, Close Address match
        #[ser = "QQ"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        QQ,
        // Exact SSN match (input SSN reported as deceased), Partial Name match, Partial Address
        #[ser = "QR"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        QR,
        // Exact SSN match (input SSN reported as deceased), Partial Name match, Low Confidence
        #[ser = "QT"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        QT,
        // Exact SSN match (input SSN reported as deceased), Partial Name match, No Address match
        #[ser = "QU"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        QU,
        // Exact SSN match (input SSN reported as deceased), No Name match, Partial Address match
        #[ser = "QW"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        QW,
        // Exact SSN match (input SSN reported as deceased), No Name match, Low Confidence
        #[ser = "QY"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        QY,
        // Exact SSN match (input SSN reported as deceased), No Name match, No Address match
        #[ser = "QZ"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9ExactMatchSubjectDeceased, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        QZ,

        // Close SSN match (input SSN reported as deceased), Exact Name match, Exact Address match
        #[ser = "RA"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        RA,

        // Close SSN match (input SSN reported as deceased), Exact Name match, Close Address match
        #[ser = "RB"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        RB,

        // Close SSN match (input SSN reported as deceased), Close Name match, Exact Address match
        #[ser = "RC"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        RC,

        // Close SSN match (input SSN reported as deceased), Exact Name match, Partial Address
        #[ser = "RD"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        RD,

        // Close SSN match (input SSN reported as deceased), Exact Name match, Low Confidence Address
        #[ser = "RE"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        RE,

        // Close SSN match (input SSN reported as deceased), Exact Name match, No Address match
        #[ser = "RF"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        RF,

        // Close SSN match (input SSN reported as deceased), Close Name match, Close Address match
        #[ser = "RH"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        RH,

        // Close SSN match (input SSN reported as deceased), Partial Name match, Exact Address
        #[ser = "RI"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        RI,

        // Close SSN match (input SSN reported as deceased), Close Name match, Partial Address
        #[ser = "RJ"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        RJ,

        // Close SSN match (input SSN reported as deceased), Close Name match, Low Confidence
        #[ser = "RN"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        RN,

        // Close SSN match (input SSN reported as deceased), Close Name match, No Address match
        #[ser = "RO"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        RO,

        // Partial SSN match (input SSN reported as deceased), Exact Name match, Exact Address
        #[ser = "KA"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Exact)).into()]
        KA,

        // Partial SSN match (input SSN reported as deceased), Exact Name match, Close Address
        #[ser = "KB"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        KB,

        // Partial SSN match (input SSN reported as deceased), Close Name match, Exact Address
        #[ser = "KC"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Exact)).into()]
        KC,

        // Partial SSN match (input SSN reported as deceased), Exact Name match, Partial Address
        #[ser = "KD"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(Partial)).into()]
        KD,

        // Partial SSN match (input SSN reported as deceased), Exact Name match, Low Confidence
        #[ser = "KE"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        KE,

        // Partial SSN match (input SSN reported as deceased), Exact Name match, No Address match
        #[ser = "KF"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Exact), FullAddressSimple(NoMatch)).into()]
        KF,

        // Partial SSN match (input SSN reported as deceased), Close Name match, Close Address
        #[ser = "KH"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn9PartialMatchSubjectDeceased, FullNameSimple(Partial), FullAddressSimple(Partial)).into()]
        KH,

        // Exact SSN match (only last 4 digits provided), No Name match, Close Address match
        #[ser = "4Q"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        FourQ,

        // Exact SSN match (only last 4 digits provided), Partial Name match, No Address match
        #[ser = "4U"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(Partial), FullAddressSimple(NoMatch)).into()]
        FourU,

        // Exact SSN match (only last 4 digits provided), No Name match, Partial Address match
        #[ser = "4W"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(NoMatch), FullAddressSimple(Partial)).into()]
        FourW,

        // Exact SSN match (only last 4 digits provided), No Name match, Low Confidence Address
        #[ser = "4Y"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        FourY,

        // Exact SSN match (only last 4 digits provided), No Name match, No Address match
        #[ser = "4Z"]
        #[footprint_reason_codes =  SsnRCH::new(Ssn4ExactMatch, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        FourZ,


        //
        // Level 0
        //
        // No Match
        #[ser = "NX"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        NX,

        // Input SSN is missing
        #[ser = "MX"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        MX,

        // Invalid SSN (no search performed)
        #[ser = "IX"]
        #[footprint_reason_codes = SsnRCH::new(SsnInvalid, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
        IX,

        // SSN is an ITIN (no search performed)
        #[ser = "VC"]
        #[footprint_reason_codes = SsnRCH::new(SsnIsItin, FullNameSimple(NoMatch), FullAddressSimple(NoMatch)).into()]
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
            EQ | EU | EW | CK | CM | CR | CT | PH | PI | PJ | PN | PO | FourK | FourM | FourR | FourT
            | FH | MH => Self::Level2,
            EY | EZ | CQ | CU | CW | CY | CZ | PK | PM | PQ | PR | PT | PU | PW | PY | PZ | RA | RB | RC
            | RD | RE | RF | RH | RI | RJ | RN | RO | KA | KB | KC | KD | KE | KF | KH | FourQ | FourU
            | FourW | FourY | FourZ | QA | QB | QC | QD | QE | QF | QH | QI | QJ | QK | QM | QN | QO | QP
            | QQ | QR | QT | QU | QW | QY | QZ => Self::Level1,
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
    use crate::{
        ExperianMatchLevel,
        ExperianSSNReasonCodes,
        FootprintReasonCode,
    };
    use strum::IntoEnumIterator;
    use test_case::test_case;
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
