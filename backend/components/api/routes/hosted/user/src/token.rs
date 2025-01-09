use crate::auth::user::UserAuthContext;
use api_core::auth::session::user::UserSessionBuilder;
use api_core::auth::user::allowed_user_scopes;
use api_core::auth::user::load_auth_events;
use api_core::auth::Any;
use api_core::types::ApiResponse;
use api_core::State;
use api_errors::BadRequestInto;
use api_wire_types::hosted::tokens::CreateUserTokenRequest;
use api_wire_types::hosted::tokens::CreateUserTokenResponse;
use api_wire_types::hosted::tokens::GetUserTokenResponse;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(User, Hosted),
    description = "Returns information about a given auth token."
)]
#[actix::get("/hosted/user/token")]
pub fn get(user_auth: UserAuthContext) -> ApiResponse<GetUserTokenResponse> {
    let user_auth = user_auth.check_guard(Any)?;

    Ok(GetUserTokenResponse {
        expires_at: user_auth.expires_at(),
        scopes: user_auth.data.session.scopes,
    })
}

#[api_v2_operation(
    tags(User, Hosted),
    description = "Create a new token with the requested scopes using the permissions granted by the existing token. Used to create a secondary token with more limited scope. The new token's expiry time is the same as the old token's"
)]
#[actix::post("/hosted/user/tokens")]
pub async fn post(
    user_auth: UserAuthContext,
    request: web::Json<CreateUserTokenRequest>,
    state: web::Data<State>,
) -> ApiResponse<CreateUserTokenResponse> {
    let user_auth = user_auth.check_guard(Any)?;
    let CreateUserTokenRequest { requested_scope } = request.into_inner();

    let session_key = state.session_sealing_key.clone();
    let (token, expires_at) = state
        .db_query(move |conn| {
            let aes = load_auth_events(conn, &user_auth.auth_events)?;
            let new_scopes = allowed_user_scopes(&aes, requested_scope);
            if new_scopes.iter().any(|s| !user_auth.scopes.contains(s)) {
                // The only use case of this today is to request a token with _fewer_ scopes.
                // It could be dangerous to allow a user to request a token with _more_ scopes,
                // particularly for tokens given to the components SDK that intentially have
                // fewer scopes than their auth methods allow.
                // Do not remove this validation unless you know what you're doing.
                return BadRequestInto("Cannot request additional scopes");
            }
            let session = UserSessionBuilder::from_existing(&user_auth, requested_scope.into())?
                .replace_scopes(new_scopes)?
                .finish()?;
            let (token, expires_at) = user_auth.create_derived(conn, &session_key, session, None)?;
            Ok((token, expires_at))
        })
        .await?;

    Ok(CreateUserTokenResponse { expires_at, token })
}
