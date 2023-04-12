use thiserror::Error;

#[derive(Debug, Error)]
pub enum BusinessError {
    #[error("Data update is not allowed without business")]
    NotAllowedWithoutBusiness,
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
}
