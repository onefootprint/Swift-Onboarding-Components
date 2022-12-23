use std::collections::HashSet;

use crate::auth::session::AuthSessionData;
use crate::errors::tenant::TenantError;
use crate::errors::workos_login::WorkOsLoginError;
use crate::errors::ApiResult;
use crate::utils::email_domain;
use crate::utils::session::AuthSession;
use crate::State;
use crate::{errors::ApiError, types::response::ResponseData};
use chrono::Duration;
use db::models::tenant::{NewTenant, Tenant};
use db::models::tenant_role::TenantRole;
use db::models::tenant_user::TenantUser;
use db::tenant::get_opt_by_workos_org_id;
use newtypes::{SessionAuthToken, TenantUserId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use workos::organizations::{
    CreateOrganization, CreateOrganizationParams, DomainFilters, ListOrganizations, ListOrganizationsParams,
};
use workos::sso::{
    AuthorizationCode, ClientId, GetProfileAndToken, GetProfileAndTokenParams, GetProfileAndTokenResponse,
    Profile,
};

#[derive(serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct Code {
    code: String,
}

#[derive(serde::Serialize, Apiv2Schema)]
struct DashboardAuthorizationResponse {
    email: String,
    auth: SessionAuthToken,
    first_name: Option<String>,
    last_name: Option<String>,
    created_new_tenant: bool,
    tenant_name: String,
    sandbox_restricted: bool,
    requires_onboarding: bool,
}

#[api_v2_operation(
    tags(Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future requests as well as user information"
)]
#[post("/org/auth/login")]
async fn handler(
    state: web::Data<State>,
    code: web::Json<Code>,
) -> actix_web::Result<Json<ResponseData<DashboardAuthorizationResponse>>, ApiError> {
    let code = &code.code;

    let GetProfileAndTokenResponse { profile, .. } = &state
        .workos_client
        .sso()
        .get_profile_and_token(&GetProfileAndTokenParams {
            client_id: &ClientId::from(state.config.workos_client_id.as_str()),
            code: &AuthorizationCode::from(code.to_owned()),
        })
        .await?;
    tracing::info!(profile =?profile, "workos login");

    // First, get all matching tenant users.
    let email = profile.email.clone();
    let matching_tenant_users = state
        .db_pool
        .db_query(move |conn| TenantUser::list_by_email(conn, email.into()))
        .await??;

    let (matching_tenant_users, is_new_tenant) = if !matching_tenant_users.is_empty() {
        (matching_tenant_users, false)
    } else {
        // If there are no users with this email, make a new one.
        // The new user will be associated with the tenant that owns the email address's domain OR
        // with a brand new tenant named after the user's email
        let (tenant_user_id, is_new_tenant) = create_tenant_user(&state, profile).await?;
        (vec![tenant_user_id], is_new_tenant)
    };

    // TODO one day support multiple TenantUsers (if you have been invited to another tenant)
    let tenant_user_id = matching_tenant_users
        .into_iter()
        .next()
        .ok_or(TenantError::TenantUserDoesNotExist)?;

    // Log into the user, updating the last_login_at and name (if new)
    let first_name = profile.first_name.clone();
    let last_name = profile.last_name.clone();
    let (tenant_user, tenant_role, tenant) = state
        .db_pool
        .db_transaction(move |conn| TenantUser::login_by_id(conn, &tenant_user_id, first_name, last_name))
        .await?;

    // Save tenant login in session data into the DB
    let session_data = AuthSessionData::WorkOs(tenant_user.clone().into());
    let auth_token = AuthSession::create(&state, session_data, Duration::hours(8)).await?;

    let requires_onboarding =
        tenant_role.permissions.is_admin() && (tenant.website_url.is_none() || tenant.company_size.is_none());

    Ok(Json(ResponseData {
        data: DashboardAuthorizationResponse {
            email: tenant_user.email.0,
            auth: auth_token,
            first_name: tenant_user.first_name,
            last_name: tenant_user.last_name,
            created_new_tenant: is_new_tenant,
            tenant_name: tenant.name,
            sandbox_restricted: tenant.sandbox_restricted,
            requires_onboarding,
        },
    }))
}

type IsNewTenant = bool;

