// TODO do we want to rename this to admin?

use crate::tenant::types::UserVaultFieldKind;
use crate::types::access_event::ApiAccessEvent;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use db::models::types::DataKind;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    footprint_user_id: Option<String>,
    data_kind: Option<UserVaultFieldKind>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventResponse {
    pub events: Vec<ApiAccessEvent>,
}

#[api_v2_operation]
#[get("/access_events")]
/// Allows a tenant to view a list of AccessEvent logs for a specific user's data. Optionally
/// allows filtering on data_kind.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    request: web::Query<AccessEventRequest>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<AccessEventResponse>>, ApiError> {
    // TODO paginate the response when there are too many results
    let tenant = auth.tenant();

    let results = db::access_event::list_for_tenant(
        &state.db_pool,
        tenant.id.clone(),
        request.footprint_user_id.clone(),
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
