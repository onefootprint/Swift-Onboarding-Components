use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use chrono::NaiveDateTime;
use newtypes::{FootprintUserId, Status};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    status: Option<Status>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct OnboardingItem {
    pub id: FootprintUserId,
    pub status: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct OnboardingResponse {
    pub onboardings: Vec<OnboardingItem>,
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

    let results =
        db::onboarding::list_for_tenant(&state.db_pool, tenant.id.clone(), request.status)
            .await?
            .into_iter()
            .map(|ob| OnboardingItem {
                id: ob.user_ob_id,
                status: ob.status,
                created_at: ob.created_at,
                updated_at: ob.updated_at,
            })
            .collect();

    Ok(Json(ApiResponseData {
        data: OnboardingResponse {
            onboardings: results,
        },
    }))
}