async fn create_tenant_user(state: &State, profile: &Profile) -> ApiResult<(TenantUserId, IsNewTenant)> {
    // Otherwise, find or create the tenant and create a new TenantUser
    let (tenant, is_new_tenant) = find_or_create_tenant(state, profile).await?;
    let first_name = profile.first_name.clone();
    let last_name = profile.last_name.clone();
    let email = profile.email.clone();
    let tenant_id = tenant.id.clone();
    let tenant_user = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Get or create the admin role for this tenant
            // TODO: we shouldn't always give a new user admin permissions
            let admin_role = TenantRole::get_or_create_admin_role(conn, tenant_id)?;
            let (tenant_user, _) = TenantUser::create(
                conn,
                email.into(),
                admin_role.tenant_id,
                admin_role.id,
                first_name,
                last_name,
            )?;
            Ok(tenant_user)
        })
        .await?;
    // Only give the TenantUserId here to make sure we log into the tenant
    Ok((tenant_user.id, is_new_tenant))
}

async fn find_or_create_tenant(state: &State, profile: &Profile) -> Result<(Tenant, IsNewTenant), ApiError> {
    // 1. try get tenant by workos org id returned from profile
    // This will only ever really happen with SAML/SSO
    if let Some(org_id) = &profile.organization_id {
        let tenant = get_opt_by_workos_org_id(&state.db_pool, org_id.to_string())
            .await?
            .ok_or(WorkOsLoginError::TenantForOrgDoesNotExist)?;

        tracing::info!("matched workos auth by org id");
        // TODO use a role inferred from the user's groups on workos when we create the user locally
        return Ok((tenant, false));
    }

    let (new_tenant_name, new_tenant_workos_org_id) = if let Some(domain) =
        email_domain::parse_private_email_domain(profile.email.as_str())
    {
        // 2. The domain for the user's email is private - see if we have a workos org that owns the domain.
        let orgs = state
            .workos_client
            .organizations()
            .list_organizations(&ListOrganizationsParams {
                domains: Some(DomainFilters::from(vec![domain.as_str()])),
                ..Default::default()
            })
            .await?;
        if orgs.data.len() > 1 {
            // NOTE: there should only be 1 tenant returned as 1 domain supplied above
            return Err(ApiError::WorkOsApiError(
                "Invariant broken: multiple orgs for 1 domain returned".into(),
            ));
        }

        let workos_org_id = if let Some(org) = orgs.data.first() {
            // An org on workos owns this domain!
            let tenant = get_opt_by_workos_org_id(&state.db_pool, org.id.to_string()).await?;
            if let Some(tenant) = tenant {
                // The tenant exists inside the DB
                tracing::info!("matched workos auth by domain");
                // TODO use a basic role with minimal permissions instead of the admin role
                return Ok((tenant, false));
            } else {
                // Tenant doesn't exist in the DB. This will only happen when, say, creating a local
                // of the tenant owning a domain since we share workos across environments.
                tracing::warn!("WARNING! failed to match workos by org id in the database so creating a new tenant! This is expected only for testing purposes.");
                Some(org.id.clone())
            }
        } else {
            // Workos has no record of an org that owns this domain
            None
        };

        // Couldn't find a tenant with this domain, move forward to create a new tenant named after
        // the email's domain
        (domain, workos_org_id)
    } else {
        // The domain is public, like gmail.com - doesn't make sense to look up a workos org that owns the domain
        (profile.email.clone(), None)
    };

    // 3. finally, create a workos organization for our new user
    let org_id = if let Some(org_id) = new_tenant_workos_org_id {
        org_id
    } else {
        let org = state
            .workos_client
            .organizations()
            .create_organization(&CreateOrganizationParams {
                name: &new_tenant_name,
                allow_profiles_outside_organization: Some(&true),
                domains: HashSet::new(),
            })
            .await?;
        org.id
    };

    tracing::info!("did not match workos login, creating new tenant");
    let tenant = create_tenant(state, new_tenant_name, Some(org_id.to_string()), true).await?;
    Ok((tenant, true))
}

async fn create_tenant(
    state: &State,
    tenant_name: String,
    workos_org_id: Option<String>,
    sandbox_restricted: bool,
) -> Result<Tenant, ApiError> {
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;

    let new_tenant = NewTenant {
        name: tenant_name,
        e_private_key: e_priv_key,
        public_key: ec_pk_uncompressed,
        workos_id: workos_org_id,
        logo_url: None,
        sandbox_restricted,
    };
    let result = state
        .db_pool
        .db_query(move |conn| Tenant::save(conn, new_tenant))
        .await??;

    Ok(result)
}
