use std::str::FromStr;

use crate::auth::custodian::CustodianAuthContext;
use crate::errors::tenant::TenantError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::session::AuthSession;
use crate::State;
use api_core::auth::session::tenant::TenantRbSession;
use chrono::Duration;
use db::models::tenant::{NewIntegrationTestTenant, Tenant};
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::{ImmutableRoleKind, TenantRole};
use db::models::tenant_rolebinding::TenantRolebinding;
use db::models::tenant_user::TenantUser;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{
    OrgMemberEmail, SessionAuthToken, TenantId, TenantUserId, WorkosAuthMethod, INTEGRATION_TEST_USER_EMAIL,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientRequest {
    /// Client-provided primary key of the tenant. Must start with a `_private_it_org_` prefix.
    /// If a tenant with this ID already exists, it will be returned and assumed.
    /// Otherwise, we make a new tenant with this ID.
    id: TenantId,
    name: String,
    is_live: bool,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
struct NewClientResponse {
    org_id: TenantId,
    key: api_wire_types::SecretApiKey,
    auth_token: SessionAuthToken,
    tenant_user_id: TenantUserId,
}

#[api_v2_operation(
    description = "Creates a new tenant (this endpoint will be private in prod TODO).",
    tags(Private)
)]
#[post("/private/test_tenant")]
async fn post(
    request: web::Json<NewClientRequest>,
    _custodian: CustodianAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<NewClientResponse>>, ApiError> {
    let NewClientRequest { id, name, is_live } = request.into_inner();
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
    let secret_api_key = SecretApiKey::generate(is_live);
    let sh_secret_api_key = secret_api_key.fingerprint(state.as_ref()).await?;

    let (tenant, rb, auth_token, api_key, role) = state
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
                        domain: None,
                        allow_domain_access: false,
                    };
                    Tenant::create(conn, new_tenant)?
                }
            };

            //
            // Get or create the TenantUser
            //
            let email = OrgMemberEmail::from_str(INTEGRATION_TEST_USER_EMAIL)?;
            let user = TenantUser::get_and_update_or_create(
                conn,
                email, // Always create with the same email so we find it next time
                Some("Footprint".to_owned()),
                Some("Integration Testing".to_owned()),
            )?;
            let user = TenantUser::set_is_firm_employee_testing_only(conn, &user.id)?;
            let admin_role = TenantRole::get_or_create_immutable(conn, &tenant.id, ImmutableRoleKind::Admin)?;
            let _ro_role =
                TenantRole::get_or_create_immutable(conn, &tenant.id, ImmutableRoleKind::ReadOnly)?;
            let rb = match TenantRolebinding::get(conn, (&user.id, &tenant.id)) {
                Ok((_, rb, _, _)) => rb,
                Err(e) => {
                    if !e.is_not_found() {
                        return Err(e.into()); // Real error, return
                    }
                    let role_id = admin_role.id.clone();
                    let tenant_id = admin_role.tenant_id.clone();
                    let (rb, _) = TenantRolebinding::create(conn, user.id, role_id, tenant_id)?;
                    rb
                }
            };
            // Create a new workos session for the integration test tenant user
            let session_data =
                TenantRbSession::create(rb.id.clone(), Some(WorkosAuthMethod::GoogleOauth)).into();
            let (auth_token, _) = AuthSession::create_sync(conn, &key, session_data, Duration::minutes(15))?;

            //
            // Get or create the TenantUser
            //
            let tenant_api_key_name = "Integration test API key";
            let (api_key, role) = match TenantApiKey::get(conn, (tenant_api_key_name, &tenant.id, is_live)) {
                Ok(r) => r,
                Err(e) => {
                    if !e.is_not_found() {
                        return Err(e.into()); // Real error, return
                    }
                    let api_key = TenantApiKey::create(
                        conn,
                        // Always create it with the same name so we find it next time
                        tenant_api_key_name.to_owned(),
                        sh_secret_api_key,
                        secret_api_key.seal_to(&tenant.public_key)?,
                        tenant.id.clone(),
                        is_live,
                        Some(admin_role.id.clone()),
                    )?;
                    (api_key, admin_role)
                }
            };
            Ok((tenant, rb, auth_token, api_key, role))
        })
        .await?;

    // Get the actual raw API key value
    let decrypted_api_key = state
        .enclave_client
        .decrypt_to_piistring(&api_key.e_secret_api_key, &tenant.e_private_key, vec![])
        .await?;
    let decrypted_api_key = SecretApiKey::from(decrypted_api_key.leak().to_string());

    Ok(Json(ResponseData {
        data: NewClientResponse {
            org_id: tenant.id,
            key: api_wire_types::SecretApiKey::from_db((api_key, role, Some(decrypted_api_key))),
            auth_token,
            tenant_user_id: rb.tenant_user_id,
        },
    }))
}
