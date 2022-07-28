use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::types::audit_trail::ApiAuditTrail;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use db::models::audit_trails::AuditTrail;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, get, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
struct AuditTrailRequest {
    footprint_user_id: FootprintUserId,
}

type AuditTrailResponse = Vec<ApiAuditTrail>;

#[api_v2_operation(tags(Org))]
#[get("/audit_trail")]
/// Allows a tenant to view a customer's audit trail
fn get(
    state: web::Data<State>,
    request: web::Query<AuditTrailRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<AuditTrailResponse>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let is_live = auth.is_live()?;

    let logs = state
        .db_pool
        .db_query(move |conn| {
            AuditTrail::get_for_tenant(conn, &tenant.id, &request.footprint_user_id, is_live)
        })
        .await??;

    let response = logs.into_iter().map(ApiAuditTrail::from).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
