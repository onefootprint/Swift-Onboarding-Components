use newtypes::{Vendor, VendorAPI};

use self::rule::RuleSetName;

pub mod biz_risk;
pub mod engine;
pub mod features;
pub mod field_validations;
pub mod onboarding;
pub mod risk;
pub mod rule;
pub mod sandbox;
#[allow(unused)]
pub mod state;
#[cfg(test)]
pub mod tests;
pub mod utils;
pub mod vendor;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Missing data for rules_set {0}")]
    MissingDataForRuleSet(RuleSetName),
    #[error("TenantVendorControl error {0}")]
    TenantVendorControlError(#[from] TenantVendorControlError),
    #[error("Fixture data not found for: {0}")]
    FixtureDataNotFound(VendorAPI),
}

#[derive(thiserror::Error, Debug)]
pub enum TenantVendorControlError {
    #[error("No tenant specific credentials for vendor {0}")]
    MissingCredentialsForVendor(Vendor),
    #[error("Enclave error {0}")]
    EnclaveError(#[from] crate::errors::enclave::EnclaveError),
}
