use api_core::auth::session::tenant::TenantRbSession;
use api_core::auth::session::GetSessionForUpdate;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::PartnerTenantSessionAuth;
use api_core::auth::Any;
use api_core::errors::AssertionError;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use api_wire_types::AssumePartnerRoleRequest;
use api_wire_types::AssumePartnerRoleResponse;
use api_wire_types::OrganizationMember;
use api_wire_types::PartnerOrganization;
use db::helpers::TenantOrPartnerTenant;
use db::models::tenant_rolebinding::TenantRbLoginResult;
use db::models::tenant_rolebinding::TenantRolebinding;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;

#[api_v2_operation(
    description = "After the user has proven they own an email address, allow them to assume an
    auth role for any partner tenant to which the email address has access.",
    tags(Auth, Private)
)]
#[post("/partner/auth/assume_role")]
fn post(
    state: web::Data<State>,
    request: Json<AssumePartnerRoleRequest>,
    pt_auth: PartnerTenantSessionAuth,
) -> ApiResponse<AssumePartnerRoleResponse> {
    let AssumePartnerRoleRequest { partner_tenant_id } = request.into_inner();
    let purpose = pt_auth.purpose();
    let auth_method = pt_auth.auth_method();
    let expires_at = pt_auth.clone().session().expires_at;
    let pt_auth = pt_auth.check_guard(Any)?;
    let actor = pt_auth.actor();
    let tu_id = actor.tenant_user_id()?.clone();

    let login_result = state
        .db_transaction(move |conn| TenantRolebinding::login(conn, (&tu_id, &partner_tenant_id), auth_method))
        .await?;

    let session_data = TenantRbSession::create(&login_result, purpose);
    let TenantRbLoginResult {
        t_user,
        rb,
        role,
        t_pt,
        ..
    } = login_result;
    let tenant = match t_pt {
        TenantOrPartnerTenant::PartnerTenant(pt) => pt,
        TenantOrPartnerTenant::Tenant(_) => {
            return Err(AssertionError("expected partner tenant, found tenant").into());
        }
    };
    let session_sealing_key = state.session_sealing_key.clone();
    let token = state
        .db_query(move |conn| -> FpResult<_> {
            // The new token will expire at the same time as the existing token to prevent allowing
            // perpetually re-creating a new token for yourself
            let (token, _) = AuthSession::create_sync(conn, &session_sealing_key, session_data, expires_at)?;
            Ok(token)
        })
        .await?;

    let data = AssumePartnerRoleResponse {
        token,
        user: OrganizationMember::from_db((t_user, rb, role)),
        partner_tenant: PartnerOrganization::from_db(tenant),
    };
    Ok(data)
}
