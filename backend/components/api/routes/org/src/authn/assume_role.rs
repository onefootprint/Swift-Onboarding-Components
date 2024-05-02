use api_core::{
    auth::{
        session::{tenant::TenantRbSession, AuthSessionData, GetSessionForUpdate},
        tenant::{AnyOrgSessionAuth, AnyTenantSessionAuth},
    },
    errors::{ApiError, ApiResult, AssertionError},
    types::response::ResponseData,
    utils::{db2api::DbToApi, session::AuthSession},
    State,
};
use api_wire_types::{AssumeRoleRequest, AssumeRoleResponse, Organization, OrganizationMember};
use db::{
    helpers::TenantOrPartnerTenant,
    models::tenant_rolebinding::{TenantRbLoginResult, TenantRolebinding},
};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

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
