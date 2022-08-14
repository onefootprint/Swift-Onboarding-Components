use crate::auth::session_data::user::UserAuthScope;
use crate::auth::VerifiedUserAuth;
use crate::auth::{key_context::ob_public_key::PublicTenantAuthContext, UserAuth};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::onboardings::Onboarding;
use db::models::webauthn_credential::WebauthnCredential;
use db::DbError;
use newtypes::{DataKind, SessionAuthToken};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use super::create_onboarding_validation_token;

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingResponse {
    /// Attributes needed to successfully onboard this user
    missing_attributes: Vec<DataKind>,
    /// Whether or not webauthn credentials are needed for this user
    missing_webauthn_credentials: bool,
    // Populated if the user has already onboarded onto this tenant's ob_configuration
    validation_token: Option<SessionAuthToken>,
}

#[api_v2_operation(tags(Hosted, Bifrost))]
/// Gets or creates the onboarding for this (user, tenant) pair. Returns the list of fields
/// required to complete the onboarding for this tenant.
pub fn handler(
    state: web::Data<State>,
    tenant_auth: PublicTenantAuthContext,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let uv = user_auth.user_vault(&state.db_pool).await?;
    if tenant_auth.ob_config.is_live != uv.is_live {
        return Err(OnboardingError::InvalidSandboxState.into());
    }

    let ob_config_id = tenant_auth.ob_config.id.clone();
    let uv_id = uv.id.clone();
    let session_key = state.session_sealing_key.clone();
    let (validation_token, webauthn_creds) = state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            // Check if the customer has already onboarded onto this exact ob_config
            let existing_ob = Onboarding::get_by_config(conn, &uv_id, &ob_config_id)?;
            let validation_token = if let Some(ob) = existing_ob {
                Some(create_onboarding_validation_token(conn, &session_key, ob.id)?)
            } else {
                None
            };
            let creds = WebauthnCredential::get_for_user_vault(conn, &user_auth.data.user_vault_id)?;
            Ok((validation_token, creds))
        })
        .await??;

    let uvw = UserVaultWrapper::from(&state.db_pool, uv).await?;
    Ok(Json(ApiResponseData {
        data: OnboardingResponse {
            missing_attributes: uvw.missing_fields(&tenant_auth.ob_config),
            missing_webauthn_credentials: webauthn_creds.is_empty(),
            validation_token,
        },
    }))
}
