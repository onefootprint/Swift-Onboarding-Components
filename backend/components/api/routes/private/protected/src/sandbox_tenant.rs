use crate::State;
use actix_web::{post, web, web::Json};
use api_core::{
    auth::{
        session::{tenant::FirmEmployeeSession, AuthSessionData, GetSessionForUpdate},
        tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard},
    },
    errors::{ApiResult, ValidationError},
    types::{JsonApiResponse, ResponseData},
    utils::session::AuthSession,
};
use db::models::tenant::{NewTenant, Tenant};
use newtypes::SessionAuthToken;

#[derive(serde::Deserialize)]
pub struct SandboxTenantRequest {
    name: String,
    domains: Vec<String>,
}

#[derive(serde::Serialize)]
struct SandboxTenantResponse {
    token: SessionAuthToken,
}

#[post("/private/sandbox_tenant")]
pub async fn post(
    state: web::Data<State>,
    request: Json<SandboxTenantRequest>,
    auth: FirmEmployeeAuthContext,
) -> JsonApiResponse<SandboxTenantResponse> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;
    let SandboxTenantRequest { name, domains } = request.into_inner();
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;

    let tenant_user_id = auth.tenant_user.id.clone();
    let auth_method = auth.data.auth_method;
    let sealing_key = state.session_sealing_key.clone();
    let expires_at = auth.clone().session().expires_at;
    let token = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            if Tenant::is_domain_already_claimed(conn, &domains)? {
                return ValidationError("Tenant for this domain already exists").into();
            }
            let new_tenant = NewTenant {
                name,
                e_private_key: e_priv_key,
                public_key: ec_pk_uncompressed,
                workos_id: None,
                logo_url: None,
                sandbox_restricted: true,
                is_prod_ob_config_restricted: true,
                is_prod_kyb_playbook_restricted: true,
                is_prod_auth_playbook_restricted: true,
                domains,
                allow_domain_access: false,
            };
            let tenant = Tenant::create(conn, new_tenant)?;
            // Update the auth session to be impersonating the newly created tenant
            // TODO stop updating in place once the client starts using the new token
            let session = FirmEmployeeSession {
                tenant_user_id,
                tenant_id: tenant.id,
                auth_method,
            };
            let session = AuthSessionData::FirmEmployee(session);
            // The new token will expire at the same time as the existing token to prevent allowing
            // perpetually re-creating a new token for yourself
            let (token, _) = AuthSession::create_sync(conn, &sealing_key, session, expires_at)?;
            Ok(token)
        })
        .await?;
    ResponseData::ok(SandboxTenantResponse { token }).json()
}
