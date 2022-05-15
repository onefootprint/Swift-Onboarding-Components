use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::access_event::ApiAccessEvent;
use crate::types::success::ApiResponseData;
use crate::State;
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    data_kind: Option<DataKind>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventResponse {
    pub events: Vec<ApiAccessEvent>,
}

#[api_v2_operation]
#[get("/access_events")]
/// Returns a list of AccessEvent logs that show which tenants have viewed the logged-in user's
/// data. Optionally allows filtering on data_kind
/// Requires user authentication sent in the cookie after a successful /identify/verify call
fn handler(
    state: web::Data<State>,
    request: web::Query<AccessEventRequest>,
    user_auth: LoggedInSessionContext,
) -> actix_web::Result<Json<ApiResponseData<AccessEventResponse>>, ApiError> {
    // TODO paginate the response when there are too many results
    let results = db::access_event::list(
        &state.db_pool,
        user_auth.user_vault().id.clone(),
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
