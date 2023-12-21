use strum_macros::{EnumIter, EnumString};

use crate::reason_code::reason_code_helpers::{AddressGrouping::*, NameGrouping::*, *};
use crate::{vendor_reason_codes_enum, FootprintReasonCode, MatchLevel::*};

vendor_reason_codes_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum NameAddressPhoneSummary {
        /*
        We’ll effectively be mapping 4,6,7,9,10,11,12 to Exact and everything else to NoMatch
         */


        // Nothing found for input criteria
        #[ser = "0"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FirstAndLast((NoMatch, NoMatch)), FullAddressSimple(NoMatch)).into()]
        NothingFound,

        // Input Phone is associated with a different name and address
        #[ser = "1"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FirstAndLast((NoMatch, NoMatch)), FullAddressSimple(NoMatch)).into()]
        DifferentNameAddress,

        // First name and Last name matched
        #[ser = "2"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FirstAndLast((Exact, Exact)), FullAddressSimple(NoMatch)).into()]
        FirstNameLastName,

        // First name and Address matched
        #[ser = "3"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FirstAndLast((Exact, NoMatch)), FullAddressSimple(Exact)).into()]
        FirstNameAddress,

        // First name and Phone matched
        #[ser = "4"]
        #[footprint_reason_codes = PhRCH::new(Exact, FirstAndLast((Exact, NoMatch)), FullAddressSimple(NoMatch)).into()]
        FirstNamePhone,

        // Last name and Address matched
        #[ser = "5"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FirstAndLast((NoMatch, Exact)), FullAddressSimple(Exact)).into()]
        LastNameAddress,

        // Address and Phone matched
        #[ser = "6"]
        #[footprint_reason_codes = PhRCH::new(Exact, FirstAndLast((NoMatch, NoMatch)), FullAddressSimple(Exact)).into()]
        AddressPhone,

        // Last name and Phone matched
        #[ser = "7"]
        #[footprint_reason_codes = PhRCH::new(Exact, FirstAndLast((NoMatch, Exact)), FullAddressSimple(NoMatch)).into()]
        LastNamePhone,

        // First name, Last name, and Address matched
        #[ser = "8"]
        #[footprint_reason_codes = PhRCH::new(NoMatch, FirstAndLast((Exact, Exact)), FullAddressSimple(Exact)).into()]
        FirstNameLastNameAddress,

        // First name, Last name, and Phone matched
        #[ser = "9"]
        #[footprint_reason_codes = PhRCH::new(Exact, FirstAndLast((Exact, Exact)), FullAddressSimple(NoMatch)).into()]
        FirstNameLastNamePhone,

        // First name, Address, and Phone matched
        #[ser = "10"]
        #[footprint_reason_codes = PhRCH::new(Exact, FirstAndLast((Exact, NoMatch)), FullAddressSimple(Exact)).into()]
        FirstNameAddressPhone,

        // Last name, Address, and Phone matched
        #[ser = "11"]
        #[footprint_reason_codes = PhRCH::new(Exact, FirstAndLast((NoMatch, Exact)), FullAddressSimple(Exact)).into()]
        LastNameAddressPhone,

        // First name, Last name, Address, and Phone matched
        #[ser = "12"]
        #[footprint_reason_codes = PhRCH::new(Exact, FirstAndLast((Exact, Exact)), FullAddressSimple(Exact)).into()]
        FirstNameLastNameAddressPhone

    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;
    use FootprintReasonCode as FRC;

    #[test_case(NameAddressPhoneSummary::NothingFound => vec![FRC::PhoneLocatedDoesNotMatch])]
    #[test_case(NameAddressPhoneSummary::DifferentNameAddress => vec![FRC::PhoneLocatedDoesNotMatch])]
    #[test_case(NameAddressPhoneSummary::FirstNameLastName => vec![FRC::PhoneLocatedDoesNotMatch])]
    #[test_case(NameAddressPhoneSummary::FirstNameAddress => vec![FRC::PhoneLocatedDoesNotMatch])]
    #[test_case(NameAddressPhoneSummary::FirstNamePhone => vec![FRC::PhoneLocatedMatches])]
    #[test_case(NameAddressPhoneSummary::LastNameAddress => vec![FRC::PhoneLocatedDoesNotMatch])]
    #[test_case(NameAddressPhoneSummary::AddressPhone => vec![FRC::PhoneLocatedMatches])]
    #[test_case(NameAddressPhoneSummary::LastNamePhone => vec![FRC::PhoneLocatedMatches])]
    #[test_case(NameAddressPhoneSummary::FirstNameLastNameAddress => vec![FRC::PhoneLocatedDoesNotMatch])]
    #[test_case(NameAddressPhoneSummary::FirstNameLastNamePhone => vec![FRC::PhoneLocatedMatches])]
    #[test_case(NameAddressPhoneSummary::FirstNameAddressPhone => vec![FRC::PhoneLocatedMatches])]
    #[test_case(NameAddressPhoneSummary::LastNameAddressPhone => vec![FRC::PhoneLocatedMatches])]
    #[test_case(NameAddressPhoneSummary::FirstNameLastNameAddressPhone => vec![FRC::PhoneLocatedMatches])]
    fn test_phone_codes(naps: NameAddressPhoneSummary) -> Vec<FootprintReasonCode> {
        (&naps).into()
    }
}
