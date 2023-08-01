use crate::auth::session::UpdateSession;

use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::session::tenant::TenantRbSession;
use api_core::auth::tenant::AnyTenantSessionAuth;
use api_wire_types::{AssumeRoleRequest, AssumeRoleResponse, Organization, OrganizationMember};
use db::models::tenant_rolebinding::TenantRolebinding;

use paperclip::actix::{api_v2_operation, get, post, web, web::Json};

#[api_v2_operation(
    description = "After the user has proven they own an email address, allow them to assume an
    auth role for any tenant, to which the email address has access.",
    tags(Private)
)]
#[post("/org/auth/assume_role")]
fn post(
    state: web::Data<State>,
    request: Json<AssumeRoleRequest>,
    tenant_auth: AnyTenantSessionAuth,
) -> actix_web::Result<Json<ResponseData<AssumeRoleResponse>>, ApiError> {
    let AssumeRoleRequest { tenant_id } = request.into_inner();
    let auth_method = tenant_auth.auth_method();
    let tu_id = tenant_auth.clone().tenant_user_id()?;

    let ((tenant_user, rb, tenant_role, tenant), _) = state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::login(conn, (&tu_id, &tenant_id)))
        .await?;
    // Assert auth method is supported?
    let session_data = TenantRbSession::create(rb.id.clone(), auth_method).into();

    let session_sealing_key = state.session_sealing_key.clone();
    // Update the auth session to contain the newly assumed role.
    // We update the existing session (and keep the same expiry) rather than issuing a new one to
    // prevent perpetually re-creating yourself a new token
    state
        .db_pool
        .db_query(move |conn| tenant_auth.update_session(conn, &session_sealing_key, session_data))
        .await??;

    let data = AssumeRoleResponse {
        user: OrganizationMember::from_db((tenant_user, rb, tenant_role)),
        tenant: Organization::from_db(tenant),
    };
    ResponseData::ok(data).json()
}

pub type RolesResponse = Vec<Organization>;

#[api_v2_operation(
    description = "Return the list of tenants that can be inherited by the authed user",
    tags(Private)
)]
#[get("/org/auth/roles")]
fn get(
    state: web::Data<State>,
    tenant_auth: AnyTenantSessionAuth,
) -> actix_web::Result<Json<ResponseData<RolesResponse>>, ApiError> {
    let tu_id = tenant_auth.tenant_user_id()?;
    let tenants = state
        .db_pool
        .db_query(move |conn| TenantRolebinding::list_by_user(conn, &tu_id))
        .await??
        .into_iter()
        .map(|(_, tenant)| tenant);

    let data = tenants.map(Organization::from_db).collect();
    ResponseData::ok(data).json()
}
