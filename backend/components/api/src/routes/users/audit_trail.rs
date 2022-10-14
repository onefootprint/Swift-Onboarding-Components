use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::WorkOsAuthContext;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::audit_trail::FpAuditTrail;
use crate::types::response::ResponseData;
use crate::State;
use db::models::audit_trail::AuditTrail;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

type AuditTrailResponse = Vec<FpAuditTrail>;

#[api_v2_operation(
    description = "Allows a tenant to view a customer's audit trail.",
    tags(Users, PublicApi)
)]
#[actix::get("/users/{footprint_user_id}/audit_trail")]
async fn get(
    state: web::Data<State>,
    path: web::Path<FootprintUserId>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ResponseData<AuditTrailResponse>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::AuditTrail])?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = path.into_inner();

    let logs = state
        .db_pool
        .db_query(move |conn| AuditTrail::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live))
        .await??;

    let response = logs.into_iter().map(FpAuditTrail::from).collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
