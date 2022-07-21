use crate::auth::session_context::{HasUserVaultId, SessionContext};
use crate::auth::key_context::ob_public_key::PublicTenantAuthContext;
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::insight_event::CreateInsightEvent;
use db::models::onboardings::Onboarding;
use db::models::webauthn_credential::WebauthnCredential;
use db::DbError;
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingResponse {
    /// Attributes needed to successfully onboard this user
    missing_attributes: Vec<DataKind>,
    /// Whether or not webauthn credentials are needed for this user
    missing_webauthn_credentials: bool,
}

#[api_v2_operation(tags(Onboarding))]
/// Gets or creates the onboarding for this (user, tenant) pair. Returns the list of fields
/// required to complete the onboarding for this tenant.
pub fn handler(
    state: web::Data<State>,
    tenant_auth: PublicTenantAuthContext,
    user_auth: SessionContext<OnboardingSession>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    let uv = user_auth.user_vault(&state.db_pool).await?;

    if tenant_auth.ob_config.is_live != uv.is_live {
        return Err(OnboardingError::InvalidSandboxState.into());
    }

    let uv_id = user_auth.data.user_vault_id.clone();
    let webauthn_creds = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            Onboarding::get_or_create(
                conn,
                uv_id,
                tenant_auth.tenant.id.clone(),
                CreateInsightEvent::from(insights),
                tenant_auth.ob_config.is_live,
            )?;
            let webauthn_creds = WebauthnCredential::get_for_user_vault(conn, &user_auth.data.user_vault_id)?;
            Ok(webauthn_creds)
        })
        .await?;

    let uvw = UserVaultWrapper::from(&state.db_pool, uv).await?;
    Ok(Json(ApiResponseData {
        data: OnboardingResponse {
            missing_attributes: uvw.missing_fields(&tenant_auth.ob_config),
            missing_webauthn_credentials: webauthn_creds.is_empty(),
        },
    }))
}
