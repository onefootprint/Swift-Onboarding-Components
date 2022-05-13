// TODO do we want to rename this to admin?

use crate::response::success::ApiResponseData;
use crate::vault::types::UserVaultFieldKind;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use db::models::access_events::AccessEvent;
use db::models::onboardings::Onboarding;
use db::models::types::DataKind;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    footprint_user_id: String,
    data_kind: Option<UserVaultFieldKind>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
struct ApiAccessEvent {
    pub fp_user_id: String,
    pub tenant_id: String,
    pub data_kind: UserVaultFieldKind,
    pub timestamp: chrono::NaiveDateTime,
}

impl From<(AccessEvent, Onboarding)> for ApiAccessEvent {
    fn from(s: (AccessEvent, Onboarding)) -> Self {
        ApiAccessEvent {
            fp_user_id: s.1.user_ob_id,
            tenant_id: s.1.tenant_id,
            data_kind: s.0.data_kind.into(),
            timestamp: s.0.timestamp,
        }
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventResponse {
    pub events: Vec<ApiAccessEvent>,
}

#[api_v2_operation]
#[get("/access_events")]
fn handler(
    state: web::Data<State>,
    request: web::Query<AccessEventRequest>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<AccessEventResponse>>, ApiError> {
    // TODO paginate the response when there are too many results
    let tenant = auth.tenant();

    let results = db::access_event::list(
        &state.db_pool,
        request.footprint_user_id.clone(),
        tenant.id.clone(),
        request.data_kind.clone().map(DataKind::from),
    )
    .await?
    .into_iter()
    .map(ApiAccessEvent::from)
    .collect();

    Ok(Json(ApiResponseData {
        data: AccessEventResponse { events: results },
    }))
}
