use crate::auth::custodian::CustodianAuthContext;
use crate::auth::session::AuthSessionData;
use crate::errors::tenant::TenantError;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::session::AuthSession;
use crate::State;
use chrono::Duration;
use db::models::tenant::{NewIntegrationTestTenant, Tenant};
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::TenantRole;
use db::models::tenant_user::TenantUser;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{OrgMemberEmail, SessionAuthToken, TenantId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientRequest {
    /// Client-provided primary key of the tenant. Must start with a `_private_it_org_` prefix.
    /// If a tenant with this ID already exists, it will be returned and impersonated.
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
    let sh_secret_api_key = secret_api_key.fingerprint(&state.hmac_client).await?;

    let (tenant, auth_token, api_key) = state
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
                    };
                    Tenant::save(conn, new_tenant)?
                }
            };

            //
            // Get or create the TenantUser
            //
            let email = OrgMemberEmail::from("integrationtests@onefootprint.com".to_owned());
            let tenant_user = match TenantUser::get_by_email(conn, &email, &tenant.id) {
                Ok(tenant_user) => tenant_user,
                Err(e) => {
                    if !e.is_not_found() {
                        return Err(e.into()); // Real error, return
                    }
                    let admin_role = TenantRole::get_or_create_admin_role(conn, tenant.id.clone())?;
                    let (tenant_user, _) = TenantUser::create(
                        conn,
                        email, // Always create with the same email so we find it next time
                        admin_role.tenant_id,
                        admin_role.id,
                        Some("Footprint".to_owned()),
                        Some("Integration Testing".to_owned()),
                    )?;
                    tenant_user
                }
            };
            // Create a new workos session for the integration test tenant user
            let session_data = AuthSessionData::WorkOs(tenant_user.into());
            let auth_token = AuthSession::create_sync(conn, &key, session_data, Duration::minutes(15))?;

            //
            // Get or create the TenantUser
            //
            let tenant_api_key_name = "Integration test API key";
            let api_key = match TenantApiKey::get(conn, (tenant_api_key_name, &tenant.id, is_live)) {
                Ok(api_key) => api_key,
                Err(e) => {
                    if !e.is_not_found() {
                        return Err(e.into()); // Real error, return
                    }
                    TenantApiKey::create(
                        conn,
                        // Always create it with the same name so we find it next time
                        tenant_api_key_name.to_owned(),
                        sh_secret_api_key,
                        secret_api_key.seal_to(&tenant.public_key)?,
                        tenant.id.clone(),
                        is_live,
                    )?
                }
            };
            Ok((tenant, auth_token, api_key))
        })
        .await?;

    // Get the actual raw API key value
    let decrypted_api_key = state
        .enclave_client
        .decrypt_bytes(
            &api_key.e_secret_api_key,
            &tenant.e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;
    let decrypted_api_key = SecretApiKey::from(decrypted_api_key.leak().to_string());

    Ok(Json(ResponseData {
        data: NewClientResponse {
            org_id: tenant.id,
            key: api_wire_types::SecretApiKey::from_db((api_key, Some(decrypted_api_key), None)),
            auth_token,
        },
    }))
}
