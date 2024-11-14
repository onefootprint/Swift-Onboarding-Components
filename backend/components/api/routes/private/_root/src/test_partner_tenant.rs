use crate::State;
use actix_web::post;
use actix_web::web;
use api_core::auth::custodian::CustodianAuthContext;
use api_core::auth::session::tenant::TenantRbSession;
use api_core::errors::tenant::TenantError;
use api_core::types::ApiResponse;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_errors::FpDbOptionalExtension;
use chrono::Duration;
use db::models::partner_tenant::NewIntegrationTestPartnerTenant;
use db::models::partner_tenant::PartnerTenant;
use db::models::tenant_role::ImmutableRoleKind;
use db::models::tenant_role::TenantRole;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use newtypes::OrgMemberEmail;
use newtypes::PartnerTenantId;
use newtypes::SessionAuthToken;
use newtypes::TenantRoleKind;
use newtypes::TenantSessionPurpose;
use newtypes::WorkosAuthMethod;
use std::str::FromStr;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct NewClientRequest {
    /// Client-provided primary key of the partner tenant. Must start with a
    /// `_private_it_porg_` prefix.
    /// If a partner tenant with this ID already exists, it will be returned and assumed.
    /// Otherwise, we make a new partner tenant with this ID.
    id: PartnerTenantId,
    name: String,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
struct NewClientResponse {
    partner_tenant_id: PartnerTenantId,
    auth_token: SessionAuthToken,
    ro_auth_token: SessionAuthToken,
}

struct Result {
    partner_tenant: PartnerTenant,
    auth_token: SessionAuthToken,
    ro_auth_token: SessionAuthToken,
}

#[post("/private/test_partner_tenant")]
async fn post(
    request: web::Json<NewClientRequest>,
    _custodian: CustodianAuthContext,
    state: web::Data<State>,
) -> ApiResponse<NewClientResponse> {
    let NewClientRequest { id, name } = request.into_inner();
    if !id.is_integration_test_tenant() {
        // All integration testing partner tenant primary keys have a reserved prefix that signals
        // that the partner tenant is only to be used for integration tests. No organically-created
        // partner tenants have this prefix, so this protects integration tests from ever
        // inheriting credentials for a real partner tenant.
        return Err(TenantError::NotIntegrationTestTenant.into());
    }

    let key = state.session_sealing_key.clone();
    // This might not be used if we don't create a PartnerTenant, but have to generate them here
    // because they're async
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;

    let Result {
        partner_tenant,
        auth_token,
        ro_auth_token,
    } = state
        .db_transaction(move |conn| {
            //
            // Get or create the partner tenant
            //
            let partner_tenant = match PartnerTenant::lock(conn, &id).optional() {
                Ok(Some(t)) => t,
                Ok(None) => {
                    let new_partner_tenant = NewIntegrationTestPartnerTenant {
                        // Notably, we create the partner tenant with the ID as passed in. Next
                        // time the partner tenant is requested, it will already exist
                        id,
                        name,
                        public_key: ec_pk_uncompressed,
                        e_private_key: e_priv_key,
                        supported_auth_methods: None,
                        domains: vec![],
                        allow_domain_access: false,
                        logo_url: None,
                        website_url: None,
                    };
                    PartnerTenant::create(conn, new_partner_tenant)?
                }
                Err(e) => return Err(e),
            };

            //
            // Get or create the TenantUser
            //
            let mut create_auth_token = |email: &str, irk: ImmutableRoleKind| -> FpResult<SessionAuthToken> {
                let email = OrgMemberEmail::from_str(email)?;
                let first_name = Some("Footprint Compliance Partner".to_owned());
                let last_name = Some("Integration Testing".to_owned());
                let user = TenantUser::get_and_update_or_create(conn, email, first_name, last_name)?;
                let role = TenantRole::get_immutable(
                    conn,
                    &partner_tenant.id,
                    irk,
                    TenantRoleKind::CompliancePartnerDashboardUser,
                )?;
                let rb = match TenantRolebinding::get(conn, (&user.id, &partner_tenant.id)).optional() {
                    Ok(Some((_, rb, _, _))) => rb,
                    Ok(None) => {
                        let role_id = role.id.clone();
                        let (rb, _) = TenantRolebinding::create(conn, user.id, role_id, &partner_tenant.id)?;
                        rb
                    }
                    Err(e) => return Err(e),
                };
                // Create a new partner tenant RB session for the integration test tenant user
                let login_result = TenantRolebinding::login(conn, &rb.id, WorkosAuthMethod::GoogleOauth)?;
                let session_data = TenantRbSession::create(&login_result, TenantSessionPurpose::Dashboard);
                let (auth_token, _) =
                    AuthSession::create_sync(conn, &key, session_data, Duration::minutes(30))?;
                Ok(auth_token)
            };
            let auth_token = create_auth_token(
                OrgMemberEmail::INTEGRATION_TEST_USER_EMAIL,
                ImmutableRoleKind::CompliancePartnerAdmin,
            )?;
            let ro_auth_token = create_auth_token(
                OrgMemberEmail::INTEGRATION_TEST_RO_USER_EMAIL,
                ImmutableRoleKind::CompliancePartnerReadOnly,
            )?;

            let result = Result {
                partner_tenant,
                auth_token,
                ro_auth_token,
            };
            Ok(result)
        })
        .await?;

    let response = NewClientResponse {
        partner_tenant_id: partner_tenant.id,
        auth_token,
        ro_auth_token,
    };
    Ok(response)
}
