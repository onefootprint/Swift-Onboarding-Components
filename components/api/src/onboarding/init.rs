use crate::auth::client_public_key::PublicTenantAuthContext;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use db::models::onboardings::{NewOnboarding, Onboarding};
use db::models::user_vaults::UserVaultWrapper;
use newtypes::{DataKind, Status};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct OnboardingResponse {
    /// Attributes needed to successfully onboard this user
    missing_attributes: Vec<DataKind>,
}

#[api_v2_operation]
/// Gets or creates the onboarding for this (user, tenant) pair. Returns the list of fields
/// required to complete the onboarding for this tenant.
pub fn handler(
    state: web::Data<State>,
    tenant_auth: PublicTenantAuthContext,
    user_auth: LoggedInSessionContext,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    let uv = user_auth.user_vault();
    let _: Onboarding = NewOnboarding {
        tenant_id: tenant_auth.tenant().id.clone(),
        user_vault_id: uv.id.clone(),
        status: Status::Processing,
    }
    .get_or_create(&state.db_pool)
    .await?;

    let uvw = UserVaultWrapper::from(&state.db_pool, uv).await?;
    Ok(Json(ApiResponseData {
        data: OnboardingResponse {
            missing_attributes: uvw.missing_fields(),
        },
    }))
}
