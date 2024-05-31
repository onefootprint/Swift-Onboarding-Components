use thiserror::Error;

#[derive(Debug, Error)]
pub enum BusinessError {
    #[error("This business owner has already started KYC")]
    BoAlreadyHasVault,
    #[error("This business doesn't have an associated name")]
    NoName,
    #[error("Not allowed to have multiple BOs")]
    TooManyBos,
    #[error("BO not found with link_id")]
    LinkedBoNotFound,
    #[error("Primary business owner not found for Business")]
    PrimaryBoNotFound,
}
