use thiserror::Error;

#[derive(Debug, Error)]
pub enum BusinessError {
    #[error("This business owner has already started KYC")]
    BoAlreadyHasVault,
    #[error("This business doesn't have an associated name")]
    NoName,
    #[error("This business doesn't have associated BOs")]
    NoBos,
    #[error("Not allowed to have multiple BOs")]
    TooManyBos,
    #[error("Not allowed to have KYCed and non-KYCed BOs")]
    KycedAndNonKycedBos,
    #[error("BO not found with link_id")]
    BoNotFound,
    #[error("Primary business owner not found for Business")]
    PrimaryBoNotFound,
    #[error("Primary BO has no Vault")]
    PrimaryBoHasNoVault,
    #[error("One or more BOs have not completed onboarding")]
    BoOnboardingNotComplete,
    #[error("BO vault does not have FirstName")]
    BoVaultMissingFirstName,
    #[error("BO vault does not have LastName")]
    BoVaultMissingLastName,
}
