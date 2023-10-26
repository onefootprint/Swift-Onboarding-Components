use crate::auth::tenant::CheckTenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use actix_web::web::Json;
use api_core::auth::session::user::UserSession;
use api_core::auth::session::user::UserSessionArgs;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;
use api_core::errors::ApiResult;
use api_core::utils::session::AuthSession;
use api_wire_types::CreateTokenRequest;
use api_wire_types::CreateTokenResponse;
use chrono::Duration;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, post, web};

#[route_alias(post(
    "/users/{fp_id}/token",
    tags(Users, Preview),
    description = "Create an unauthorized, identified token for the provided fp_id. This token may be passed into Footprint.js to bootstrap a user's onboarding with known information.",
))]
#[api_v2_operation(
    description = "Create an unauthorized, identified token for the provided fp_id. This token may be passed into Footprint.js to bootstrap a user's onboarding with known information.",
    tags(Entities, Private)
)]
#[post("/entities/{fp_id}/token")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: Json<CreateTokenRequest>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<CreateTokenResponse> {
    let auth = auth.check_guard(TenantGuard::AuthToken)?;
    let CreateTokenRequest { key } = request.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    let (token, session) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (obc, _) = ObConfiguration::get(conn, (&key, &tenant_id, is_live))?;
            // Explicitly create with no scopes in order to require the user to verify their
            // phone number when they log in
            let scopes = vec![];
            let auth_factors = vec![];
            let duration = Duration::days(1);
            let args = UserSessionArgs {
                su_id: Some(sv.id),
                obc_id: Some(obc.id),
                is_from_api: true,
                ..Default::default()
            };
            let data = UserSession::make(sv.vault_id, args, scopes, auth_factors, None)?;
            let (auth_token, session) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((auth_token, session))
        })
        .await??;

    let expires_at = session.expires_at;
    ResponseData::ok(CreateTokenResponse { token, expires_at }).json()
}
