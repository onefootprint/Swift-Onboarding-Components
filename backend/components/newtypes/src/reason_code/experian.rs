use crate::vendor_reason_code_enum;
use crate::FootprintReasonCode;
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
        // Experian classification = *MEDIUM RISK Address Indicators*
        #[ser = "01", description = "Inquiry/On-file Current Address Conflict"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressNewerRecordFound)]
        InputAddressConflict,
        // Address used on the inquire was first GLB reported for the consumer within the last 90 days.
        // Experian classification = *HIGH RISK Address Indicators* // TODO: maybe produce Risk Signal here?
        #[ser = "02", description = "Inquiry Address First Reported < 90 Days"]
        #[footprint_reason_code = None]
        InputAddressFirstResponseRecently,
        // Inquiry address does not match an address GLB that File One has for this consumer
        // Experian classification = *HIGH RISK Address Indicators*
        #[ser = "03", description = "Inquiry Current Address Not On-file"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputNotOnFile)]
        InputAddressNotOnFile,
        // The issues date of the SSN provided on the GLB inquiry cannot be verified by the Social Security Administration (SSA).
        // Experian classification = *HIGH RISK SSN Indicators*
        // This is simply produced for all SSN's issued post July 2011. So young folks + immigrants who've been issued a SSN since then, Experian will not be able to know the issue date of those SSN's (some new SSA rule or something). This isn't really an indicator of anything interesting. The only implication afaict is that Experian just wont be able to confirm "ssn issue date > dob" for these cases. So for now we just don't turn this into a risk signal
        #[ser = "04", description = "Input SSN Issue Date Cannot Be Verified"]
        #[footprint_reason_code = None]
        InputSSNIssueDataCannotBeVerified,
        // The SSA has reported that death benefits GLB are being paid on this SSN submitted on the inquiry.
        // Experian classification = *HIGH RISK SSN Indicators*
        #[ser = "05", description = "Inquiry SSN Recorded As Deceased"]
        #[footprint_reason_code = Some(FootprintReasonCode::SubjectDeceased)]
        InputSSNDeceased,
        // The Age used on the inquiry is younger GLB than the SSN issue date.
        // Experian classification = *HIGH RISK SSN Indicators*
        #[ser = "06", description = "Inquiry Age Younger Than SSN Issue Date"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnIssuedPriorToDob)]
        InputAgeYoungerThanSSN,
        // The consumer established credit before the FCRA age of 18.
        // Experian classification = *Other HIGH RISK Indicators*
        #[ser = "07", description = "Credit Established Before Age 18"]
        #[footprint_reason_code = None]
        CreditEstablishedBefore18,
        // The consumer’s first trade was opened prior FCRA to the SSN issue date.
        // Experian classification = *LOW RISK Indicators*
        #[ser = "08", description = "Credit Established Prior To SSN Issue Date"]
        #[footprint_reason_code = Some(FootprintReasonCode::CreditEstablishedBeforeSSNDate)]
        CreditEstablishedBeforeSSNDate,
        // More than 3 inquiries have been posted to FCRA the consumer’s profile within the last 30 days
        // Experian classification = *Other HIGH RISK Indicators*
        #[ser = "09", description = "More Than 3 Inquiries In Last 30 Days"]
        #[footprint_reason_code = Some(FootprintReasonCode::CreditMoreThan3InquiriesInLast30Days)]
        MoreThan3InquiriesRecently,
        // The inquiry address is a business address GLB having a potential for fraudulent activity.
        // Experian classification = *LOW RISK Indicators*
        #[ser = "10", description = "Inquiry Address: Alert"]
        #[footprint_reason_code = None]
        InputAddressAlert,
        // The inquiry address is a business address GLB
        // Experian classification = *LOW RISK Indicators*
        #[ser = "11", description = "Inquiry Address: Non-Residential"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressInputIsNonResidential)]
        InputAddressNonResidential,
        // According to File One, the SSN used is GLB more closely associated with another consumer.
        // Experian classification = *HIGH RISK SSN Indicators*
        #[ser = "13", description = "High Probability SSN Belongs To Another"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnLikelyBelongsToAnother)]
        InputAddressProbablyBelongsToAnother,
        // The SSN provided is not a valid number as GLB reported by the SSA.
        // Experian classification = *LOW RISK Indicators* <- weird
        #[ser = "14", description = "Inquiry SSN Format Is Invalid"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnInputIsInvalid)]
        InputSSNFormatInvalid,
        // Fraud has been perpetrated at the inquiry GLB address.
        // Experian classification = *HIGH RISK Address Indicators*
        #[ser = "15", description = "Inquiry Address: Cautious"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressRiskAlert)]
        InputAddressCautious,
        // One of the consumer’s on-file addresses is a GLB business address having a potential for fraudulent activity.
        // Experian classification = *LOW RISK Indicators*
        #[ser = "16", description = "On-File Address: Alert"]
        #[footprint_reason_code = None]
        LocatedAddressAlert,
        // One of the consumer’s on-file addresses is a GLB business address.
        // Experian classification = *LOW RISK Indicators*
        #[ser = "17", description = "On-File Address: Non-Residential"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressLocatedIsNonResidential)]
        LocatedAddressNonResidential,
        // Fraud has been perpetrated at the GLB consumer’s on-file addresses.
        // Experian classification = *HIGH RISK Address Indicators*
        #[ser = "18", description = "On-File Address: Cautious"]
        #[footprint_reason_code = Some(FootprintReasonCode::AddressRiskAlert)]
        LocatedAddressCautious,
        // The consumer’s current address on the FCRA credit report has only been reported by the more recently opened trade.
        // Experian classification = *LOW RISK Indicators*
        #[ser = "19", description = "Current Address Rpt By New Trade"]
        #[footprint_reason_code = None]
        CurrentAddressReportByNewTrade,
        // The consumer’s current address has been FCRA reported by a trade opened within the last 90 days.
        #[ser = "20", description = "Current Address Rpt By Trade Open < 90 Days"]
        // Experian classification = *HIGH RISK Address Indicators* // TODO: produce risk signal for this?
        #[footprint_reason_code = None]
        CurrentAddressReportByTradeOpenedRecently,
        // The SSA has reported that death benefits GLB are being paid on the best on-file SSN.
        // Experian classification = *HIGH RISK SSN Indicators*
        #[ser = "25", description = "Best On-File SSN Recorded As Deceased"]
        #[footprint_reason_code = Some(FootprintReasonCode::SubjectDeceased)]
        BestLocatedSSNDeceased,
        // The issues date of the best on-file SSN GLB cannot be verified by the SSA.
        // Experian classification = *HIGH RISK SSN Indicators*
        // see comment for "04"
        #[ser = "26", description = "Best On-File SSN Issue Date Cannot Be Verified"]
        #[footprint_reason_code = None]
        BestLocatedSSNCannotBeVerified,
        // According to File One, the SSN used is FCRA more frequently reported for another consumer.
        // Experian classification = *HIGH RISK SSN Indicators*
        #[ser = "27", description = "SSN Reported More Frequently For Another"]
        #[footprint_reason_code = Some(FootprintReasonCode::SsnPotentiallyBelongsToAnother)]
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
        #[footprint_reason_code = Some(FootprintReasonCode::DobCouldNotMatch)]
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
        #[footprint_reason_code = Some(FootprintReasonCode::DobMatches)]
        DobMobExactMatchYobWithin1Year,
        // yeah I was gonna say, seems like too many numbers, let's switch to letters, makes sense
        #[ser = "A", description = "MOB exact match, YOB partial match (+/- 1 year)"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobPartialMatch)]
        MobExactMatchYobWithin1Year,
        #[ser = "B", description = "MOB exact match, YOB exact match (no +/- 1 year logic accommodation)"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobPartialMatch)]
        MobYobExactMatch,
        #[ser = "C", description = "DOB and MOB exact match, YOB +/- 10 years exactly"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobYobDoesNotMatchWithin1Year)]
        DobMobExactMatchYobWithin10Years,
        #[ser = "D", description = "MOB exact match, YOB +/- 10 years exactly"]
        #[footprint_reason_code = Some(FootprintReasonCode::DobPartialMatch)]
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

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    #[serde(try_from = "&str")]
    pub enum ExperianWatchlistReasonCodes {
        // Inquiry name not on OFAC list - no hit
        #[ser = "1", description = "No match"]
        #[footprint_reason_code = None]
        R1,
        // Inquiry name matches name on OFAC list
        #[ser = "2", description = "Match to full name only"]
        #[footprint_reason_code = None]
        R2,
        // Inquiry SSN matches SSN on OFAC list
        #[ser = "3", description = "Match to SSN only"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R3,
        // Inquiry name and SSN matches record on list
        #[ser = "4", description = "Match to name and SSN"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R4,
        // Inquiry name and DOB matches record on list
        #[ser = "5", description = "Match to name and DOB"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R5,
        // Inquiry name and YOB matches record on list
        #[ser = "6", description = "Match to name and YOB"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R6,
        // Inquiry SSN and DOB match record on list
        #[ser = "7", description = "Match to SSN and DOB"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R7,
        // Inquiry SSN and YOB match record on list
        #[ser = "8", description = "Match to SSN and YOB"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R8,
        // Inquiry name, SSN and DOB match record on list
        #[ser = "9", description = "Match to name, SSN, and DOB"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R9,
        // Inquiry name, SSN and YOB match record on list
        #[ser = "10", description = "Match to name, SSN, and YOB"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitOfac)]
        R10,
        // Used for business searches only. Business name on inquiry matches record on list
        #[ser = "11", description = "Match to company name only"]
        #[footprint_reason_code = None]
        R11,
        // "Used for business searches only. Business address on inquiry matches record on list	"
        #[ser = "12", description = "Match to company address only"]
        #[footprint_reason_code = None]
        R12,
        // "Used for business searches only. Business name and address on inquiry matches record on list	"
        #[ser = "13", description = "Match to company name and address"]
        #[footprint_reason_code = None]
        R13,
        // Inquiry last name matches name on OFAC list. First name match may be first initial or similar
        #[ser = "14", description = "Match to surname and first name"]
        #[footprint_reason_code = None]
        R14,
        // Inquiry full name matches name on OFAC PLC list.
        #[ser = "15", description = "Match to full name only - PLC NS List"]
        #[footprint_reason_code = Some(FootprintReasonCode::WatchlistHitNonSdn)]
        R15,
        // Inquiry last name matches name on OFAC PLC list. Inquiry first name matches to first initial on OFAC PLC LisT
        #[ser = "16", description = "Match to surname and first initial - PLC NS list"]
        #[footprint_reason_code = None]
        R16
    }
}

impl serde::Serialize for ExperianWatchlistReasonCodes {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.collect_str(self)
    }
}
