use crate::State;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::auth::session::tenant::TenantRbSession;
use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::types::ApiResponse;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use chrono::Duration;
use crypto::random::gen_random_alphanumeric_code;
use db::models::partner_tenant::NewPartnerTenant;
use db::models::partner_tenant::PartnerTenant;
use db::models::tenant::NewTenant;
use db::models::tenant::Tenant;
use db::models::tenant_compliance_partnership::NewTenantCompliancePartnership;
use db::models::tenant_role::ImmutableRoleKind;
use db::models::tenant_role::IsImmutable;
use db::models::tenant_role::TenantRole;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use newtypes::PartnerTenantId;
use newtypes::SessionAuthToken;
use newtypes::TenantCompliancePartnershipId;
use newtypes::TenantId;
use newtypes::TenantRoleKind;
use newtypes::TenantScope;
use newtypes::TenantSessionPurpose;
use newtypes::TenantUserId;
use newtypes::WorkosAuthMethod;
use serde::Deserialize;
use serde::Serialize;

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
struct CreatePartnerDemoRequest {
    partner_tenant_name: String,
    partner_tenant_user_names: Vec<(String, String)>,
    tenants: Vec<TenantSpec>,
}

#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
struct TenantSpec {
    name: String,
    user_names: Vec<(String, String)>,
}

#[derive(Serialize, macros::JsonResponder)]
#[serde(rename_all = "snake_case")]
struct CreatePartnerDemoResponse {
    partner_tenant_id: PartnerTenantId,
    partner_tenant_users: Vec<DemoUser>,
    tenants: Vec<DemoTenant>,
}

#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
struct DemoTenant {
    id: TenantId,
    name: String,
    partnership_id: TenantCompliancePartnershipId,
    users: Vec<DemoUser>,
}

#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
struct DemoUser {
    id: TenantUserId,
    token: SessionAuthToken,
}

