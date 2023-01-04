use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantUserAuthContext;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::request::PaginatedRequest;
use crate::types::response::PaginatedResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use chrono::{DateTime, Utc};
use db::access_event::{AccessEventListItemForTenant, AccessEventListQueryParams};
use newtypes::csv::deserialize_stringified_list;
use newtypes::AccessEventKind;
use newtypes::DataIdentifier;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct AccessEventRequest {
    footprint_user_id: Option<FootprintUserId>,
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
    description = " Allows a tenant to view a list of AccessEvent logs for a specific user's data. \
    Optionally allows filtering on data_kind. Requires tenant secret key auth.",
    tags(Organization, PublicApi)
)]
#[get("/org/access_events")]
async fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<AccessEventRequest, i64>>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<Json<PaginatedResponseData<AccessEventResponse, i64>>, ApiError> {
    let auth = auth.check_permissions(TenantPermission::Users)?;

    let page_size = request.page_size(&state);
    let cursor = request.cursor;
    let AccessEventRequest {
        footprint_user_id,
        kind,
        targets,
        search,
        timestamp_lte,
        timestamp_gte,
    } = request.data.clone();

    let tenant = auth.tenant();
    let params = AccessEventListQueryParams {
        tenant_id: tenant.id.clone(),
        fp_user_id: footprint_user_id.clone(),
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
    let cursor = request
        .cursor_item(&state, &results)
        .map(|x| x.event.0.ordering_id);
    let response = results
        .into_iter()
        .take(page_size)
        .map(api_wire_types::AccessEvent::from_db)
        .collect::<Vec<api_wire_types::AccessEvent>>();
    Ok(Json(PaginatedResponseData::ok(response, cursor, None)))
}
