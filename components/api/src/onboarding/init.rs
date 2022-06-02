use crate::auth::client_public_key::PublicTenantAuthContext;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::State;
use db::models::onboardings::NewOnboarding;
use db::models::user_vaults::UserVaultWrapper;
use db::{models::insight_event::CreateInsightEvent, webauthn_credentials::get_webauthn_creds};
use newtypes::{DataKind, Status};
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
    user_auth: LoggedInSessionContext,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    let uv = user_auth.user_vault();

    NewOnboarding::get_or_create(
        &state.db_pool,
        uv.id.clone(),
        tenant_auth.tenant().id.clone(),
        Status::Processing,
        CreateInsightEvent::from(insights),
    )
    .await?;

    let webauthn_creds = get_webauthn_creds(&state.db_pool, uv.id.clone()).await?;

    // TODO: Tenant-scoped missing attributes
    let uvw = UserVaultWrapper::from(&state.db_pool, uv.clone()).await?;
    Ok(Json(ApiResponseData {
        data: OnboardingResponse {
            missing_attributes: uvw.missing_fields(),
            missing_webauthn_credentials: webauthn_creds.is_empty(),
        },
    }))
}
