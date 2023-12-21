use strum_macros::{EnumIter, EnumString};

use crate::reason_code::reason_code_helpers::{AddressGrouping::*, NameGrouping::*, SsnTypes::*, *};
use crate::{vendor_reason_codes_enum, FootprintReasonCode, MatchLevel::*};

vendor_reason_codes_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum NameAddressSsnSummary {

        // Nothing found for input criteria
        #[ser = "0"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FirstAndLast((NoMatch, NoMatch)), FullAddressSimple(NoMatch)).into()]
        NothingFound,

        // Input SSN is associated with a different name and address
        #[ser = "1"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FirstAndLast((NoMatch, NoMatch)), FullAddressSimple(NoMatch)).into()]
        DifferentNameAddress,

        // Input First name and Last Name matched
        #[ser = "2"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FirstAndLast((Exact, Exact)), FullAddressSimple(NoMatch)).into()]
        FirstNameLastName,

        // Input First name and Address matched
        #[ser = "3"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FirstAndLast((Exact, NoMatch)), FullAddressSimple(Exact)).into()]
        FirstNameAddress,

        // Input First name and SSN matched
        #[ser = "4"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FirstAndLast((Exact, NoMatch)), FullAddressSimple(NoMatch)).into()]
        FirstNameSsn,

        // Input Last name and Address matched
        #[ser = "5"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FirstAndLast((NoMatch, Exact)), FullAddressSimple(Exact)).into()]
        LastNameAddress,

        // Input Address and SSN matched
        #[ser = "6"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FirstAndLast((NoMatch, NoMatch)), FullAddressSimple(Exact)).into()]
        AddressSsn,

        // Input Last name and SSN matched
        #[ser = "7"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FirstAndLast((NoMatch, Exact)), FullAddressSimple(NoMatch)).into()]
        LastNameSsn,

        // Input First name, Last name and Address matched
        #[ser = "8"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(NoMatch), FirstAndLast((Exact, Exact)), FullAddressSimple(Exact)).into()]
        FirstNameLastNameAddress,

        // Input First name, Last name and SSN matched
        #[ser = "9"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FirstAndLast((Exact, Exact)), FullAddressSimple(NoMatch)).into()]
        FirstNameLastNameSsn,

        // Input First name, Address, and SSN matched
        #[ser = "10"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FirstAndLast((Exact, NoMatch)), FullAddressSimple(Exact)).into()]
        FirstNameAddressSsn,

        // Input Last name, Address, and SSN matched
        #[ser = "11"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FirstAndLast((NoMatch, Exact)), FullAddressSimple(Exact)).into()]
        LastNameAddressSsn,

        // Input First name, Last name, Address and SSN matched
        #[ser = "12"]
        #[footprint_reason_codes = SsnRCH::new(Ssn9(Exact), FirstAndLast((Exact, Exact)), FullAddressSimple(Exact)).into()]
        FirstNameLastNameAddressSsn

    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;
    use FootprintReasonCode::*;

    #[test_case(NameAddressSsnSummary::NothingFound, vec![NameDoesNotMatch, NameFirstDoesNotMatch, NameLastDoesNotMatch, AddressDoesNotMatch, SsnDoesNotMatch])]
    #[test_case(NameAddressSsnSummary::DifferentNameAddress, vec![NameDoesNotMatch, NameFirstDoesNotMatch, NameLastDoesNotMatch, AddressDoesNotMatch, SsnDoesNotMatch])]
    #[test_case(NameAddressSsnSummary::FirstNameLastName, vec![NameMatches, NameFirstMatches, NameLastMatches, AddressDoesNotMatch, SsnDoesNotMatch])]
    #[test_case(NameAddressSsnSummary::FirstNameAddress, vec![NamePartiallyMatches, NameFirstMatches, NameLastDoesNotMatch, AddressMatches, SsnDoesNotMatch])]
    #[test_case(NameAddressSsnSummary::FirstNameSsn, vec![NamePartiallyMatches, NameFirstMatches, NameLastDoesNotMatch, AddressDoesNotMatch, SsnMatches])]
    #[test_case(NameAddressSsnSummary::LastNameAddress, vec![NamePartiallyMatches, NameFirstDoesNotMatch, NameLastMatches, AddressMatches, SsnDoesNotMatch])]
    #[test_case(NameAddressSsnSummary::AddressSsn, vec![NameDoesNotMatch, NameFirstDoesNotMatch, NameLastDoesNotMatch, AddressMatches, SsnMatches])]
    #[test_case(NameAddressSsnSummary::LastNameSsn, vec![NamePartiallyMatches, NameFirstDoesNotMatch, NameLastMatches, AddressDoesNotMatch, SsnMatches])]
    #[test_case(NameAddressSsnSummary::FirstNameLastNameAddress, vec![NameMatches, NameFirstMatches, NameLastMatches, AddressMatches, SsnDoesNotMatch])]
    #[test_case(NameAddressSsnSummary::FirstNameLastNameSsn, vec![NameMatches, NameFirstMatches, NameLastMatches, AddressDoesNotMatch, SsnMatches])]
    #[test_case(NameAddressSsnSummary::FirstNameAddressSsn, vec![NamePartiallyMatches, NameFirstMatches, NameLastDoesNotMatch, AddressMatches, SsnMatches])]
    #[test_case(NameAddressSsnSummary::LastNameAddressSsn, vec![NamePartiallyMatches, NameFirstDoesNotMatch, NameLastMatches, AddressMatches, SsnMatches])]
    #[test_case(NameAddressSsnSummary::FirstNameLastNameAddressSsn, vec![NameMatches, NameFirstMatches, NameLastMatches, AddressMatches, SsnMatches])]
    fn test(naps: NameAddressSsnSummary, expected: Vec<FootprintReasonCode>) {
        assert_have_same_elements(expected, (&naps).into());
    }

    // TODO: move this into a new test utils crate or smthing
    #[track_caller]
    pub fn assert_have_same_elements<T>(l: Vec<T>, r: Vec<T>)
    where
        T: Eq + std::fmt::Debug + Clone,
    {
        if !(l.iter().all(|i| r.contains(i)) && r.iter().all(|i| l.contains(i)) && l.len() == r.len()) {
            panic!(
                "{}",
                format!("\nleft={:?} does not equal\nright={:?}\n", l.to_vec(), r.to_vec())
            )
        }
    }
}
