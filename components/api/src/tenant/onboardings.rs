use crate::types::onboarding::{ApiOnboarding, ApiStatus};
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    status: Option<ApiStatus>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct OnboardingResponse {
    pub onboardings: Vec<ApiOnboarding>,
}

#[api_v2_operation]
#[get("/onboardings")]
/// Allows a tenant to view a list of AccessEvent logs for a specific user's data. Optionally
/// allows filtering on data_kind.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    request: web::Query<AccessEventRequest>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    // TODO paginate the response when there are too many results
    let tenant = auth.tenant();

    let results = db::onboarding::list_for_tenant(
        &state.db_pool,
        tenant.id.clone(),
        request.status.clone().map(ApiStatus::into),
    )
    .await?
    .into_iter()
    .map(ApiOnboarding::from)
    .collect();

    Ok(Json(ApiResponseData {
        data: OnboardingResponse {
            onboardings: results,
        },
    }))
}
