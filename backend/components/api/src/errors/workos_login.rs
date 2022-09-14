use thiserror::Error;

#[derive(Debug, Error)]
pub enum WorkOsLoginError {
    #[error("workos authorization url error: {0}")]
    AuthorizationUrlError(#[from] url::ParseError),
    #[error("Workos profile has an org, but no tenant exists with the org")]
    TenantForOrgDoesNotExist,
}
