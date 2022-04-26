use thiserror::Error;
pub mod pk_tenant;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("unknown tenant")]
    UnknownTenant,
    #[error("missing tenant auth header")]
    MissingTenantAuthHeader,
}
