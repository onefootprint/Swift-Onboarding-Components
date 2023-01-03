use crate::auth::session::AuthSessionData;
use crate::auth::tenant::WorkOsSession;
use crate::auth::SessionContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::{AssumeRoleRequest, AssumeRoleResponse, Organization, OrganizationMember};
use db::models::tenant_user::TenantUser;
use newtypes::OrgMemberEmail;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    description = "After the user has proven they own an email address, 
    login. Once the user clicks the magic link, WorkOs will call the /workos/callback endpoint, \
    at which point we authenticate the user",
    tags(Private)
)]
#[post("/org/auth/assume_role")]
fn handler(
    state: web::Data<State>,
    request: Json<AssumeRoleRequest>,
    auth: SessionContext<WorkOsSession>,
) -> actix_web::Result<Json<ResponseData<AssumeRoleResponse>>, ApiError> {
    let AssumeRoleRequest { tenant_id } = request.into_inner();
    let email = OrgMemberEmail::from(auth.data.email.clone());

    let (tenant_user, tenant_role, tenant) = state
        .db_pool
        .db_transaction(move |conn| TenantUser::login(conn, (&email, &tenant_id), None, None))
        .await?;
    let session_data = AuthSessionData::TenantUser(tenant_user.clone().into());

    let session_sealing_key = state.session_sealing_key.clone();
    // Update the auth session to contain the newly assumed role.
    // We update the existing session (and keep the same expiry) rather than issuing a new one to
    // prevent perpetually re-creating yourself a new token
    state
        .db_pool
        .db_query(move |conn| auth.update_session(conn, &session_sealing_key, session_data))
        .await??;

    let data = AssumeRoleResponse {
        user: OrganizationMember::from_db((tenant_user, tenant_role)),
        tenant: Organization::from_db(tenant),
    };
    ResponseData::ok(data).json()
}
