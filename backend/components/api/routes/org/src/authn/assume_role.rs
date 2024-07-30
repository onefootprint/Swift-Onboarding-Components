use api_core::auth::session::tenant::TenantRbSession;
use api_core::auth::session::AuthSessionData;
use api_core::auth::session::GetSessionForUpdate;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Any;
use api_core::auth::AuthError;
use api_core::errors::AssertionError;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use api_wire_types::AssumeRoleRequest;
use api_wire_types::AssumeRoleResponse;
use api_wire_types::Organization;
use api_wire_types::OrganizationMember;
use db::helpers::TenantOrPartnerTenant;
use db::models::tenant_rolebinding::TenantRbLoginResult;
use db::models::tenant_rolebinding::TenantRolebinding;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    description = "After the user has proven they own an email address, allow them to assume an
    auth role for any tenant to which the email address has access.",
    tags(Auth, Private)
)]
#[post("/org/auth/assume_role")]
fn post(
    state: web::Data<State>,
    request: Json<AssumeRoleRequest>,
    auth: TenantSessionAuth,
) -> ApiResponse<AssumeRoleResponse> {
    let AssumeRoleRequest { tenant_id, purpose } = request.into_inner();
    let current_purpose = auth.purpose();
    let auth_method = auth.auth_method();
    let expires_at = auth.clone().session().expires_at;
    let auth = auth.check_guard(Any)?;
    let actor = auth.actor();
    let tu_id = actor.tenant_user_id()?.clone();

    if !current_purpose.allow_generating(purpose) {
        return Err(AuthError::AuthTokenPurposeRestricted.into());
    }

    let login_result = state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::login(conn, (&tu_id, &tenant_id), auth_method))
        .await?;
    let session_data: AuthSessionData = TenantRbSession::create(&login_result, purpose).into();
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
    let session_sealing_key = state.session_sealing_key.clone();
    let token = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
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
    Ok(data)
}
