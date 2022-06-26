use self::{
    session_context::SessionContext,
    session_data::{tenant::ob_public_key::PublicTenantAuthContext, user::onboarding::OnboardingSession},
};
use crate::errors::ApiError;
use db::models::onboardings::Onboarding;
use thiserror::Error;

pub mod either;
pub mod session_context;
pub mod session_data;
pub mod uv_permission;

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
    #[error("missing header: {0}")]
    MissingHeader(String),
    #[error("unauthorized operation")]
    UnauthorizedOperation,
    #[error("session expired")]
    SessionExpired,
}

/// For endpoints that take both a user_auth and tenant_auth, this helps to assert that the authenticated user
/// has been onboarded to the provided tenant by fetching the Onboarding for this (user, tenant) pair.
pub async fn get_onboarding_for_tenant(
    db_pool: &db::DbPool,
    user_auth: &SessionContext<OnboardingSession>,
    tenant_auth: &PublicTenantAuthContext,
) -> Result<Onboarding, ApiError> {
    let onboarding = db::onboarding::get(
        db_pool,
        tenant_auth.ob_config.id.clone(),
        user_auth.to_owned().data.user_vault_id,
    )
    .await?
    .ok_or(ApiError::OnboardingForTenantDoesNotExist)?;

    Ok(onboarding)
}
