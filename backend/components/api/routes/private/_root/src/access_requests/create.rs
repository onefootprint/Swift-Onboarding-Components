use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_core::State;
use api_wire_types::AccessRequest;
use api_wire_types::CreateAccessRequestRequest;
use chrono::Utc;
use db::models::insight_event::CreateInsightEvent;
use db::models::super_admin_request::NewSuperAdminRequest;
use db::models::super_admin_request::SuperAdminRequest;
use db::models::tenant_user::TenantUser;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Creates a new access request",
    tags(AccessRequests, Organization, Private)
)]
#[actix::post("/private/access_requests")]
pub async fn create_access_request(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    request: Json<CreateAccessRequestRequest>,
    insights: InsightHeaders,
) -> ApiResponse<AccessRequest> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;
    let tenant_user_id = auth.data.tenant_user.id;

    let CreateAccessRequestRequest {
        scopes,
        reason,
        duration_hours,
        tenant_id,
    } = request.into_inner();

    let insight = CreateInsightEvent::from(insights);
    let access_request = state
        .db_transaction(move |conn| {
            let ie = insight.insert_with_conn(conn)?;

            let now = Utc::now();
            let expires_at = now + chrono::Duration::hours(duration_hours);
            let tenant_user = TenantUser::get(conn, &tenant_user_id)?;

            let request = NewSuperAdminRequest {
                tenant_user_id,
                tenant_id,
                scopes,
                created_at: now,
                expires_at,
                insight_event_id: ie.id,
                reason: reason.clone(),
            };

            let created = SuperAdminRequest::create(conn, request)?;

            Ok(AccessRequest {
                id: created.id,
                requester: tenant_user.email,
                scopes: created.scopes,
                created_at: created.created_at,
                expires_at: created.expires_at,
                responder: None,
                responded_at: None,
                reason,
                approved: None,
            })
        })
        .await?;

    Ok(access_request)
}
