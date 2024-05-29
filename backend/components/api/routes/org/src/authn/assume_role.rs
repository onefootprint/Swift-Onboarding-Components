use api_core::auth::session::tenant::TenantRbSession;
use api_core::auth::session::{
    AuthSessionData,
    GetSessionForUpdate,
};
use api_core::auth::tenant::{
    AnyOrgSessionAuth,
    AnyTenantSessionAuth,
};
use api_core::errors::{
    ApiError,
    ApiResult,
    AssertionError,
};
use api_core::types::response::ResponseData;
use api_core::utils::db2api::DbToApi;
use api_core::utils::session::AuthSession;
use api_core::State;
use api_wire_types::{
    AssumeRoleRequest,
    AssumeRoleResponse,
    Organization,
    OrganizationMember,
};
use db::helpers::TenantOrPartnerTenant;
use db::models::tenant_rolebinding::{
    TenantRbLoginResult,
    TenantRolebinding,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    description = "After the user has proven they own an email address, allow them to assume an
    auth role for any tenant to which the email address has access.",
    tags(Auth, Private)
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

    let login_result = state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::login(conn, (&tu_id, &tenant_id), auth_method))
        .await?;
    let session_data: AuthSessionData = TenantRbSession::create(&login_result).into();
    let TenantRbLoginResult {
        t_user,
        rb,
        role,
        t_pt,
        ..
    } = login_result;
    let tenant = match t_pt {
        TenantOrPartnerTenant::Tenant(tenant) => tenant,
        TenantOrPartnerTenant::PartnerTenant(_) => {
            return Err(AssertionError("expected tenant, found partner tenant").into());
        }
    };
    let expires_at = tenant_auth.session().expires_at;
    let session_sealing_key = state.session_sealing_key.clone();
    let token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // The new token will expire at the same time as the existing token to prevent allowing
            // perpetually re-creating a new token for yourself
            let (token, _) = AuthSession::create_sync(conn, &session_sealing_key, session_data, expires_at)?;
            Ok(token)
        })
        .await?;

    let data = AssumeRoleResponse {
        token,
        user: OrganizationMember::from_db((t_user, rb, role)),
        tenant: Organization::from_db(tenant),
    };
    ResponseData::ok(data).json()
}
