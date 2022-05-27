use crate::errors::ApiError;
use crate::tenant::AuthContext;
use crate::types::success::ApiResponseData;
use crate::State;
use chrono::NaiveDateTime;
use newtypes::{FootprintUserId, Status};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    status: Option<Status>,
    fingerprint: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct OnboardingItem {
    pub footprint_user_id: FootprintUserId,
    pub status: Status,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

type OnboardingResponse = Vec<OnboardingItem>;

#[api_v2_operation(tags(Org))]
#[get("/onboardings")]
/// Allows a tenant to view a list of their Onboardings, effectively showing all users that have
/// started the onboarding process for the tenant. Optionally allows filtering on Onboarding status.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    request: web::Query<AccessEventRequest>,
    auth: AuthContext,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    // TODO paginate the response when there are too many results
    let tenant = auth.tenant();

    let AccessEventRequest {
        status,
        fingerprint,
    } = request.into_inner();

    // TODO clean phone number or email
    let fingerprint = match fingerprint {
        Some(fingerprint) => {
            let cleaned_data = crate::user::clean_for_fingerprint(fingerprint);
            let fingerprint = crate::identify::signed_hash(&state, cleaned_data).await?;
            Some(fingerprint)
        }
        None => None,
    };

    let results =
        db::onboarding::list_for_tenant(&state.db_pool, tenant.id.clone(), status, fingerprint)
            .await?
            .into_iter()
            .map(|ob| OnboardingItem {
                footprint_user_id: ob.user_ob_id,
                status: ob.status,
                created_at: ob.created_at,
                updated_at: ob.updated_at,
            })
            .collect();

    Ok(Json(ApiResponseData { data: results }))
}
