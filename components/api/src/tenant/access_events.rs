use crate::auth::client_secret_key::SecretTenantAuthContext;
use crate::auth::either::Either;
use crate::types::access_event::ApiAccessEvent;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use newtypes::{tenant::workos::WorkOsSession, DataKind, FootprintUserId};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    footprint_user_id: Option<FootprintUserId>,
    data_kind: Option<DataKind>,
}

type AccessEventResponse = Vec<ApiAccessEvent>;

#[api_v2_operation(tags(Org))]
#[get("/access_events")]
/// Allows a tenant to view a list of AccessEvent logs for a specific user's data. Optionally
/// allows filtering on data_kind.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    request: web::Query<AccessEventRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<AccessEventResponse>>, ApiError> {
    // TODO potentially retrieve decrypted email for who performed the access event
    let tenant = auth.tenant(&state.db_pool).await?;
    let results = db::access_event::list_for_tenant(
        &state.db_pool,
        tenant.id.clone(),
        request.footprint_user_id.clone(),
        request.data_kind.map(DataKind::from),
    )
    .await?
    .into_iter()
    .map(ApiAccessEvent::from)
    .collect();

    Ok(Json(ApiResponseData { data: results }))
}
