use crate::socure::requirements::meets_requirements_for_idplus_request;
use newtypes::ExperianPreciseId;
use newtypes::IdentityDataKind;
use newtypes::IdologyExpectId;
use newtypes::IdologyPa;
use newtypes::IncodeWatchlistCheck;
use newtypes::LexisFlexId;
use newtypes::SocureIdPlus;

/// This struct represents the minimum requirements for sending a request to a specific VendorAPI
///
/// Some vendors (like Socure) have sub-modules that have their own sets of Requirements
pub struct MinimumIDVRequirements {
    // The kinds that a required (minimum)
    required: Vec<IdentityDataKind>,
}

impl MinimumIDVRequirements {
    pub fn are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool {
        let required_met = self
            .required
            .iter()
            .all(|r| present_data_lifetime_kinds.contains(r));

        required_met
    }
}


pub trait HasIdentityDataRequirements {
    fn requirements_are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool;
}

impl HasIdentityDataRequirements for ExperianPreciseId {
    fn requirements_are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool {
        MinimumIDVRequirements {
            // minimum is full name and full address
            required: vec![
                IdentityDataKind::FirstName,
                IdentityDataKind::LastName,
                IdentityDataKind::AddressLine1,
                IdentityDataKind::Zip,
                IdentityDataKind::State,
                IdentityDataKind::Country,
                IdentityDataKind::City,
            ],
        }
        .are_satisfied(present_data_lifetime_kinds)
    }
}

impl HasIdentityDataRequirements for SocureIdPlus {
    fn requirements_are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool {
        meets_requirements_for_idplus_request(present_data_lifetime_kinds)
    }
}

impl HasIdentityDataRequirements for IdologyExpectId {
    fn requirements_are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool {
        MinimumIDVRequirements {
            required: vec![
                IdentityDataKind::FirstName,
                IdentityDataKind::LastName,
                IdentityDataKind::AddressLine1,
            ],
        }
        .are_satisfied(present_data_lifetime_kinds)
    }
}

impl HasIdentityDataRequirements for IdologyPa {
    fn requirements_are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool {
        MinimumIDVRequirements {
            required: vec![
                IdentityDataKind::FirstName,
                IdentityDataKind::LastName,
                IdentityDataKind::AddressLine1,
            ],
        }
        .are_satisfied(present_data_lifetime_kinds)
    }
}

impl HasIdentityDataRequirements for IncodeWatchlistCheck {
    fn requirements_are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool {
        MinimumIDVRequirements {
            required: vec![IdentityDataKind::FirstName, IdentityDataKind::LastName],
        }
        .are_satisfied(present_data_lifetime_kinds)
    }
}

impl HasIdentityDataRequirements for LexisFlexId {
    fn requirements_are_satisfied(&self, present_data_lifetime_kinds: &[IdentityDataKind]) -> bool {
        MinimumIDVRequirements {
            // technicaly Lexis doesn't seem to error if all of these are even missing but this is what they
            // recommend and its in line with our other kyc reqs
            required: vec![
                IdentityDataKind::FirstName,
                IdentityDataKind::LastName,
                IdentityDataKind::AddressLine1,
                IdentityDataKind::Zip,
                IdentityDataKind::State,
                IdentityDataKind::City,
            ],
        }
        .are_satisfied(present_data_lifetime_kinds)
    }
}

pub struct SocureRequirements {
    // The kinds that a required (minimum)
    pub required: Vec<IdentityDataKind>,
    // at least one of these sets of kinds are required
    pub one_of: Vec<Vec<IdentityDataKind>>,
}
