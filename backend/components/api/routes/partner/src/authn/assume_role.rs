use api_core::{
    auth::{
        session::{tenant::TenantRbSession, GetSessionForUpdate},
        tenant::{AnyOrgSessionAuth, AnyPartnerTenantSessionAuth},
    },
    errors::{ApiError, ApiResult, AssertionError},
    types::response::ResponseData,
    utils::{db2api::DbToApi, session::AuthSession},
    State,
};
use api_wire_types::{
    AssumePartnerRoleRequest, AssumePartnerRoleResponse, OrganizationMember, PartnerOrganization,
};
use db::{helpers::TenantOrPartnerTenant, models::tenant_rolebinding::TenantRolebinding};
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    description = "After the user has proven they own an email address, allow them to assume an
    auth role for any partner tenant to which the email address has access.",
    tags(Auth, Private)
)]
#[post("/partner/auth/assume_role")]
fn post(
    state: web::Data<State>,
    request: Json<AssumePartnerRoleRequest>,
    pt_auth: AnyPartnerTenantSessionAuth,
) -> actix_web::Result<Json<ResponseData<AssumePartnerRoleResponse>>, ApiError> {
    let AssumePartnerRoleRequest { partner_tenant_id } = request.into_inner();
    let auth_method = pt_auth.auth_method();
    let tu_id = pt_auth.clone().tenant_user_id()?;

    let ((tenant_user, rb, tenant_role, t_pt), _) = state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::login(conn, (&tu_id, &partner_tenant_id), auth_method))
        .await?;

    let tenant = match t_pt {
        TenantOrPartnerTenant::PartnerTenant(pt) => pt,
        TenantOrPartnerTenant::Tenant(_) => {
            return Err(AssertionError("expected partner tenant, found tenant").into());
        }
    };

    let session_data = TenantRbSession::create(rb.id.clone(), auth_method).into();
    let session_sealing_key = state.session_sealing_key.clone();
    let expires_at = pt_auth.session().expires_at;
    let token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // The new token will expire at the same time as the existing token to prevent allowing
            // perpetually re-creating a new token for yourself
            let (token, _) = AuthSession::create_sync(conn, &session_sealing_key, session_data, expires_at)?;
            Ok(token)
        })
        .await?;

    let data = AssumePartnerRoleResponse {
        token,
        user: OrganizationMember::from_db((tenant_user, rb, tenant_role)),
        partner_tenant: PartnerOrganization::from_db(tenant),
    };
    ResponseData::ok(data).json()
}
