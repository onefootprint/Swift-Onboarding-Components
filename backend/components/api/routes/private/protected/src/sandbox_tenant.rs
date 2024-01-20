use crate::State;
use actix_web::{post, web, web::Json};
use api_core::{
    auth::{
        session::{tenant::FirmEmployeeSession, AuthSessionData, UpdateSession},
        tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard},
    },
    errors::{ApiResult, ValidationError},
    types::{EmptyResponse, JsonApiResponse, ResponseData},
};
use db::models::tenant::NewTenant;
use db::models::tenant::Tenant;

#[derive(serde::Deserialize)]
pub struct SandboxTenantRequest {
    name: String,
    domains: Vec<String>,
}

#[post("/private/sandbox_tenant")]
pub async fn post(
    state: web::Data<State>,
    request: Json<SandboxTenantRequest>,
    auth: FirmEmployeeAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;
    let SandboxTenantRequest { name, domains } = request.into_inner();
    let (ec_pk_uncompressed, e_priv_key) = state.enclave_client.generate_sealed_keypair().await?;

    let tenant_user_id = auth.tenant_user.id.clone();
    let auth_method = auth.data.auth_method;
    let sealing_key = state.session_sealing_key.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get_tenant_by_domains(conn, domains.clone())?;
            if tenant.is_some() {
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
            let session = FirmEmployeeSession {
                tenant_user_id,
                tenant_id: tenant.id,
                auth_method,
            };
            auth.update_session(conn, &sealing_key, AuthSessionData::FirmEmployee(session))?;
            Ok(())
        })
        .await?;
    ResponseData::ok(EmptyResponse {}).json()
}
