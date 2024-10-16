use api_core::auth::session::GetSessionForUpdate;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::AuthError;
use api_core::types::ApiResponse;
use api_core::utils::session::AuthSession;
use api_core::State;
use newtypes::TenantSessionPurpose;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Create a token scoped for use on the docs site",
    tags(Auth, Private)
)]
#[post("/org/auth/docs_token")]
fn post(state: web::Data<State>, auth: TenantSessionAuth) -> ApiResponse<api_wire_types::DocsTokenResponse> {
    if auth.purpose() == TenantSessionPurpose::Docs {
        return Err(AuthError::AuthTokenPurposeRestricted.into());
    }

    let expires_at = auth.clone().session().expires_at;
    let session_data = auth.replace_purpose(TenantSessionPurpose::Docs);
    let sealing_key = state.session_sealing_key.clone();
    // The new token will expire at the same time as the existing token to prevent allowing
    // perpetually re-creating a new token for yourself
    let (token, _) = state
        .db_query(move |conn| AuthSession::create_sync(conn, &sealing_key, session_data, expires_at))
        .await?;

    let data = api_wire_types::DocsTokenResponse { token };
    Ok(data)
}
