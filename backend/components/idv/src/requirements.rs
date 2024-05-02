use crate::socure::requirements::meets_requirements_for_idplus_request;
use newtypes::{IdentityDataKind, VendorAPI};
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
pub fn vendor_api_requirements_are_satisfied(
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

    let experian_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
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

    let lexis_flex_id_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
        // technicaly Lexis doesn't seem to error if all of these are even missing but this is what they recommend and its in line with our other kyc reqs
        required: vec![
            IdentityDataKind::FirstName,
            IdentityDataKind::LastName,
            IdentityDataKind::AddressLine1,
            IdentityDataKind::Zip,
            IdentityDataKind::State,
            IdentityDataKind::City,
        ],
    };

    let idology_pa_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
        required: vec![
            IdentityDataKind::FirstName,
            IdentityDataKind::LastName,
            IdentityDataKind::AddressLine1,
        ],
    };

    let incode_watchlist_requirements: MinimumIDVRequirements = MinimumIDVRequirements {
        required: vec![IdentityDataKind::FirstName, IdentityDataKind::LastName],
    };

    match vendor_api {
        VendorAPI::IdologyExpectId => expectid_requirements.are_satisfied(present_data_lifetime_kinds),
        VendorAPI::TwilioLookupV2 => twilio_requirements.are_satisfied(present_data_lifetime_kinds),
        VendorAPI::SocureIdPlus => meets_requirements_for_idplus_request(present_data_lifetime_kinds),
        VendorAPI::IdologyPa => idology_pa_requirements.are_satisfied(present_data_lifetime_kinds),
        VendorAPI::ExperianPreciseId => experian_requirements.are_satisfied(present_data_lifetime_kinds),
        VendorAPI::MiddeskCreateBusiness => false,
        VendorAPI::MiddeskBusinessUpdateWebhook => false,
        VendorAPI::MiddeskTinRetriedWebhook => false,
        VendorAPI::MiddeskGetBusiness => false,
        VendorAPI::IncodeStartOnboarding => false,
        VendorAPI::IncodeAddFront => false,
        VendorAPI::IncodeAddBack => false,
        VendorAPI::IncodeProcessId => false,
        VendorAPI::IncodeFetchScores => false,
        VendorAPI::IncodeAddPrivacyConsent => false,
        VendorAPI::IncodeAddMlConsent => false,
        VendorAPI::IncodeFetchOcr => false,
        VendorAPI::IncodeAddSelfie => false,
        VendorAPI::IncodeWatchlistCheck => {
            incode_watchlist_requirements.are_satisfied(present_data_lifetime_kinds)
        }
        VendorAPI::IncodeUpdatedWatchlistResult => false,
        VendorAPI::IncodeGetOnboardingStatus => false,
        VendorAPI::IncodeProcessFace => false,
        VendorAPI::StytchLookup => false,
        VendorAPI::FootprintDeviceAttestation => false,
        VendorAPI::AwsRekognition => false,
        VendorAPI::AwsTextract => false,
        VendorAPI::LexisFlexId => lexis_flex_id_requirements.are_satisfied(present_data_lifetime_kinds),
        VendorAPI::IncodeCurpValidation => false,
        VendorAPI::IncodeGovernmentValidation => false,
        VendorAPI::NeuroIdAnalytics => false,
        VendorAPI::IncodeApproveSession => false,
    }
}

/// All the available apis based on the data we have
pub fn available_vendor_apis(present_data_lifetime_kinds: &[IdentityDataKind]) -> Vec<VendorAPI> {
    VendorAPI::iter()
        .filter(|v| vendor_api_requirements_are_satisfied(v, present_data_lifetime_kinds))
        .filter(vendor_api_eligible_for_onboarding_kyc)
        .collect()
}

/// Is the API one we want to call for our onboarding KYC verificaiton
fn vendor_api_eligible_for_onboarding_kyc(vendor_api: &VendorAPI) -> bool {
    match vendor_api {
        VendorAPI::TwilioLookupV2
        | VendorAPI::SocureIdPlus
        | VendorAPI::ExperianPreciseId
        | VendorAPI::IdologyExpectId
        | VendorAPI::LexisFlexId => true,
        VendorAPI::MiddeskCreateBusiness
        | VendorAPI::MiddeskBusinessUpdateWebhook
        | VendorAPI::MiddeskTinRetriedWebhook
        | VendorAPI::MiddeskGetBusiness
        | VendorAPI::IncodeStartOnboarding
        | VendorAPI::IncodeAddFront
        | VendorAPI::IncodeAddBack
        | VendorAPI::IncodeProcessId
        | VendorAPI::IncodeFetchScores
        | VendorAPI::IncodeAddPrivacyConsent
        | VendorAPI::IncodeAddMlConsent
        | VendorAPI::IncodeFetchOcr
        | VendorAPI::IncodeAddSelfie
        | VendorAPI::IncodeWatchlistCheck
        | VendorAPI::IncodeUpdatedWatchlistResult
        | VendorAPI::IncodeGetOnboardingStatus
        | VendorAPI::IncodeProcessFace
        | VendorAPI::StytchLookup
        | VendorAPI::FootprintDeviceAttestation
        | VendorAPI::AwsRekognition
        | VendorAPI::AwsTextract
        | VendorAPI::IncodeCurpValidation
        | VendorAPI::IncodeGovernmentValidation
        | VendorAPI::NeuroIdAnalytics
        | VendorAPI::IncodeApproveSession
        | VendorAPI::IdologyPa => false,
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use test_case::test_case;

    // Socure requirements are tested in socure/requirements.rs
    #[test_case(&[IdentityDataKind::FirstName, IdentityDataKind::LastName] => vec![VendorAPI::SocureIdPlus])]
    #[test_case(&[IdentityDataKind::FirstName, IdentityDataKind::LastName, IdentityDataKind::AddressLine1] => vec![VendorAPI::IdologyExpectId, VendorAPI::SocureIdPlus])]
    #[test_case(&[IdentityDataKind::FirstName, IdentityDataKind::LastName, IdentityDataKind::AddressLine1, IdentityDataKind::PhoneNumber] => vec![VendorAPI::IdologyExpectId, VendorAPI::TwilioLookupV2, VendorAPI::SocureIdPlus])]
    #[test_case(&[
        IdentityDataKind::FirstName,
        IdentityDataKind::LastName,
        IdentityDataKind::AddressLine1,
        IdentityDataKind::Zip,
        IdentityDataKind::State,
        IdentityDataKind::Country,
        IdentityDataKind::City,
    ] => vec![VendorAPI::IdologyExpectId, VendorAPI::SocureIdPlus, VendorAPI::ExperianPreciseId, VendorAPI::LexisFlexId])]
    fn test_available_vendor_apis(present_data_lifetime_kinds: &[IdentityDataKind]) -> Vec<VendorAPI> {
        available_vendor_apis(present_data_lifetime_kinds)
    }
}
