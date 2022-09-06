use std::collections::HashSet;

use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::session_data::AuthSessionData;
use crate::errors::workos_login::WorkOsLoginError;
use crate::utils::email_domain;
use crate::utils::session::AuthSession;
use crate::State;
use crate::{errors::ApiError, types::response::ApiResponseData};
use chrono::Duration;
use db::models::tenant::{NewTenant, Tenant};
use db::tenant::{get_opt_by_workos_org_id, get_opt_by_workos_profile_id};
use newtypes::SessionAuthToken;
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
}

#[api_v2_operation(
    summary = "/org/auth/login",
    tags(Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future requests as well as user information"
)]
#[post("/login")]
async fn handler(
    state: web::Data<State>,
    code: web::Json<Code>,
) -> actix_web::Result<Json<ApiResponseData<DashboardAuthorizationResponse>>, ApiError> {
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

    let (tenant, is_new) = find_or_create_tenant(&state, profile).await?;

    // Save tenant login in session data into the DB
    let session_data = AuthSessionData::WorkOs(WorkOsSession {
        email: profile.email.clone(),
        first_name: profile.first_name.clone(),
        last_name: profile.last_name.clone(),
        tenant_id: tenant.id,
    });
    let auth_token = AuthSession::create(&state, session_data, Duration::hours(8)).await?;

    Ok(Json(ApiResponseData {
        data: DashboardAuthorizationResponse {
            email: profile.email.clone(),
            auth: auth_token,
            first_name: profile.first_name.clone(),
            last_name: profile.last_name.clone(),
            created_new_tenant: is_new,
            tenant_name: tenant.name,
            sandbox_restricted: tenant.sandbox_restricted,
        },
    }))
}

type IsNewTenant = bool;

/// helper to find or create a tenant via workos and our database
async fn find_or_create_tenant(state: &State, profile: &Profile) -> Result<(Tenant, IsNewTenant), ApiError> {
    // 1. try get tenant by workos org id returned from profile
    if let Some(org_id) = &profile.organization_id {
        let tenant = get_opt_by_workos_org_id(&state.db_pool, org_id.to_string())
            .await?
            .ok_or(WorkOsLoginError::ProfileInvalid)?;

        tracing::info!("matched workos auth by org id");
        return Ok((tenant, false));
    }

    // 2. next, try to see if individual account by profile id
    if let Some(tenant) = get_opt_by_workos_profile_id(&state.db_pool, profile.id.to_string()).await? {
        tracing::info!("matched workos auth by profile id");
        return Ok((tenant, false));
    }

    // prepare a name if we need to create a new tenant;
    let mut tenant_name = profile.email.to_string();

    // 3. check the domain of the user, and see if we have a matching organization id here
    if let Some(domain) = email_domain::parse_private_email_domain(profile.email.as_str()) {
        // finally, try to match by email domain
        let orgs = state
            .workos_client
            .organizations()
            .list_organizations(&ListOrganizationsParams {
                domains: Some(DomainFilters::from(vec![domain.as_str()])),
                ..Default::default()
            })
            .await?;

        // NOTE: there should only be 1 tenant returned as 1 domain supplied above
        if orgs.data.len() > 1 {
            return Err(ApiError::WorkOsApiError(
                "Invariant broken: multiple orgs for 1 domain returned".into(),
            ));
        }

        // Use the matched org by domain to load the tenant otherwise
        if let Some(org) = orgs.data.first() {
            let tenant = get_opt_by_workos_org_id(&state.db_pool, org.id.to_string()).await?;

            if let Some(tenant) = tenant {
                tracing::info!("matched workos auth by domain");
                return Ok((tenant, false));
            } else {
                let tenant = create_tenant(state, domain, org.id.to_string(), None).await?;

                tracing::warn!("WARNING! failed to match workos by org id in the database so creating a new tenant! This is expected only for testing purposes.");

                return Ok((tenant, true));
            }
        }

        // best guess at initial customer name (domain name)
        tenant_name = domain.clone();
    }

    // 4. finally, create a workos organization for our new user
    let org = state
        .workos_client
        .organizations()
        .create_organization(&CreateOrganizationParams {
            name: &tenant_name,
            allow_profiles_outside_organization: Some(&true),
            domains: HashSet::new(),
        })
        .await?;

    tracing::info!("did not match workos login, creating new tenant");

    let tenant = create_tenant(
        state,
        tenant_name,
        org.id.to_string(),
        Some(profile.id.to_string()),
    )
    .await?;

    Ok((tenant, true))
}

async fn create_tenant(
    state: &State,
    tenant_name: String,
    workos_org_id: String,
    workos_profile_id: Option<String>,
) -> Result<Tenant, ApiError> {
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;

    // create a tenant
    let tenant = NewTenant {
        name: tenant_name,
        e_private_key: e_priv_key,
        public_key: ec_pk_uncompressed,
        workos_id: Some(workos_org_id),
        workos_admin_profile_id: workos_profile_id,
        logo_url: None,
        sandbox_restricted: true,
    }
    .create(&state.db_pool)
    .await?;

    Ok(tenant)
}
