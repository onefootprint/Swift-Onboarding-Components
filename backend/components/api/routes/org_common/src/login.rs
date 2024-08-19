use actix_web::web;
use api_core::auth::session::tenant::TenantRbSession;
use api_core::errors::tenant::TenantError;
use api_core::errors::workos::WorkOsError;
use api_core::errors::AssertionError;
use api_core::utils::db2api::DbToApi;
use api_core::utils::email_domain;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use api_wire_types::OrgLoginResponse;
use api_wire_types::Organization;
use api_wire_types::OrganizationMember;
use api_wire_types::PartnerOrganization;
use chrono::Duration;
use db::helpers::TenantOrPartnerTenant;
use db::models::partner_tenant::NewPartnerTenant;
use db::models::partner_tenant::PartnerTenant;
use db::models::tenant::NewTenant;
use db::models::tenant::Tenant;
use db::models::tenant_rolebinding::TenantRbLoginResult;
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use newtypes::OrgIdentifier;
use newtypes::OrgMemberEmail;
use newtypes::TenantKind;
use newtypes::TenantScope;
use newtypes::TenantSessionPurpose;
use newtypes::WorkosAuthMethod;
use std::str::FromStr;
use workos::sso::AuthorizationCode;
use workos::sso::ClientId;
use workos::sso::ConnectionType;
use workos::sso::GetProfileAndToken;
use workos::sso::GetProfileAndTokenParams;
use workos::sso::GetProfileAndTokenResponse;
use workos::sso::Profile;
use workos::KnownOrUnknown;

fn get_auth_method(connection_type: &KnownOrUnknown<ConnectionType, String>) -> FpResult<WorkosAuthMethod> {
    // To protect against MagcicLink becoming a known type, check based on the string representation
    // of the connection type. Sadly, Display isn't implemented so have to check the serialization
    let connection_type = serde_json::ser::to_string(&connection_type)?;
    let result = match connection_type.as_ref() {
        "\"GoogleOAuth\"" => WorkosAuthMethod::GoogleOauth,
        "\"MagicLink\"" => WorkosAuthMethod::MagicLink,
        _ => return Err(TenantError::UnknownWorkosAuthMethod(connection_type).into()),
    };
    Ok(result)
}

pub async fn handle_login<T>(
    state: web::Data<State>,
    code: String,
    request_org_id: Option<T>,
    tenant_kind: TenantKind,
) -> FpResult<OrgLoginResponse>
where
    T: Into<OrgIdentifier>,
{
    let request_org_id: Option<OrgIdentifier> = request_org_id.map(|id| id.into());

    if let Some(request_org_id) = request_org_id.as_ref() {
        if tenant_kind != request_org_id.into() {
            return Err(TenantError::IncompatibleLoginTarget.into());
        }
    }

    let GetProfileAndTokenResponse { profile, .. } = &state
        .workos_client
        .sso()
        .get_profile_and_token(&GetProfileAndTokenParams {
            client_id: &ClientId::from(state.config.workos_client_id.as_str()),
            code: &AuthorizationCode::from(code),
        })
        .await
        .map_err(WorkOsError::from)?;
    tracing::info!(org_id =?profile.organization_id, id = ?profile.id, "workos login");

    let profile2 = profile.clone();
    let auth_method = get_auth_method(&profile.connection_type)?;

    //
    // Get all tenant rolebindings associated with this user and the given login target.
    //

    let (user, matching_rolebindings) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let email = OrgMemberEmail::from_str(&profile2.email)?;
            // Get or create tenant user
            let user =
                TenantUser::get_and_update_or_create(conn, email, profile2.first_name, profile2.last_name)?;
            let matching_rolebindings: Vec<_> = TenantRolebinding::list_by_user(conn, &user.id)?
                .into_iter()
                .filter(|(_, t_pt)| {
                    // Filter down to rolebindings that match the login target (e.g. partner tenant
                    // rolebindings for the partner dashboard).
                    let rb_kind: TenantKind = t_pt.into();
                    rb_kind == tenant_kind
                })
                .collect();
            Ok((user, matching_rolebindings))
        })
        .await?;

    //
    // Create a new tenant if there are no rolebindings
    //

    let (matching_rolebindings, created_new_tenant) = if !matching_rolebindings.is_empty() {
        (matching_rolebindings, false)
    } else if request_org_id.is_none() {
        let (t_pt, created_new_tenant): (TenantOrPartnerTenant, IsNewTenant) = match tenant_kind {
            TenantKind::Tenant => {
                let (tenant, created_new_tenant) = find_or_create_tenant(&state, profile).await?;
                (tenant.into(), created_new_tenant)
            }
            TenantKind::PartnerTenant => {
                let (partner_tenant, created_new_tenant) =
                    find_or_create_partner_tenant(&state, profile).await?;
                (partner_tenant.into(), created_new_tenant)
            }
        };

        // If there are no rolebindings for this user, make one.
        // The new user will be associated with the tenant that owns the email address's domain OR
        // with a brand new tenant named after the user's email
        let user_id = user.id.clone();
        let org_id = t_pt.id().clone_into();
        let rb = state
            .db_pool
            .db_transaction(move |conn| TenantRolebinding::create_for_login(conn, user_id, &org_id))
            .await?;
        (vec![(rb, t_pt)], created_new_tenant)
    } else {
        (vec![], false)
    };

    //
    // Log into the requested rolebinding, otherwise the most recently used rolebinding
    //

    let (is_missing_requested_org, requested_rb) = match request_org_id {
        Some(org_id) => {
            let matching_rb = matching_rolebindings
                .iter()
                .find(|(_, t_pt)| t_pt.id() == (&org_id).into())
                .cloned();
            (matching_rb.is_none(), matching_rb)
        }
        None => (false, None),
    };
    let most_recently_logged_into_rb = matching_rolebindings
        .into_iter()
        .max_by_key(|(rb, _)| (rb.last_login_at, rb.id.clone()));

    let (rb, t_pt) = requested_rb
        .or(most_recently_logged_into_rb)
        .ok_or(AssertionError("User has no roles to log into"))?;

    //
    // Compose the with a token that has either logged into the single rolebinding OR with a token
    // that allows selecting amongst a list of available rolebindings
    //

    let login_result = state
        .db_pool
        .db_transaction(move |conn| TenantRolebinding::login(conn, &rb.id, auth_method))
        .await?;

    let session = TenantRbSession::create(&login_result, TenantSessionPurpose::Dashboard);
    let auth_token = AuthSession::create(&state, session, Duration::days(5)).await?;

    let TenantRbLoginResult {
        t_user,
        rb,
        role,
        is_first_login,
        ..
    } = login_result;

    let requires_onboarding = match &t_pt {
        TenantOrPartnerTenant::Tenant(tenant) => {
            role.scopes.contains(&TenantScope::Admin)
                && (tenant.website_url.is_none() || tenant.company_size.is_none())
        }
        TenantOrPartnerTenant::PartnerTenant(_) => false,
    };

    let (tenant, partner_tenant) = match t_pt {
        TenantOrPartnerTenant::Tenant(tenant) => (Some(Organization::from_db(tenant)), None),
        TenantOrPartnerTenant::PartnerTenant(partner_tenant) => {
            (None, Some(PartnerOrganization::from_db(partner_tenant)))
        }
    };

    let resp = OrgLoginResponse {
        auth_token,
        created_new_tenant,
        is_first_login,
        requires_onboarding,
        user: OrganizationMember::from_db((t_user, rb, role)),
        tenant,
        partner_tenant,
        is_missing_requested_org,
    };

    Ok(resp)
}