#[post("/private/partner_demo")]
pub async fn post(
    state: web::Data<State>,
    request: Json<CreatePartnerDemoRequest>,
    auth: FirmEmployeeAuthContext,
) -> ApiResponse<CreatePartnerDemoResponse> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;
    let employee_user_id = auth.tenant_user.id.clone();

    let session_sealing_key = state.session_sealing_key.clone();

    let CreatePartnerDemoRequest {
        partner_tenant_name,
        partner_tenant_user_names,
        tenants: tenant_specs,
    } = request.into_inner();

    let mut tenant_keys = vec![];
    for _ in &tenant_specs {
        tenant_keys.push(state.enclave_client.generate_sealed_keypair().await?);
    }

    let (pt_public_key, pt_e_private_key) = state.enclave_client.generate_sealed_keypair().await?;

    let (pt_id, partner_tenant_users, demo_tenants) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let pt = PartnerTenant::create(
                conn,
                NewPartnerTenant {
                    name: partner_tenant_name.to_owned(),
                    public_key: pt_public_key,
                    e_private_key: pt_e_private_key,
                    supported_auth_methods: None,
                    domains: vec![],
                    allow_domain_access: false,
                    logo_url: None,
                    website_url: None,
                },
            )?;

            let admin_role = TenantRole::get_immutable(
                conn,
                &pt.id,
                ImmutableRoleKind::CompliancePartnerAdmin,
                TenantRoleKind::CompliancePartnerDashboardUser,
            )?;
            TenantRolebinding::create(conn, employee_user_id, admin_role.id, &pt.id)?;

            let manager_role = TenantRole::create(
                conn,
                &pt.id,
                "Compliance Manager",
                vec![
                    TenantScope::CompliancePartnerRead,
                    TenantScope::CompliancePartnerManageTemplates,
                    TenantScope::CompliancePartnerManageReviews,
                ],
                false as IsImmutable,
                TenantRoleKind::CompliancePartnerDashboardUser,
            )?;

            // Create partner users and mint short-lived sessions.
            let partner_tenant_users = partner_tenant_user_names
                .into_iter()
                .map(|(first, last)| -> FpResult<_> {
                    let email = format!(
                        "{}.{}@compliance-automation-demo-email-{}.onefootprint.com",
                        &first,
                        &last,
                        gen_random_alphanumeric_code(16),
                    );
                    let user =
                        TenantUser::get_and_update_or_create(conn, email.parse()?, Some(first), Some(last))?;

                    let (manager_rb, _) =
                        TenantRolebinding::create(conn, user.id.clone(), manager_role.id.clone(), &pt.id)?;
                    let login_result =
                        TenantRolebinding::login(conn, &manager_rb.id, WorkosAuthMethod::MagicLink)?;
                    let session = TenantRbSession::create(&login_result, TenantSessionPurpose::Dashboard);
                    let (auth_token, _) =
                        AuthSession::create_sync(conn, &session_sealing_key, session, Duration::minutes(1))?;

                    Ok(DemoUser {
                        id: user.id,
                        token: auth_token,
                    })
                })
                .collect::<FpResult<Vec<_>>>()?;

            let mut demo_tenants = vec![];
            for (tenant_spec, (public_key, e_private_key)) in tenant_specs.into_iter().zip(tenant_keys) {
                let tenant = Tenant::create(
                    conn,
                    NewTenant {
                        name: tenant_spec.name.to_owned(),
                        e_private_key,
                        public_key,
                        workos_id: None,
                        logo_url: None,
                        sandbox_restricted: false,
                        is_demo_tenant: true,
                        is_prod_ob_config_restricted: false,
                        is_prod_kyb_playbook_restricted: true,
                        is_prod_auth_playbook_restricted: true,
                        domains: vec![],
                        allow_domain_access: false,
                        super_tenant_id: None,
                    },
                )?;

                let (np, _) = NewTenantCompliancePartnership {
                    tenant_id: &tenant.id,
                    partner_tenant_id: &pt.id,
                }
                .get_or_create(conn)?;

                let admin_role = TenantRole::get_immutable(
                    conn,
                    &tenant.id,
                    ImmutableRoleKind::Admin,
                    TenantRoleKind::DashboardUser,
                )?;

                // Create tenant users and mint short-lived sessions.
                let users = tenant_spec
                    .user_names
                    .into_iter()
                    .map(|(first, last)| -> FpResult<_> {
                        let email = format!(
                            "{}.{}@compliance-automation-demo-email-{}.onefootprint.com",
                            &first,
                            &last,
                            gen_random_alphanumeric_code(16),
                        );
                        let user = TenantUser::get_and_update_or_create(
                            conn,
                            email.parse()?,
                            Some(first),
                            Some(last),
                        )?;

                        let (admin_rb, _) = TenantRolebinding::create(
                            conn,
                            user.id.clone(),
                            admin_role.id.clone(),
                            &tenant.id,
                        )?;
                        let login_result =
                            TenantRolebinding::login(conn, &admin_rb.id, WorkosAuthMethod::MagicLink)?;
                        let session = TenantRbSession::create(&login_result, TenantSessionPurpose::Dashboard);
                        let (auth_token, _) = AuthSession::create_sync(
                            conn,
                            &session_sealing_key,
                            session,
                            Duration::minutes(1),
                        )?;

                        Ok(DemoUser {
                            id: user.id,
                            token: auth_token,
                        })
                    })
                    .collect::<FpResult<Vec<_>>>()?;

                demo_tenants.push(DemoTenant {
                    id: tenant.id,
                    name: tenant_spec.name.to_owned(),
                    partnership_id: np.id,
                    users,
                });
            }

            Ok((pt.id, partner_tenant_users, demo_tenants))
        })
        .await?;

    Ok(CreatePartnerDemoResponse {
        partner_tenant_id: pt_id,
        partner_tenant_users,
        tenants: demo_tenants,
    })
}
