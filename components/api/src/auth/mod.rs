use thiserror::Error;
pub mod pk_tenant;
pub mod user_token;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("unknown tenant")]
    UnknownTenant,
    #[error("missing tenant auth header")]
    MissingTenantAuthHeader,
    #[error("missing tenant auth header")]
    MissingTenantUserTokenAuthHeader,
}
