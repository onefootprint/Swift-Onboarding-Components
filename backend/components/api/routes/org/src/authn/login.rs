use std::collections::HashSet;
use std::str::FromStr;

use crate::auth::session::AuthSessionData;
use crate::errors::tenant::TenantError;
use crate::errors::workos::WorkOsError;
use crate::errors::ApiResult;
use crate::utils::db2api::DbToApi;
use crate::utils::email_domain;
use crate::utils::session::AuthSession;
use crate::State;
use crate::{errors::ApiError, types::response::ResponseData};
use api_core::auth::session::tenant::WorkOsSession;
use api_wire_types::{OrgLoginRequest, OrgLoginResponse};
use api_wire_types::{Organization, OrganizationMember};
use chrono::Duration;
use db::models::tenant::{NewTenant, Tenant};
use db::models::tenant_role::{ImmutableRoleKind, TenantRole};
use db::models::tenant_rolebinding::{TenantRolebinding, TenantRolebindingFilters};
use db::models::tenant_user::TenantUser;
use db::OffsetPagination;
use itertools::Itertools;
use newtypes::{OrgMemberEmail, TenantRolebindingId, TenantScope, TenantUserId};
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use workos::organizations::{
    CreateOrganization, CreateOrganizationParams, DomainFilters, ListOrganizations, ListOrganizationsParams,
};
use workos::sso::{
    AuthorizationCode, ClientId, GetProfileAndToken, GetProfileAndTokenParams, GetProfileAndTokenResponse,
    Profile,
};

#[api_v2_operation(
    tags(Private),
    description = "Called from the front-end with the WorkOS code. Returns the authorization \
    token needed for future requests as well as user information"
)]
#[post("/org/auth/login")]
async fn handler(
    state: web::Data<State>,
    request: web::Json<OrgLoginRequest>,
) -> actix_web::Result<Json<ResponseData<OrgLoginResponse>>, ApiError> {
    let code = request.into_inner().code;

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
    // First, get all matching tenant rolebindings.
    let (user, matching_rolebindings) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let email = OrgMemberEmail::from_str(&profile2.email)?;
            let user =
                TenantUser::get_and_update_or_create(conn, email, profile2.first_name, profile2.last_name)?;
            let matching_rolebindings = TenantRolebinding::list_by_user(conn, &user.id)?;
            Ok((user, matching_rolebindings))
        })
        .await?;
    let matching_rolebindings = matching_rolebindings.into_iter().map(|(id, _)| id).collect_vec();

    let (matching_rolebindings, created_new_tenant) = if !matching_rolebindings.is_empty() {
        (matching_rolebindings, false)
    } else {
        // If there are no rolebindings for this user, make one.
        // The new user will be associated with the tenant that owns the email address's domain OR
        // with a brand new tenant named after the user's email
        let (rb_id, created_new_tenant) = create_tenant_rolebinding(&state, user.id.clone(), profile).await?;
        (vec![rb_id], created_new_tenant)
    };

    let (session, requires_onboarding, user, tenant, is_first_login) = if matching_rolebindings.len() == 1 {
        // If one rolebinding, log into it and create a TenantUser session
        let rolebinding_id = matching_rolebindings
            .into_iter()
            .next()
            .ok_or(TenantError::TenantUserDoesNotExist)?;

        // Log into the user, updating the last_login_at and name (if new)
        let ((tenant_user, rb, tenant_role, tenant), is_first_login) = state
            .db_pool
            .db_transaction(move |conn| TenantRolebinding::login(conn, &rolebinding_id))
            .await?;

        let session_data = AuthSessionData::TenantRb(rb.clone().into());

        let requires_onboarding = tenant_role.scopes.contains(&TenantScope::Admin)
            && (tenant.website_url.is_none() || tenant.company_size.is_none());
        let user = Some(OrganizationMember::from_db((tenant_user, rb, tenant_role)));
        let tenant = Some(Organization::from_db(tenant));
        (session_data, requires_onboarding, user, tenant, is_first_login)
    } else {
        // If multiple users, create a WorkOsSession that just shows the email that was proven to be owned.
        // This token lets the user choose which tenant they'd like to auth as. Only give them 10
        // mins to do so.
        // TODO one day support footprint firm employees
        let session_data = AuthSessionData::WorkOs(WorkOsSession {
            tenant_user_id: user.id,
        });
        (session_data, false, None, None, false)
    };
    // Save tenant login in session data into the DB
    let auth_token = AuthSession::create(&state, session, Duration::hours(8)).await?;
    let data = OrgLoginResponse {
        auth_token,
        created_new_tenant,
        is_first_login,
        requires_onboarding,
        user,
        tenant,
    };
    ResponseData { data }.json()
}

