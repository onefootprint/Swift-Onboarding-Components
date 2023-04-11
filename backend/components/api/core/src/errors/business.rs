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
}
