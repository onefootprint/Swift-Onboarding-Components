use db::models::onboardings::Onboarding;
use thiserror::Error;

use crate::errors::ApiError;
pub mod client_public_key;
pub mod client_secret_key;
pub mod logged_in_session;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Unknown client")]
    UnknownClient,
    #[error("missing X-Client-Public-Key")]
    MissingClientPublicAuthHeader,
    #[error("missing X-Client-Secret-Key")]
    MissingClientSecretAuthHeader,
    #[error("missing X-Fpuser-Authorization")]
    MissingFpuserAuthHeader,
    #[error("missing session token in cookie")]
    MissingSessionTokenCookie,
    #[error("error reading session: {0}")]
    SessionError(#[from] actix_web::Error),
    #[error("incorrect session type auth")]
    SessionTypeError,
    #[error("invalid json {0}")]
    InvalidSessionJson(serde_json::Error),
    #[error("invalid session state")]
    InvalidSessionState,
    #[error("no session found")]
    NoSessionFound,
}

/// For endpoints that take both a user_auth and tenant_auth, this helps to assert that the authenticated user
/// has been onboarded to the provided tenant by fetching the Onboarding for this (user, tenant) pair.
pub async fn get_onboarding_for_tenant(
    db_pool: &db::DbPool,
    user_auth: &logged_in_session::LoggedInSessionContext,
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
