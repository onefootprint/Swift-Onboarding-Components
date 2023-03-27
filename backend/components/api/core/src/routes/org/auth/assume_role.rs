use crate::auth::session::{AuthSessionData, UpdateSession};
use crate::auth::tenant::{Any, AuthActor, CheckTenantGuard, TenantSessionAuth, WorkOsSession};
use crate::auth::{Either, SessionContext};
use crate::errors::tenant::TenantError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_wire_types::{AssumeRoleRequest, AssumeRoleResponse, Organization, OrganizationMember};
use db::models::tenant_rolebinding::TenantRolebinding;
use newtypes::TenantUserId;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json};

type AnyTenantSessionAuth = Either<SessionContext<WorkOsSession>, TenantSessionAuth>;

impl AnyTenantSessionAuth {
    /// The different types of session auths have very different purposes, so we have to do some
    /// branching to extract the tenant_user_id
    fn tenant_user_id(self) -> ApiResult<TenantUserId> {
        let tu_id = match self {
            // WorkOsSessions are only used for selecting an org, just pull out the tenant_user_id
            Either::Left(l) => l.data.tenant_user_id,
            // For any other session token, validate it has Any permission and then extract the user actor
            Either::Right(r) => {
                let r = r.check_guard(Any)?;
                match r.actor() {
                    AuthActor::TenantUser(tu_id) | AuthActor::FirmEmployee(tu_id) => tu_id,
                    _ => return Err(TenantError::ValidationError("Non-user principal".to_owned()).into()),
                }
            }
        };
        Ok(tu_id)
    }
}

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
    let tu_id = tenant_auth.clone().tenant_user_id()?;

    let ((tenant_user, rb, tenant_role, tenant), _) = state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::login(conn, (&tu_id, &tenant_id)))
        .await?;
    let session_data = AuthSessionData::TenantRb(rb.clone().into());

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
