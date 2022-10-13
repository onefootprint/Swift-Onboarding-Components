use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::request::PaginatedRequest;
use crate::types::response::PaginatedResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use chrono::{DateTime, Utc};
use db::access_event::{AccessEventListItemForTenant, AccessEventListQueryParams};
use db::models::insight_event::InsightEvent;
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
    summary = "users/access_events",
    operation_id = "users/access_events",
    description = " Allows a tenant to view a list of AccessEvent logs for a specific user's data. \
    Optionally allows filtering on data_kind. Requires tenant secret key auth.",
    tags(PublicApi)
)]
#[get("/access_events")]
fn get(
    state: web::Data<State>,
    request: web::Query<PaginatedRequest<AccessEventRequest, i64>>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<Json<PaginatedResponseData<AccessEventResponse, i64>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
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
    let cursor = request.cursor_item(&state, &results).map(|x| x.event.ordering_id);
    let response = results
        .into_iter()
        .take(page_size)
        .map(api_wire_types::AccessEvent::from_db)
        .collect::<Vec<api_wire_types::AccessEvent>>();
    Ok(Json(PaginatedResponseData::ok(response, cursor, None)))
}

impl DbToApi<AccessEventListItemForTenant> for api_wire_types::AccessEvent {
    fn from_db(evt: AccessEventListItemForTenant) -> Self {
        let AccessEventListItemForTenant {
            event,
            scoped_user,
            insight,
        } = evt;

        api_wire_types::AccessEvent {
            fp_user_id: scoped_user.fp_user_id,
            tenant_id: scoped_user.tenant_id,
            reason: event.reason,
            principal: event.principal,
            timestamp: event.timestamp,
            ordering_id: event.ordering_id,
            insight_event: insight.map(api_wire_types::InsightEvent::from_db),
            kind: event.kind,
            targets: event.targets,
        }
    }
}

impl DbToApi<InsightEvent> for api_wire_types::InsightEvent {
    fn from_db(e: InsightEvent) -> Self {
        let InsightEvent {
            city,
            timestamp,
            ip_address,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
            ..
        } = e;

        api_wire_types::InsightEvent {
            timestamp,
            ip_address,
            city,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
        }
    }
}
