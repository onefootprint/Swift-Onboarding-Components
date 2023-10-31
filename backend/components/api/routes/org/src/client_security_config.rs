use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;

use crate::types::JsonApiResponse;

use crate::types::ResponseData;

use crate::State;
use api_core::auth::tenant::TenantAuth;
use api_core::errors::tenant::TenantError;
use api_wire_types::OrgClientSecurityConfig;

use db::models::tenant_client_config::TenantClientConfig;
use db::models::tenant_client_config::UpdateTenantClientConfig;

use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, patch, web};

#[api_v2_operation(
    tags(Organization, Private),
    description = "Get the client security configuration."
)]
#[get("/org/client_security_config")]
async fn get(state: web::Data<State>, auth: TenantSessionAuth) -> JsonApiResponse<OrgClientSecurityConfig> {
    let auth: Box<dyn TenantAuth> = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();
    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();

    let config = state
        .db_pool
        .db_query(move |conn| TenantClientConfig::get(conn, &tenant_id, is_live))
        .await??
        .map(
            |TenantClientConfig {
                 is_live,
                 allowed_origins,
                 ..
             }| OrgClientSecurityConfig {
                is_live,
                allowed_origins,
            },
        )
        .unwrap_or(OrgClientSecurityConfig {
            is_live,
            allowed_origins: vec![],
        });

    ResponseData::ok(config).json()
}

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct UpdateClientSecurityConfig {
    allowed_origins: Vec<String>,
}

#[api_v2_operation(
    tags(Organization, Private),
    description = "Update the client security configuration."
)]
#[patch("/org/client_security_config")]
async fn patch(
    state: web::Data<State>,
    request: web::Json<UpdateClientSecurityConfig>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<OrgClientSecurityConfig> {
    let auth: Box<dyn TenantAuth> = auth.check_guard(TenantGuard::OnboardingConfiguration)?;
    let tenant = auth.tenant();
    let is_live = auth.is_live()?;
    let tenant_id = tenant.id.clone();
    let allowed_origins = request.into_inner().allowed_origins;

    let urls = allowed_origins
        .iter()
        .map(|o| url::Url::parse(o))
        .collect::<Result<Vec<_>, _>>()?;

    // some basic validation on allowed origins
    if is_live && urls.iter().any(|url| url.scheme() != "https") {
        Err(TenantError::AllowedOriginsMustBeHttpsInLive)?;
    }

    let TenantClientConfig {
        is_live,
        allowed_origins,
        ..
    } = state
        .db_pool
        .db_transaction(move |conn| {
            UpdateTenantClientConfig {
                is_live,
                tenant_id,
                allowed_origins,
            }
            .create_or_update(conn)
        })
        .await?;

    ResponseData::ok(OrgClientSecurityConfig {
        is_live,
        allowed_origins,
    })
    .json()
}
