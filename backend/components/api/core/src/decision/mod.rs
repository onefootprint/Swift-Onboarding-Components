use newtypes::{incode::IncodeDocumentType, Vendor, VendorAPI, VerificationResultId};

pub mod biz_risk;
pub mod engine;
pub mod features;
pub mod field_validations;
pub mod onboarding;
pub mod review;
pub mod risk;
pub mod rule;
pub mod sandbox;
pub mod state;
#[cfg(test)]
pub mod tests;
pub mod utils;
pub mod vendor;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("TenantVendorControl error {0}")]
    TenantVendorControlError(#[from] TenantVendorControlError),
    #[error("Fixture data not found for: {0}")]
    FixtureDataNotFound(VendorAPI),
    #[error("Rule error {0}")]
    RuleError(#[from] RuleError),
    #[error("Incode document type not supported {0}")]
    IncodeDocumentTypeNotSupported(IncodeDocumentType),
    #[error("Cannot build KycFeatureVector from vres: {0}")]
    KycFeatureVectorConversionError(VerificationResultId),
    #[error("Cannot build features for: {0}")]
    FeatureVectorConversionError(VendorAPI),
    #[error("Fixture vres not found")]
    FixtureVresNotFound,
    #[error("Decision not found")]
    DecisionNotFound,
}

#[derive(thiserror::Error, Debug)]
pub enum TenantVendorControlError {
    #[error("No tenant specific credentials for vendor {0}")]
    MissingCredentialsForVendor(Vendor),
    #[error("Enclave error {0}")]
    EnclaveError(#[from] crate::errors::enclave::EnclaveError),
}

#[derive(thiserror::Error, Debug, PartialEq, Eq)]
pub enum RuleError {
    #[error("Missing input for KYC rules")]
    MissingInputForKYCRules,
    #[error("Missing input for Doc rules")]
    MissingInputForDocRules,
    #[error("AssertionError {0}")]
    AssertionError(String),
}
