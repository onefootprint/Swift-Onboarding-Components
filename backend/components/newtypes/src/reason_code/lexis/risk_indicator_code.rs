use crate::FootprintReasonCode::*;
use crate::{
    vendor_reason_code_enum,
    FootprintReasonCode,
};
use strum_macros::EnumString;

vendor_reason_code_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, Hash)]
    #[serde(try_from = "&str")]
    pub enum RiskIndicatorCode {


        #[ser = "02", description = "The input SSN is reported as deceased"]
        #[footprint_reason_code = Some(SubjectDeceased)]
        R02,

        #[ser = "03", description = "The input SSN was issued prior to the input date-of-birth"]
        #[footprint_reason_code = Some(SsnIssuedPriorToDob)]
        R03,

        // redundant with NAS=7? A lot of these codes seem redunant which what we are already parsing from NAS/NAP so just going to keep them as None's here for now?
        #[ser = "04", description = "The input last name and SSN are verified, but not with the input address and phone"]
        #[footprint_reason_code = None]
        R04,

        #[ser = "06", description = "The input SSN is invalid"]
        #[footprint_reason_code = Some(SsnInputIsInvalid)]
        R06,

        #[ser = "07", description = "The input phone number may be disconnected"]
        #[footprint_reason_code = None]
        R07,

        #[ser = "08", description = "The input phone number is potentially invalid"]
        #[footprint_reason_code = Some(PhoneNumberInputInvalid)]
        R08,

        #[ser = "09", description = "The input phone number is a pager number"]
        #[footprint_reason_code = None]
        R09,

        #[ser = "10", description = "The input phone number is a mobile number"]
        #[footprint_reason_code = None]
        R10,

        #[ser = "11", description = "The input address may be invalid according to postal specifications"]
        #[footprint_reason_code = Some(AddressInputIsNotDeliverable)]
        R11,

        // probably redundant with VES
        #[ser = "12", description = "The input zip code belongs to a post office box"]
        #[footprint_reason_code = Some(AddressInputIsPoBox)]
        R12,

        #[ser = "14", description = "The input address is a transient commercial or institutional address"]
        #[footprint_reason_code = Some(AddressInputIsNonResidential)]
        R14,

        #[ser = "15", description = "The input phone number matches a transient commercial or institutional address"]
        #[footprint_reason_code = None]
        R15,

        #[ser = "16", description = "The input phone number and input zip code combination is invalid"]
        #[footprint_reason_code = None]
        R16,

        #[ser = "19", description = "Unable to verify name, address, SSN/TIN and phone"]
        #[footprint_reason_code = None]
        R19,

        #[ser = "25", description = "Unable to verify address"]
        #[footprint_reason_code = None]
        R25,

        #[ser = "26", description = "Unable to verify SSN/TIN"]
        #[footprint_reason_code = None]
        R26,

        #[ser = "27", description = "Unable to verify phone number"]
        #[footprint_reason_code = None]
        R27,

        #[ser = "28", description = "Unable to verify date-of-birth"]
        #[footprint_reason_code = None]
        R28,

        #[ser = "29", description = "The input SSN/TIN may have been miskeyed"]
        #[footprint_reason_code = None]
        R29,

        #[ser = "30", description = "The input address may have been miskeyed"]
        #[footprint_reason_code = None]
        R30,

        #[ser = "31", description = "The input phone number may have been miskeyed"]
        #[footprint_reason_code = None]
        R31,

        #[ser = "32", description = "The input name matches the OFAC file"]
        #[footprint_reason_code = Some(WatchlistHitOfac)]
        R32,

        #[ser = "37", description = "Unable to verify name"]
        #[footprint_reason_code = None]
        R73,

        #[ser = "38", description = "The input SSN is associated with multiple last names"]
        #[footprint_reason_code = Some(SsnInputTiedToMultipleNames)]
        R38,

        #[ser = "39", description = "The input SSN is recently issued"]
        #[footprint_reason_code = None]
        R39,

        #[ser = "41", description = "The input driver's license number is invalid for the input DL State"]
        #[footprint_reason_code = None]
        R41,

        #[ser = "44", description = "The input phone area code is changing"]
        #[footprint_reason_code = None]
        R44,

        #[ser = "46", description = "The input work phone is a pager number"]
        #[footprint_reason_code = None]
        R46,

        #[ser = "48", description = "Unable to verify first name"]
        #[footprint_reason_code = None]
        R48,

        #[ser = "49", description = "The input phone and address are geographically distant (>10 miles)"]
        #[footprint_reason_code = None]
        R49,

        #[ser = "50", description = "The input address matches a prison address"]
        #[footprint_reason_code = Some(AddressInputIsNonResidential)]
        R50,

        #[ser = "51", description = "The input last name is not associated with the input SSN"]
        #[footprint_reason_code = None]
        R51,

        #[ser = "52", description = "The input first name is not associated with the input SSN"]
        #[footprint_reason_code = None]
        R52,

        #[ser = "53", description = "The input home phone and work phone are geographically distant (>100 miles)"]
        #[footprint_reason_code = None]
        R53,

        #[ser = "55", description = "The input work phone is potentially invalid"]
        #[footprint_reason_code = None]
        R55,

        #[ser = "56", description = "The input work phone is potentially disconnected"]
        #[footprint_reason_code = None]
        R56,

        #[ser = "57", description = "The input work phone is a mobile number"]
        #[footprint_reason_code = None]
        R57,

        #[ser = "64", description = "The input address returns a different phone number"]
        #[footprint_reason_code = None]
        R64,

        #[ser = "66", description = "The input SSN is associated with a different last name, same first name"]
        #[footprint_reason_code = None]
        R66,

        #[ser = "71", description = "The input SSN is not found in the public record"]
        #[footprint_reason_code = None]
        R71,

        #[ser = "72", description = "The input SSN is associated with a different name and address"]
        #[footprint_reason_code = Some(SsnLikelyBelongsToAnother)]
        R72,

        #[ser = "74", description = "The input phone number is associated with a different name and address"]
        #[footprint_reason_code = None]
        R74,

        #[ser = "75", description = "The input name and address are associated with an unlisted/non-published phone number"]
        #[footprint_reason_code = None]
        R75,

        #[ser = "76", description = "The input name may have been miskeyed	"]
        #[footprint_reason_code = None]
        R76,

        // TODO: maybe error! on some of these in case it indicates an issue with how we are making requests?
        #[ser = "77", description = "The input name was missing"]
        #[footprint_reason_code = None]
        R77,

        #[ser = "78", description = "The input address was missing"]
        #[footprint_reason_code = None]
        R78,

        #[ser = "79", description = "The input SSN/TIN was missing or incomplete"]
        #[footprint_reason_code = None]
        R79,

        #[ser = "80", description = "The input phone was missing or incomplete"]
        #[footprint_reason_code = None]
        R80,

        #[ser = "81", description = "The input date-of-birth was missing or incomplete"]
        #[footprint_reason_code = None]
        R81,

        #[ser = "82", description = "The input name and address return a different phone number"]
        #[footprint_reason_code = None]
        R82,

        #[ser = "83", description = "The input date-of-birth may have been miskeyed"]
        #[footprint_reason_code = None]
        R83,

        #[ser = "85", description = "The input SSN was issued to a non-US citizen"]
        #[footprint_reason_code = None]
        R85,

        #[ser = "89", description = "The input SSN was issued within the last three years"]
        #[footprint_reason_code = None]
        R89,

        #[ser = "90", description = "The input SSN was issued after age five (post-1990)"]
        #[footprint_reason_code = None]
        R90,

        #[ser = "CA", description = "The primary input address is a Commercial Mail Receiving Agency"]
        #[footprint_reason_code = Some(AddressInputIsPoBox)]
        CA,

        #[ser = "CL", description = "The input SSN is not the primary SSN for the input identity"]
        #[footprint_reason_code = None]
        CL,

        #[ser = "CO", description = "The input zip code is a corporate only zip code"]
        #[footprint_reason_code = None]
        CO,

        #[ser = "CZ", description = "Address mismatch between city/state and zip code"]
        #[footprint_reason_code = None]
        CZ,

        #[ser = "DD", description = "A different driver's license number has been found for the input applicant"]
        #[footprint_reason_code = None]
        DD,

        #[ser = "DF", description = "The input driver’s license number is valid and is not on record"]
        #[footprint_reason_code = None]
        DF,

        #[ser = "DI", description = "The input identity is reported as deceased"]
        #[footprint_reason_code = Some(SubjectDeceased)]
        DI,

        #[ser = "DM", description = "The input driver's license number may have been miskeyed"]
        #[footprint_reason_code = None]
        DM,

        #[ser = "DV", description = "Unable to verify driver's license number"]
        #[footprint_reason_code = None]
        DV,

        #[ser = "ER", description = "The input email address appears as high risk in the Digital Identity Network"]
        #[footprint_reason_code = Some(EmailHighRiskFraud)]
        ER,

        #[ser = "EU", description = "The input email address is not verified"]
        #[footprint_reason_code = None]
        EU,

        #[ser = "IS", description = "Input SSN possibly randomly issued by SSA, but invalid when first associated with the input identity"]
        #[footprint_reason_code = None]
        IS,

        #[ser = "IT", description = "The input SSN is an ITIN"]
        #[footprint_reason_code = Some(SsnInputIsItin)]
        IT,

        // TODO: MultipleRecordsFound or SsnInputTiedToMultipleNames or make a SsnInputTiedToMultipleIdentities ??
        #[ser = "MI", description = "Multiple identities associated with the input SSN"]
        #[footprint_reason_code = Some(MultipleRecordsFound)]
        MI,

        #[ser = "MO", description = "The input zip code is a military only zip code"]
        #[footprint_reason_code = None]
        MO,

        #[ser = "MS", description = "Multiple SSNs reported with applicant"]
        #[footprint_reason_code = None]
        MS,

        #[ser = "NB", description = "No date-of-birth reported for the input identity"]
        #[footprint_reason_code = None]
        NB,

        #[ser = "NF", description = "The input first name and last name may have been flipped"]
        #[footprint_reason_code = None]
        NF,

        #[ser = "PA", description = "Potential address discrepancy - the Input address may be previous address"]
        #[footprint_reason_code = None]
        PA,

        #[ser = "PO", description = "The primary input address is a PO Box"]
        #[footprint_reason_code = Some(AddressInputIsPoBox)]
        PO,

        #[ser = "PR", description = "The input phone appears as high risk in the Digital Identity Network"]
        #[footprint_reason_code = None]
        PR,

        #[ser = "RS", description = "The input SSN was possibly randomly issued by the SSA"]
        #[footprint_reason_code = None]
        RS,

        #[ser = "SD", description = "The input address State is different than the LN best address State for the input identity"]
        #[footprint_reason_code = None]
        SD,

        #[ser = "SR", description = "Address mismatch on secondary address range"]
        #[footprint_reason_code = None]
        SR,

        #[ser = "VA", description = "The input address is a vacant address"]
        #[footprint_reason_code = None]
        VA,

        #[ser = "WL", description = "The input name matches one or more of the non-OFAC global screening list(s)"]
        #[footprint_reason_code = Some(WatchlistHitNonSdn)]
        WL,

        #[ser = "ZI", description = "Unable to verify zip code"]
        #[footprint_reason_code = None]
        ZI
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::FootprintReasonCode;
    use test_case::test_case;

    #[test_case(RiskIndicatorCode::DI => Some(SubjectDeceased))]
    #[test_case(RiskIndicatorCode::ZI => None)]
    fn test(ric: RiskIndicatorCode) -> Option<FootprintReasonCode> {
        (&ric).into()
    }
}
