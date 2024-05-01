use std::str::FromStr;

use crate::State;
use actix_web::{post, web, web::Json};
use api_core::{
    auth::{custodian::CustodianAuthContext, session::tenant::TenantRbSession},
    errors::{tenant::TenantError, ApiError, ApiResult},
    types::response::ResponseData,
    utils::{db2api::DbToApi, session::AuthSession},
};
use chrono::Duration;
use db::models::{
    tenant::{NewIntegrationTestTenant, Tenant},
    tenant_api_key::TenantApiKey,
    tenant_role::{ImmutableRoleKind, TenantRole},
    tenant_rolebinding::TenantRolebinding,
    tenant_user::TenantUser,
};
use newtypes::{
    secret_api_key::SecretApiKey, OrgMemberEmail, SessionAuthToken, TenantId, TenantRoleKind,
    WorkosAuthMethod,
};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct NewClientRequest {
    /// Client-provided primary key of the tenant. Must start with a `_private_it_org_` prefix.
    /// If a tenant with this ID already exists, it will be returned and assumed.
    /// Otherwise, we make a new tenant with this ID.
    id: TenantId,
    name: String,
}

#[derive(Debug, Clone, serde::Serialize)]
struct NewClientResponse {
    org_id: TenantId,
    keys: Vec<api_wire_types::SecretApiKey>,
    auth_token: SessionAuthToken,
    ro_auth_token: SessionAuthToken,
}

struct Result {
    tenant: Tenant,
    api_keys: Vec<(TenantApiKey, TenantRole)>,
    auth_token: SessionAuthToken,
    ro_auth_token: SessionAuthToken,
}

#[post("/private/test_tenant")]
async fn post(
    request: web::Json<NewClientRequest>,
    _custodian: CustodianAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<NewClientResponse>>, ApiError> {
    let NewClientRequest { id, name } = request.into_inner();
    if !id.is_integration_test_tenant() {
        // All integration testing tenant primary keys have a reserved prefix that signals that the
        // tenant is only to be used for integration tests.
        // No organically-created tenants have this prefix, so this protects integration tests from
        // ever inheriting credentials for a real tenant.
        return Err(TenantError::NotIntegrationTestTenant.into());
    }

    let key = state.session_sealing_key.clone();
    // This might not be used if we don't create a Tenant or TenantApiKey, but have to generate them
    // here because they're async
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;
    let live_api_key = SecretApiKey::generate(true);
    let live_sh_api_key = live_api_key.fingerprint(state.as_ref()).await?;
    let sandbox_api_key = SecretApiKey::generate(false);
    let sandbox_sh_api_key = sandbox_api_key.fingerprint(state.as_ref()).await?;
    let api_keys = vec![
        (true, live_api_key, live_sh_api_key),
        (false, sandbox_api_key, sandbox_sh_api_key),
    ];

    let Result {
        tenant,
        api_keys,
        auth_token,
        ro_auth_token,
    } = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            //
            // Get or create the tenant
            //
            let tenant = match Tenant::lock(conn, &id) {
                Ok(t) => t,
                Err(e) => {
                    if !e.is_not_found() {
                        return Err(e.into()); // Real error, return
                    }
                    let new_tenant = NewIntegrationTestTenant {
                        // Notably, we create the tenant with the ID as passed in. Next time the
                        // tenant is requested, it will already exist
                        id,
                        name,
                        e_private_key: e_priv_key,
                        public_key: ec_pk_uncompressed,
                        sandbox_restricted: false,
                        is_demo_tenant: true,
                        is_prod_ob_config_restricted: false,
                        is_prod_kyb_playbook_restricted: false,
                        is_prod_auth_playbook_restricted: false,
                        domains: vec![],
                        allow_domain_access: false,
                    };
                    Tenant::create(conn, new_tenant)?
                }
            };

            //
            // Get or create the TenantUser
            //
            let mut create_auth_token = |email: &str,
                                         irk: ImmutableRoleKind|
             -> ApiResult<SessionAuthToken> {
                let email = OrgMemberEmail::from_str(email)?;
                let first_name = Some("Footprint".to_owned());
                let last_name = Some("Integration Testing".to_owned());
                let user = TenantUser::get_and_update_or_create(conn, email, first_name, last_name)?;
                let user = if irk == ImmutableRoleKind::Admin {
                    TenantUser::set_is_firm_employee_testing_only(conn, &user.id)?
                } else {
                    // No reason to give read-only user firm employee perms
                    user
                };
                let role = TenantRole::get_immutable(conn, &tenant.id, irk, TenantRoleKind::DashboardUser)?;
                let rb = match TenantRolebinding::get(conn, (&user.id, &tenant.id)) {
                    Ok((_, rb, _, _)) => rb,
                    Err(e) => {
                        if !e.is_not_found() {
                            return Err(e.into()); // Real error, return
                        }
                        let role_id = role.id.clone();
                        let (rb, _) = TenantRolebinding::create(conn, user.id, role_id, &tenant.id)?;
                        rb
                    }
                };
                // Create a new tenant RB session for the integration test tenant user
                let session_data =
                    TenantRbSession::create(rb.id.clone(), WorkosAuthMethod::GoogleOauth).into();
                let (auth_token, _) =
                    AuthSession::create_sync(conn, &key, session_data, Duration::minutes(30))?;
                Ok(auth_token)
            };
            let auth_token = create_auth_token(
                OrgMemberEmail::INTEGRATION_TEST_USER_EMAIL,
                ImmutableRoleKind::Admin,
            )?;
            let ro_auth_token = create_auth_token(
                OrgMemberEmail::INTEGRATION_TEST_RO_USER_EMAIL,
                ImmutableRoleKind::ReadOnly,
            )?;

            //
            // Get or create the api keys
            //
            let api_keys = api_keys
                .into_iter()
                .map(|(is_live, p_api_key, sh_api_key)| -> ApiResult<_> {
                    let rk = ImmutableRoleKind::Admin;
                    let admin_role =
                        TenantRole::get_immutable(conn, &tenant.id, rk, TenantRoleKind::ApiKey { is_live })?;
                    let tenant_api_key_name = "Integration test API key";
                    let r = match TenantApiKey::get(conn, (tenant_api_key_name, &tenant.id, is_live)) {
                        Ok(r) => r,
                        Err(e) => {
                            if !e.is_not_found() {
                                return Err(e.into()); // Real error, return
                            }
                            let api_key = TenantApiKey::create(
                                conn,
                                // Always create it with the same name so we find it next time
                                tenant_api_key_name.to_owned(),
                                sh_api_key,
                                p_api_key.seal_to(&tenant.public_key)?,
                                tenant.id.clone(),
                                is_live,
                                admin_role.id.clone(),
                            )?;
                            (api_key, admin_role)
                        }
                    };
                    Ok(r)
                })
                .collect::<ApiResult<_>>()?;
            let result = Result {
                tenant,
                api_keys,
                auth_token,
                ro_auth_token,
            };
            Ok(result)
        })
        .await?;

    let mut keys = vec![];
    for (key, role) in api_keys {
        let p_api_key = state
            .enclave_client
            .decrypt_to_piistring(&key.e_secret_api_key, &tenant.e_private_key)
            .await?;
        let p_api_key = SecretApiKey::from(p_api_key.leak().to_string());
        let serialized = api_wire_types::SecretApiKey::from_db((key, role, Some(p_api_key)));
        keys.push(serialized);
    }

    // Get the actual raw API key value
    let response = NewClientResponse {
        org_id: tenant.id,
        keys,
        auth_token,
        ro_auth_token,
    };
    ResponseData::ok(response).json()
}
