use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::tenant::ClientTenantAuth;
use api_core::errors::ApiResult;
use api_core::utils::session::AuthSession;
use api_wire_types::ClientTokenRequest;
use api_wire_types::ClientTokenResponse;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, post, web};

#[route_alias(post(
    "/users/{fp_id}/client_token",
    tags(Users, Preview),
    description = "Create a short-lived token safe to pass to your client for operations to vault or decrypt data for this user.",
))]
#[api_v2_operation(
    description = "Create a short-lived token safe to pass to your client for operations to vault or decrypt data for this user.",
    tags(Entities, Preview)
)]
#[post("/entities/{fp_id}/client_token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<ClientTokenRequest>,
    // For now, only accept tenant API key
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<ClientTokenResponse> {
    let tenant_api_key_id = auth.api_key().id.clone();
    // Safeguard so when API keys have less than admin permissions we don't allow making tokens
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let ClientTokenRequest { fields } = request.into_inner();
    let session_key = state.session_sealing_key.clone();

    let token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // We'll check this later too, but worth at least doing a sanity check that the user
            // in question exists
            ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let data = ClientTenantAuth {
                fp_id,
                is_live,
                tenant_id,
                fields: fields.into_iter().collect(),
                tenant_api_key_id,
            };
            let duration = Duration::minutes(30);
            let auth_token = AuthSession::create_sync(conn, &session_key, data.into(), duration)?;
            Ok(auth_token)
        })
        .await??;

    ResponseData::ok(ClientTokenResponse { token }).json()
}
