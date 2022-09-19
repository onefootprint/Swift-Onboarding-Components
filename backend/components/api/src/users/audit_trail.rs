use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::CheckTenantPermissions;
use crate::auth::Either;
use crate::auth::WorkOsAuth;
use crate::errors::ApiError;
use crate::types::audit_trail::FpAuditTrail;
use crate::types::response::ResponseData;
use crate::State;
use db::models::audit_trail::AuditTrail;
use newtypes::FootprintUserId;
use newtypes::TenantPermission;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
struct AuditTrailRequest {
    footprint_user_id: FootprintUserId,
}

type AuditTrailResponse = Vec<FpAuditTrail>;

#[api_v2_operation(
    summary = "/users/audit_trail",
    operation_id = "users-audit_trail",
    description = "Allows a tenant to view a customer's audit trail.",
    tags(PublicApi)
)]
#[get("/audit_trail")]
fn get(
    state: web::Data<State>,
    request: web::Query<AuditTrailRequest>,
    auth: Either<WorkOsAuth, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ResponseData<AuditTrailResponse>>, ApiError> {
    let auth = auth.check_permissions(vec![TenantPermission::ApiKeys])?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let logs = state
        .db_pool
        .db_query(move |conn| {
            AuditTrail::get_for_tenant(conn, &tenant_id, &request.footprint_user_id, is_live)
        })
        .await??;

    let response = logs.into_iter().map(FpAuditTrail::from).collect::<Vec<_>>();
    Ok(Json(ResponseData::ok(response)))
}
