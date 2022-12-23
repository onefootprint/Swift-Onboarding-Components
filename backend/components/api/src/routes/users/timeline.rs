use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantUserAuthContext;
use crate::auth::Either;

use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;

use crate::utils::db2api::DbToApi;
use crate::State;

use db::models::user_timeline::UserTimeline;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web};

type TimelineEventsResponse = Vec<api_wire_types::UserTimeline>;

#[api_v2_operation(
    description = "Gets the timeline for a user verification trail.",
    tags(Users, PublicApi)
)]
#[get("/users/{footprint_user_id}/timeline")]
pub async fn get(
    state: web::Data<State>,
    request: web::Path<FootprintUserId>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<TimelineEventsResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::Users])?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = request.into_inner();

    let events = state
        .db_pool
        .db_query(move |conn| UserTimeline::list(conn, footprint_user_id, tenant_id, is_live))
        .await??;
    let events = events
        .into_iter()
        .map(api_wire_types::UserTimeline::from_db)
        .collect();
    ResponseData::ok(events).json()
}
