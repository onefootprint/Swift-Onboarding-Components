use crate::auth::session::AuthSessionData;
use crate::auth::tenant::WorkOsSession;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::session::AuthSession;
use crate::State;
use crate::{auth::custodian::CustodianAuthContext, org::workos::login::create_tenant};
use chrono::Duration;
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::TenantRole;
use db::models::tenant_user::TenantUser;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::{SessionAuthToken, TenantId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct NewClientRequest {
    name: String,
    /// the org to attach this client to
    workos_org_id: Option<String>,
    /// determines if a live api key is created or not
    is_live: bool,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
struct NewClientResponse {
    org_id: TenantId,
    key: api_types::SecretApiKey,
    auth_token: SessionAuthToken,
}

#[api_v2_operation(
    summary = "/private/tenant",
    operation_id = "private-tenant",
    description = "Creates a new tenant (this endpoint will be private in prod TODO).",
    tags(Private)
)]
#[post("/tenant")]
async fn post(
    request: web::Json<NewClientRequest>,
    _custodian: CustodianAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<NewClientResponse>>, ApiError> {
    let NewClientRequest {
        name,
        workos_org_id,
        is_live,
    } = request.into_inner();

    let tenant = create_tenant(&state, name, workos_org_id, false).await?;
    let key = state.session_sealing_key.clone();
    let tenant_id = tenant.id.clone();
    let auth_token = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let admin_role = TenantRole::get_or_create_admin_role(conn, tenant_id)?;
            let (tenant_user, _) = TenantUser::create(
                conn,
                "integrationtests@onefootprint.com".to_owned().into(),
                admin_role.tenant_id,
                admin_role.id,
            )?;
            let session_data = AuthSessionData::WorkOs(WorkOsSession {
                email: tenant_user.email.0,
                first_name: Some("Footprint".to_owned()),
                last_name: Some("Test".to_owned()),
                tenant_user_id: tenant_user.id,
            });
            let auth_token = AuthSession::create_sync(conn, &key, session_data, Duration::minutes(15))?;
            Ok(auth_token)
        })
        .await?;

    let secret_api_key = SecretApiKey::generate(is_live);
    let new_key = TenantApiKey::create(
        &state.db_pool,
        "Secret key".to_owned(),
        secret_api_key.fingerprint(&state.hmac_client).await?,
        secret_api_key.seal_to(&tenant.public_key)?,
        tenant.id.clone(),
        is_live,
    )
    .await?;

    Ok(Json(ResponseData {
        data: NewClientResponse {
            org_id: tenant.id,
            key: api_types::SecretApiKey::from_db((new_key, Some(secret_api_key), None)),
            auth_token,
        },
    }))
}
