use crate::auth::session_context::{HasUserVaultId, SessionContext};
use crate::auth::session_data::tenant::ob_public_key::PublicTenantAuthContext;
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::onboardings::Onboarding;
use db::DbError;
use db::{models::insight_event::CreateInsightEvent, webauthn_credentials::get_webauthn_creds};
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
    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), DbError> {
            let insight_event = CreateInsightEvent::from(insights).insert_with_conn(conn)?;
            Onboarding::get_or_create(
                conn,
                uv_id,
                tenant_auth.tenant.id.clone(),
                insight_event.id,
                tenant_auth.ob_config.is_live,
            )?;
            Ok(())
        })
        .await?;

    let webauthn_creds = get_webauthn_creds(&state.db_pool, user_auth.data.user_vault_id).await?;

    let uvw = UserVaultWrapper::from(&state.db_pool, uv).await?;
    Ok(Json(ApiResponseData {
        data: OnboardingResponse {
            missing_attributes: uvw.missing_fields(&tenant_auth.ob_config),
            missing_webauthn_credentials: webauthn_creds.is_empty(),
        },
    }))
}
