use crate::auth::session_context::HasUserVaultId;
use crate::auth::{session_context::SessionContext, session_data::user::my_fp::My1fpBasicSession};
use crate::errors::ApiError;
use crate::types::insight_event::ApiInsightEvent;
use crate::types::success::ApiResponseData;
use crate::State;
use chrono::{DateTime, Utc};
use newtypes::{DataKind, OnboardingId, TenantId};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

type OnboardingResponse = Vec<ApiUserOnboarding>;

/// Describes an onboarding of a user vault to a tenant
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiUserOnboarding {
    id: OnboardingId,
    tenant_id: TenantId,
    name: String,
    description: Option<String>,
    logo_url: Option<String>,
    date: DateTime<Utc>,
    authorized_data_kinds: Vec<DataKind>,
    insight: ApiInsightEvent,
}

/// Returns a list of onboardings that a user has performed
#[api_v2_operation(tags(User))]
#[get("/onboardings")]
fn handler(
    state: web::Data<State>,
    user_auth: SessionContext<My1fpBasicSession>,
) -> actix_web::Result<Json<ApiResponseData<OnboardingResponse>>, ApiError> {
    let results = db::onboarding::list_for_user_vault(&state.db_pool, user_auth.user_vault_id())
        .await?
        .into_iter()
        .map(|(onboarding, config, insight)| ApiUserOnboarding {
            id: onboarding.id,
            tenant_id: onboarding.tenant_id,
            date: onboarding.start_timestamp,
            name: config.name,
            description: config.description,
            logo_url: config.logo_url,
            authorized_data_kinds: config.can_access_data_kinds,
            insight: ApiInsightEvent::from(insight),
        })
        .collect();
    Ok(Json(ApiResponseData { data: results }))
}