type IsNewTenant = bool;
async fn find_or_create_tenant(state: &State, profile: &Profile) -> FpResult<(Tenant, IsNewTenant)> {
    // process domain
    let domain = email_domain::parse_private_email_domain(profile.email.as_str());

    if let Some(domain) = domain.as_ref() {
        // Check if tenant exists. If so, automatically add new tenant user
        let domain = domain.clone();
        let tenant = state
            .db_pool
            .db_query(move |conn| Tenant::get_tenant_by_domain(conn, &domain))
            .await?;
        if let Some(tenant) = tenant {
            return Ok((tenant, false));
        }
    };

    // create new tenant in the case of public email tenant user or existing private tenant with
    // allow_domain_access = false
    tracing::info!("Creating new tenant with domain {:?}", domain);
    let tenant_name = domain.clone().unwrap_or_else(|| profile.email.to_string());
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;
    let new_tenant = NewTenant {
        name: tenant_name,
        e_private_key: e_priv_key,
        public_key: ec_pk_uncompressed,
        workos_id: None,
        logo_url: None,
        sandbox_restricted: true,
        is_demo_tenant: false,
        is_prod_ob_config_restricted: true,
        is_prod_kyb_playbook_restricted: true,
        is_prod_auth_playbook_restricted: true,
        domains: domain.into_iter().collect(),
        // false by default on creation, has to become true manually with PATCH /org
        allow_domain_access: false,
        super_tenant_id: None,
        website_url: None,
        company_size: None,
    };
    let tenant = state
        .db_pool
        .db_transaction(move |conn| Tenant::create(conn, new_tenant))
        .await?;
    Ok((tenant, true))
}

async fn find_or_create_partner_tenant(
    state: &State,
    profile: &Profile,
) -> FpResult<(PartnerTenant, IsNewTenant)> {
    let domain = email_domain::parse_private_email_domain(profile.email.as_str());

    if let Some(domain) = domain.as_ref() {
        // Check if partner tenant already exists for user's domain. If so, automatically add new tenant
        // user.
        let domain = domain.clone();
        let tenant = state
            .db_pool
            .db_query(move |conn| PartnerTenant::get_by_domain(conn, domain.as_str()))
            .await?;
        if let Some(partner_tenant) = tenant {
            return Ok((partner_tenant, false));
        }
    };

    tracing::info!("Creating new partner tenant with domain {:?}", domain);
    let name = domain.clone().unwrap_or_else(|| profile.email.to_string());
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;

    let new_partner_tenant = NewPartnerTenant {
        name,
        public_key,
        e_private_key,
        supported_auth_methods: None,
        domains: domain.into_iter().collect(),
        allow_domain_access: false, // false by default on creation
        logo_url: None,
        website_url: None,
    };
    let partner_tenant = state
        .db_pool
        .db_transaction(move |conn| PartnerTenant::create(conn, new_partner_tenant))
        .await?;
    Ok((partner_tenant, true))
}