type IsNewTenant = bool;

async fn create_tenant_rolebinding(
    state: &State,
    user_id: TenantUserId,
    profile: &Profile,
) -> ApiResult<(TenantRolebindingId, IsNewTenant)> {
    // Otherwise, find or create the tenant and create a new TenantUser
    let (tenant, is_new_tenant) = find_or_create_tenant(state, profile).await?;
    let tenant_id = tenant.id.clone();
    let rb = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Get or create the default admin and read-only role for this tenant
            let admin_role = TenantRole::get_or_create_immutable(conn, &tenant.id, ImmutableRoleKind::Admin)?;
            let ro_role = TenantRole::get_or_create_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly)?;
            // If the tenant was just created and has no users, give the user admin perms.
            // Otherwise, read-only perms
            let filters = TenantRolebindingFilters {
                tenant_id: &tenant_id,
                only_active: false,
                role_ids: None,
                search: None,
                is_invite_pending: None,
            };
            let pagination = OffsetPagination::new(None, 1);
            let (users, _) = TenantRolebinding::list(conn, &filters, pagination)?;
            let are_no_users = users.is_empty();
            let role_id = if are_no_users { admin_role.id } else { ro_role.id };
            let (rb, _) = TenantRolebinding::create(conn, user_id, role_id, tenant_id)?;
            Ok(rb)
        })
        .await?;
    // Just give the ID - the caller will log into the rolebinding (and update last_login_at)
    Ok((rb.id, is_new_tenant))
}

async fn find_or_create_tenant(state: &State, profile: &Profile) -> Result<(Tenant, IsNewTenant), ApiError> {
    // 1. try get tenant by workos org id returned from profile
    // This will only ever really happen with SAML/SSO
    if let Some(org_id) = &profile.organization_id {
        let org_id = org_id.to_string();
        let tenant = state
            .db_pool
            .db_query(move |conn| Tenant::get_opt_by_workos_org_id(conn, &org_id))
            .await??
            .ok_or(WorkOsError::TenantForOrgDoesNotExist)?;

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
            .await
            .map_err(WorkOsError::from)?;
        if orgs.data.len() > 1 {
            // NOTE: there should only be 1 tenant returned as 1 domain supplied above
            return Err(WorkOsError::MultipleOrgsForDomain.into());
        }

        let workos_org_id = if let Some(org) = orgs.data.first() {
            // An org on workos owns this domain!
            let org_id = org.id.to_string();
            let tenant = state
                .db_pool
                .db_query(move |conn| Tenant::get_opt_by_workos_org_id(conn, &org_id))
                .await??;
            if let Some(tenant) = tenant {
                // The tenant exists inside the DB
                tracing::info!("matched workos auth by domain");
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
            .await
            .map_err(WorkOsError::from)?;
        org.id
    };

    tracing::info!("did not match workos login, creating new tenant");
    let tenant = create_tenant(state, new_tenant_name, Some(org_id.to_string())).await?;
    Ok((tenant, true))
}

async fn create_tenant(
    state: &State,
    tenant_name: String,
    workos_org_id: Option<String>,
) -> Result<Tenant, ApiError> {
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;

    let new_tenant = NewTenant {
        name: tenant_name,
        e_private_key: e_priv_key,
        public_key: ec_pk_uncompressed,
        workos_id: workos_org_id,
        logo_url: None,
        sandbox_restricted: true,
        is_prod_ob_config_restricted: true,
    };
    let result = state
        .db_pool
        .db_query(move |conn| Tenant::create(conn, new_tenant))
        .await??;

    Ok(result)
}
