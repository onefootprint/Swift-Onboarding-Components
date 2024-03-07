use std::str::FromStr;

use crate::{
    auth::session::AuthSessionData,
    errors::{tenant::TenantError, workos::WorkOsError, ApiError, ApiResult},
    types::response::ResponseData,
    utils::{db2api::DbToApi, email_domain, session::AuthSession},
    State,
};
use api_core::auth::session::tenant::{TenantRbSession, WorkOsSession};
use api_wire_types::{OrgLoginRequest, OrgLoginResponse, Organization, OrganizationMember};
use chrono::Duration;
use db::models::{
    tenant::{NewTenant, Tenant},
    tenant_rolebinding::TenantRolebinding,
    tenant_user::TenantUser,
};
use newtypes::{OrgMemberEmail, TenantScope, WorkosAuthMethod};
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use workos::{
    sso::{
        AuthorizationCode, ClientId, ConnectionType, GetProfileAndToken, GetProfileAndTokenParams,
        GetProfileAndTokenResponse, Profile,
    },
    KnownOrUnknown,
};

fn get_auth_method(connection_type: &KnownOrUnknown<ConnectionType, String>) -> ApiResult<WorkosAuthMethod> {
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

#[api_v2_operation(
    tags(Auth, Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future requests as well as user information"
)]
#[post("/org/auth/login")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<OrgLoginRequest>,
) -> actix_web::Result<Json<ResponseData<OrgLoginResponse>>, ApiError> {
    let OrgLoginRequest { code, request_org_id } = request.into_inner();

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
    // Get all tenant rolebindings associated with this user
    //

    let (user, matching_rolebindings) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let email = OrgMemberEmail::from_str(&profile2.email)?;
            // Get or create tenant user
            let user =
                TenantUser::get_and_update_or_create(conn, email, profile2.first_name, profile2.last_name)?;
            let matching_rolebindings = TenantRolebinding::list_by_user(conn, &user.id)?;
            Ok((user, matching_rolebindings))
        })
        .await?;

    //
    // Create a new tenant if there are no rolebindings
    //

    let (matching_rolebindings, created_new_tenant) = if !matching_rolebindings.is_empty() {
        (matching_rolebindings, false)
    } else if request_org_id.is_none() {
        let (tenant, created_new_tenant) = find_or_create_tenant(&state, profile).await?;
        // If there are no rolebindings for this user, make one.
        // The new user will be associated with the tenant that owns the email address's domain OR
        // with a brand new tenant named after the user's email
        let user_id = user.id.clone();
        let tenant_id = tenant.id.clone();
        let rb = state
            .db_pool
            .db_transaction(move |conn| TenantRolebinding::create_for_login(conn, user_id, &tenant_id))
            .await?;
        (vec![(rb, tenant)], created_new_tenant)
    } else {
        (vec![], false)
    };

    //
    // Determine if there's only one rolebinding to log into
    //

    let single_rb = if let Some(org_id) = request_org_id {
        // If a specific tenant ID was requested, only log into that tenant
        matching_rolebindings
            .into_iter()
            .find(|(_, tenant)| tenant.id == org_id)
            .map(|(rb, _)| rb)
    } else {
        // If there's only one rolebinding for this user, log into it
        (matching_rolebindings.len() == 1)
            .then_some(matching_rolebindings.into_iter().next())
            .flatten()
            .map(|(rb, _)| rb)
    };

    //
    // Compose the with a token that has either logged into the single rolebinding OR with a token
    // that allows selecting amongst a list of available rolebindings
    //

    let data = if let Some(rb) = single_rb {
        // Log into the single user, updating the last_login_at and name (if new)
        let ((tenant_user, rb, tenant_role, tenant), is_first_login) = state
            .db_pool
            .db_transaction(move |conn| TenantRolebinding::login(conn, &rb.id))
            .await?;

        let session = TenantRbSession::create(&tenant, rb.id.clone(), auth_method)?.into();
        let auth_token = AuthSession::create(&state, session, Duration::days(5)).await?;
        let requires_onboarding = tenant_role.scopes.contains(&TenantScope::Admin)
            && (tenant.website_url.is_none() || tenant.company_size.is_none());
        OrgLoginResponse {
            auth_token,
            created_new_tenant,
            is_first_login,
            requires_onboarding,
            user: Some(OrganizationMember::from_db((tenant_user, rb, tenant_role))),
            tenant: Some(Organization::from_db(tenant)),
        }
    } else {
        // If not exactly one rolebinding, create a WorkOsSession that just shows the email that
        // was proven to be owned. This lets the user choose which tenant they'd like to log into
        let session = AuthSessionData::WorkOs(WorkOsSession {
            tenant_user_id: user.id,
            auth_method,
        });
        let auth_token = AuthSession::create(&state, session, Duration::days(5)).await?;
        // Save tenant login in session data into the DB
        OrgLoginResponse {
            auth_token,
            created_new_tenant,
            is_first_login: false,
            requires_onboarding: false,
            user: None,
            tenant: None,
        }
    };
    ResponseData { data }.json()
}

type IsNewTenant = bool;
async fn find_or_create_tenant(state: &State, profile: &Profile) -> Result<(Tenant, IsNewTenant), ApiError> {
    // process domain
    let domain = email_domain::parse_private_email_domain(profile.email.as_str());

    let domain2 = domain.clone();
    if let Some(domain) = domain2 {
        // Check if tenant exists. If so, automatically add new tenant user
        let tenant = state
            .db_pool
            .db_query(move |conn| Tenant::get_tenant_by_domains(conn, vec![domain]))
            .await?;
        if let Some(tenant) = tenant {
            return Ok((tenant, false));
        }
    };

    // create new tenant in the case of public email tenant user or existing private tenant with allow_domain_access = false
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
        is_prod_ob_config_restricted: true,
        is_prod_kyb_playbook_restricted: true,
        is_prod_auth_playbook_restricted: true,
        domains: domain.into_iter().collect(),
        allow_domain_access: false, // false by default on creation, has to become true manually with PATCH /org
    };
    let tenant = state
        .db_pool
        .db_transaction(move |conn| Tenant::create(conn, new_tenant))
        .await?;
    Ok((tenant, true))
}
