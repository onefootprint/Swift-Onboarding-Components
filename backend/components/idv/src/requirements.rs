use crate::socure::requirements::meets_requirements_for_idplus_request;
use newtypes::IdentityDataKind;
use newtypes::VendorAPI;
use strum::IntoEnumIterator;

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

pub struct SocureRequirements {
    // The kinds that a required (minimum)
    pub required: Vec<IdentityDataKind>,
    // at least one of these sets of kinds are required
    pub one_of: Vec<Vec<IdentityDataKind>>,
}

/// Based on the VendorAPI and the available data in the vault, determine if we are able make a request to a particular API
fn vendor_api_requirements_are_satisfied(
    vendor_api: &VendorAPI,
    present_data_lifetime_kinds: &[IdentityDataKind],
) -> bool {
    let expectid_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
        required: vec![
            IdentityDataKind::FirstName,
            IdentityDataKind::LastName,
            IdentityDataKind::AddressLine1,
        ],
    };
    let twilio_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
        required: vec![IdentityDataKind::PhoneNumber],
    };

    let _experian_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
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
    };

    match vendor_api {
        VendorAPI::IdologyExpectID => expectid_requirements.are_satisfied(present_data_lifetime_kinds),
        // These document related vendors are a no op, since they are handled separately from KYC requests
        VendorAPI::IdologyScanVerifyResults => false,
        VendorAPI::IdologyScanVerifySubmission => false,
        VendorAPI::IdologyScanOnboarding => false,
        VendorAPI::TwilioLookupV2 => twilio_requirements.are_satisfied(present_data_lifetime_kinds),
        VendorAPI::SocureIDPlus => meets_requirements_for_idplus_request(present_data_lifetime_kinds),
        VendorAPI::IdologyPa => false,
        VendorAPI::ExperianPreciseID => false, //experian_requirements.are_satisfied(present_data_lifetime_kinds),
                                               // TODO: Experian requirements are more difficult because we need to check that Experian is enabled for the Tenant
    }
}

/// All the available apis based on the data we have
pub fn available_vendor_apis(present_data_lifetime_kinds: &[IdentityDataKind]) -> Vec<VendorAPI> {
    VendorAPI::iter()
        .filter(|v| vendor_api_requirements_are_satisfied(v, present_data_lifetime_kinds))
        .collect()
}

#[cfg(test)]
mod tests {

    use super::*;
    use test_case::test_case;

    // Socure requirements are tested in socure/requirements.rs
    #[test_case(&[IdentityDataKind::FirstName, IdentityDataKind::LastName] => vec![VendorAPI::SocureIDPlus])]
    #[test_case(&[IdentityDataKind::FirstName, IdentityDataKind::LastName, IdentityDataKind::AddressLine1] => vec![VendorAPI::IdologyExpectID, VendorAPI::SocureIDPlus])]
    #[test_case(&[IdentityDataKind::FirstName, IdentityDataKind::LastName, IdentityDataKind::AddressLine1, IdentityDataKind::PhoneNumber] => vec![VendorAPI::IdologyExpectID, VendorAPI::TwilioLookupV2, VendorAPI::SocureIDPlus])]
    fn test_available_vendor_apis(present_data_lifetime_kinds: &[IdentityDataKind]) -> Vec<VendorAPI> {
        available_vendor_apis(present_data_lifetime_kinds)
    }
}
