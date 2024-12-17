use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_core::State;
use api_wire_types::AccessRequest;
use api_wire_types::PatchAccessRequestRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::super_admin_request::SuperAdminRequest;
use db::models::tenant_user::TenantUser;
use newtypes::SuperAdminAccessRequestId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Updates an access request (e.g. to approve it or extend it's expiration time)",
    tags(AccessRequests, Organization, Private)
)]
#[actix::patch("/private/access_requests/{request_id}")]
pub async fn patch_access_request(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    request_id: web::Path<SuperAdminAccessRequestId>,
    request: Json<PatchAccessRequestRequest>,
    insights: InsightHeaders,
) -> ApiResponse<AccessRequest> {
    let auth = auth.check_guard(FirmEmployeeGuard::RiskOps)?;
    let approver_tenant_user_id = auth.data.tenant_user.id;

    let PatchAccessRequestRequest { approved } = request.into_inner();

    let insight = CreateInsightEvent::from(insights);
    let access_request = state
        .db_transaction(move |conn| {
            let ie = insight.insert_with_conn(conn)?;

            let access_request = SuperAdminRequest::respond(
                conn,
                &request_id,
                approver_tenant_user_id.clone(),
                ie.id,
                approved,
            )?;

            let requester = TenantUser::get(conn, &access_request.tenant_user_id)?;

            let responder = TenantUser::get(conn, &approver_tenant_user_id)?;

            Ok(AccessRequest {
                id: access_request.id,
                requester: requester.email,
                scopes: access_request.scopes,
                created_at: access_request.created_at,
                expires_at: access_request.expires_at,
                responder: Some(responder.email),
                responded_at: access_request.responded_at,
                approved: access_request.approved,
                reason: access_request.reason,
            })
        })
        .await?;

    Ok(access_request)
}
