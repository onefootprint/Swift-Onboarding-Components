use crate::errors::ApiError;
use db::models::onboardings::Onboarding;
use newtypes::DataKind;
use thiserror::Error;
pub mod client_public_key;
pub mod client_secret_key;
pub mod onboarding_session;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("unknown client")]
    UnknownClient,
    #[error("missing X-Client-Public-Key")]
    MissingClientPublicAuthHeader,
    #[error("missing X-Client-Secret-Key")]
    MissingClientSecretAuthHeader,
    #[error("missing X-Fpuser-Authorization")]
    MissingFpuserAuthHeader,
    #[error("error reading session: {0}")]
    SessionError(#[from] actix_web::Error),
    #[error("incorrect session type auth")]
    SessionTypeError,
    #[error("no session found")]
    NoSessionFound,
    #[error("missing X-Fp-Dashboard-Authorization")]
    MissingFpDashboardHeader,
    #[error("unauthorized operation")]
    UnauthorizedOperation,
}

pub trait UserVaultPermissions {
    fn can_decrypt(&self, data_kinds: Vec<DataKind>) -> bool;
    fn can_modify(&self, data_kinds: Vec<DataKind>) -> bool;
}

/// For endpoints that take both a user_auth and tenant_auth, this helps to assert that the authenticated user
/// has been onboarded to the provided tenant by fetching the Onboarding for this (user, tenant) pair.
pub async fn get_onboarding_for_tenant(
    db_pool: &db::DbPool,
    user_auth: &onboarding_session::OnboardingSessionContext,
    tenant_auth: &client_public_key::PublicTenantAuthContext,
) -> Result<Onboarding, ApiError> {
    let onboarding = db::onboarding::get(
        db_pool,
        tenant_auth.tenant().id.clone(),
        user_auth.user_vault().id.clone(),
    )
    .await?
    .ok_or(ApiError::OnboardingForTenantDoesNotExist)?;

    Ok(onboarding)
}
