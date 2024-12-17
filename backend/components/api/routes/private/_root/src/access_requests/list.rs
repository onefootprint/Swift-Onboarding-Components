use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::types::ApiListResponse;
use api_core::types::ListResponse;
use api_core::web::Query;
use api_core::State;
use api_wire_types::AccessRequest;
use api_wire_types::ListAccessRequestsRequest;
use db::models::super_admin_request::SuperAdminRequest;
use db::models::super_admin_request::SuperAdminRequestListArgs;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Lists all access requests for the tenant",
    tags(AccessRequests, Organization, Private)
)]
#[actix::get("/private/access_requests")]
pub async fn list_access_requests(
    state: web::Data<State>,
    request: Query<ListAccessRequestsRequest>,
    auth: FirmEmployeeAuthContext,
) -> ApiListResponse<AccessRequest> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;

    // risk ops see all requests, other users see only their own requests
    let filter_tenant_user_id = if auth.tenant_user.is_risk_ops {
        None
    } else {
        Some(auth.data.tenant_user.id)
    };

    let request = request.into_inner();

    let access_requests = state
        .db_query(move |conn| {
            let requests = SuperAdminRequest::list(
                conn,
                SuperAdminRequestListArgs {
                    approved: request.approved,
                    tenant_user_id: filter_tenant_user_id,
                },
            )?;

            let result = requests
                .into_iter()
                .map(|(request, requester, responder)| AccessRequest {
                    id: request.id,
                    requester,
                    scopes: request.scopes,
                    created_at: request.created_at,
                    expires_at: request.expires_at,
                    responder,
                    responded_at: request.responded_at,
                    approved: request.approved,
                    reason: request.reason,
                });
            Ok(result)
        })
        .await?;

    Ok(ListResponse::from_iter(access_requests))
}
