use crate::socure::requirements::meets_requirements_for_idplus_request;
use newtypes::DataLifetimeKind;
use newtypes::VendorAPI;
use strum::IntoEnumIterator;

/// This struct represents the minimum requirements for sending a request to a specific VendorAPI
///
/// Some vendors (like Socure) have sub-modules that have their own sets of Requirements
pub struct MinimumIDVRequirements {
    // The kinds that a required (minimum)
    required: Vec<DataLifetimeKind>,
}

impl MinimumIDVRequirements {
    pub fn are_satisfied(&self, present_data_lifetime_kinds: &[DataLifetimeKind]) -> bool {
        let required_met = self
            .required
            .iter()
            .all(|r| present_data_lifetime_kinds.contains(r));

        required_met
    }
}

pub struct SocureRequirements {
    // The kinds that a required (minimum)
    pub required: Vec<DataLifetimeKind>,
    // at least one of these sets of kinds are required
    pub one_of: Vec<Vec<DataLifetimeKind>>,
}

/// Based on the VendorAPI and the available data in the vault, determine if we are able make a request to a particular API
fn vendor_api_requirements_are_satisfied(
    vendor_api: &VendorAPI,
    present_data_lifetime_kinds: &[DataLifetimeKind],
) -> bool {
    let expectid_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
        required: vec![
            DataLifetimeKind::FirstName,
            DataLifetimeKind::LastName,
            DataLifetimeKind::AddressLine1,
        ],
    };
    let twilio_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
        required: vec![DataLifetimeKind::PhoneNumber],
    };

    match vendor_api {
        VendorAPI::IdologyExpectID => expectid_requirements.are_satisfied(present_data_lifetime_kinds),
        // These document related vendors are a no op, since they are handled separately from KYC requests
        VendorAPI::IdologyScanVerifyResults => false,
        VendorAPI::IdologyScanVerifySubmission => false,
        VendorAPI::IdologyScanOnboarding => false,
        VendorAPI::TwilioLookupV2 => twilio_requirements.are_satisfied(present_data_lifetime_kinds),
        VendorAPI::SocureIDPlus => meets_requirements_for_idplus_request(present_data_lifetime_kinds),
    }
}

/// All the available apis based on the data we have
pub fn available_vendor_apis(present_data_lifetime_kinds: &[DataLifetimeKind]) -> Vec<VendorAPI> {
    VendorAPI::iter()
        .filter(|v| vendor_api_requirements_are_satisfied(v, present_data_lifetime_kinds))
        .collect()
}

#[cfg(test)]
mod tests {

    use super::*;
    use test_case::test_case;

    // Socure requirements are tested in socure/requirements.rs
    #[test_case(&[DataLifetimeKind::FirstName, DataLifetimeKind::LastName] => vec![VendorAPI::SocureIDPlus])]
    #[test_case(&[DataLifetimeKind::FirstName, DataLifetimeKind::LastName, DataLifetimeKind::AddressLine1] => vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus])]
    #[test_case(&[DataLifetimeKind::FirstName, DataLifetimeKind::LastName, DataLifetimeKind::AddressLine1, DataLifetimeKind::PhoneNumber, DataLifetimeKind::IdentityDocument] => vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2, VendorAPI::SocureIDPlus])]
    fn test_available_vendor_apis(present_data_lifetime_kinds: &[DataLifetimeKind]) -> Vec<VendorAPI> {
        available_vendor_apis(present_data_lifetime_kinds)
    }
}
