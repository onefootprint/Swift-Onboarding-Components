use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::types::access_event::ApiAccessEvent;
use crate::types::success::ApiPaginatedResponseData;
use crate::utils::querystring::deserialize_stringified_list;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use chrono::{DateTime, Utc};
use db::access_event::{AccessEventListItemForTenant, AccessEventListQueryParams};
use newtypes::{DataKind, FootprintUserId};
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    footprint_user_id: Option<FootprintUserId>,
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    data_kinds: Vec<DataKind>,
    search: Option<String>,
    timestamp_lte: Option<DateTime<Utc>>,
    timestamp_gte: Option<DateTime<Utc>>,
    cursor: Option<i64>,
    page_size: Option<usize>,
}

type AccessEventResponse = Vec<ApiAccessEvent>;

#[api_v2_operation(tags(Org))]
#[get("/access_events")]
/// Allows a tenant to view a list of AccessEvent logs for a specific user's data. Optionally
/// allows filtering on data_kind.
/// Requires tenant secret key auth.
fn get(
    state: web::Data<State>,
    request: web::Query<AccessEventRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiPaginatedResponseData<AccessEventResponse, i64>>, ApiError> {
    let AccessEventRequest {
        footprint_user_id,
        data_kinds,
        search,
        timestamp_lte,
        timestamp_gte,
        cursor,
        page_size,
    } = request.into_inner();
    let page_size = if let Some(page_size) = page_size {
        page_size
    } else {
        state.config.default_page_size
    };

    let tenant = auth.tenant(&state.db_pool).await?;
    let params = AccessEventListQueryParams {
        tenant_id: tenant.id.clone(),
        fp_user_id: footprint_user_id.clone(),
        search,
        timestamp_lte,
        timestamp_gte,
        kinds: data_kinds,
        is_live: auth.is_live()?,
    };
    let results =
        AccessEventListItemForTenant::get(&state.db_pool, params, cursor, (page_size + 1) as i64).await?;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = if results.len() > page_size {
        results.last().map(|x| x.event.ordering_id)
    } else {
        None
    };

    let response = results
        .into_iter()
        .take(page_size)
        .map(ApiAccessEvent::from)
        .collect::<Vec<ApiAccessEvent>>();
    Ok(Json(ApiPaginatedResponseData::ok(response, cursor, None)))
}
