use thiserror::Error;

#[derive(Debug, Error)]
pub enum BusinessError {
    #[error("This business owner has already started KYC")]
    BoAlreadyHasVault,
    #[error("This business doesn't have an associated name")]
    NoName,
    #[error("BO not found with link_id")]
    LinkedBoNotFound,
    #[error("Primary business owner not found for Business")]
    PrimaryBoNotFound,
}

impl api_errors::FpErrorTrait for BusinessError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
