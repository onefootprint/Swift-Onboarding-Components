use crate::auth::tenant::CheckTenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use actix_web::web::Json;
use api_core::auth::session::user::UserSession;
use api_core::auth::session::user::UserSessionArgs;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::user::allowed_user_scopes;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiResult;
use api_core::utils::session::AuthSession;
use api_wire_types::CreateTokenRequest;
use api_wire_types::CreateTokenResponse;
use chrono::Duration;
use db::models::auth_event::AuthEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::FpId;
use newtypes::IdentifyScope;
use newtypes::ObConfigurationKind;
use paperclip::actix::{api_v2_operation, post, web};

// TODO should this be named onboarding token?
#[route_alias(post(
    "/users/{fp_id}/token",
    tags(Users, Preview),
    description = "Create an identified token for the provided fp_id. This token may be passed into Footprint.js to bootstrap a user's onboarding with known information. Re-auth will be required if the user hasn't logged into your tenant recently.",
))]
#[api_v2_operation(
    description = "Create an identified token for the provided fp_id. This token may be passed into Footprint.js to bootstrap a user's onboarding with known information. Re-auth will be required if the user hasn't logged into your tenant recently.",
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
            let obc_id = if let Some(key) = key {
                let (obc, _) = ObConfiguration::get(conn, (&key, &tenant_id, is_live))?;
                if obc.kind == ObConfigurationKind::Auth {
                    return Err(OnboardingError::CannotOnboardOntoAuthPlaybook.into());
                }
                Some(obc.id)
            } else {
                None
            };
            let events = AuthEvent::list_recent(conn, &sv.id)?;
            let kinds = events.iter().map(|e| e.kind).collect();
            // Request Onboarding scopes, but if the user hasn't authed to the tenant recently, we
            // will be granted no scopes and the user will be required to re-auth
            let scopes = allowed_user_scopes(kinds, IdentifyScope::Onboarding, true);
            let duration = Duration::hours(1);
            let args = UserSessionArgs {
                su_id: Some(sv.id),
                obc_id,
                is_from_api: true,
                is_implied_auth: true,
                ..Default::default()
            };
            let event_ids = events.into_iter().map(|e| e.id).collect();
            let data = UserSession::make(sv.vault_id, args, scopes, event_ids)?;
            let (auth_token, session) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((auth_token, session))
        })
        .await??;

    let expires_at = session.expires_at;
    ResponseData::ok(CreateTokenResponse { token, expires_at }).json()
}
