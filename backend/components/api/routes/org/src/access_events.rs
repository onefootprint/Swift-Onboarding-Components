use crate::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use crate::types::request::CursorPaginationRequest;
use crate::types::response::CursorPaginatedResponse;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::types::CursorPaginatedResponseInner;
use chrono::{
    DateTime,
    Utc,
};
use db::access_event::{
    AccessEventListItemForTenant,
    AccessEventListQueryParams,
};
use newtypes::input::deserialize_stringified_list;
use newtypes::{
    AccessEventKind,
    DataIdentifier,
};
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
    Apiv2Schema,
};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    kind: Option<AccessEventKind>,
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    targets: Vec<DataIdentifier>,
    search: Option<String>,
    timestamp_lte: Option<DateTime<Utc>>,
    timestamp_gte: Option<DateTime<Utc>>,
}

type AccessEventResponse = Vec<api_wire_types::AccessEvent>;

#[api_v2_operation(
    description = "View all access events for all users.",
    tags(Organization, Private)
)]
#[get("/org/access_events")]
async fn get(
    state: web::Data<State>,
    filters: web::Query<AccessEventRequest>,
    pagination: web::Query<CursorPaginationRequest<i64>>,
    auth: TenantSessionAuth,
) -> CursorPaginatedResponse<AccessEventResponse, i64> {
    let auth = auth.check_guard(TenantGuard::Read)?;

    let page_size = pagination.page_size(&state);
    let cursor = pagination.cursor;
    let AccessEventRequest {
        kind,
        targets,
        search,
        timestamp_lte,
        timestamp_gte,
    } = filters.into_inner();

    let tenant = auth.tenant();
    let params = AccessEventListQueryParams {
        tenant_id: tenant.id.clone(),
        search,
        timestamp_lte,
        timestamp_gte,
        kind,
        targets,
        is_live: auth.is_live()?,
    };
    let results =
        AccessEventListItemForTenant::get(&state.db_pool, params, cursor, (page_size + 1) as i64).await?;

    // If there are more than page_size results, we should tell the client there's another page
    let cursor = pagination
        .cursor_item(&state, &results)
        .map(|x| x.event.0.ordering_id);
    let response = results
        .into_iter()
        .take(page_size)
        .map(api_wire_types::AccessEvent::from_db)
        .collect::<Vec<api_wire_types::AccessEvent>>();
    CursorPaginatedResponseInner::ok(response, cursor, None)
}
