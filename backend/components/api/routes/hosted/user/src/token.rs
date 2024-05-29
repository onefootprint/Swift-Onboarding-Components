use crate::auth::user::UserAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use api_core::auth::session::user::AssociatedAuthEventKind;
use api_core::auth::user::{
    allowed_user_scopes,
    load_auth_events,
};
use api_core::auth::Any;
use api_core::errors::{
    ApiResult,
    ValidationError,
};
use api_core::State;
use api_wire_types::hosted::tokens::{
    CreateUserTokenRequest,
    CreateUserTokenResponse,
    GetUserTokenResponse,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    tags(User, Hosted),
    description = "Returns information about a given auth token."
)]
#[actix::get("/hosted/user/token")]
pub fn get(
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<GetUserTokenResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(Any)?;

    Ok(Json(ResponseData::ok(GetUserTokenResponse {
        expires_at: user_auth.expires_at(),
        scopes: user_auth.data.session.scopes,
    })))
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
) -> actix_web::Result<Json<ResponseData<CreateUserTokenResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(Any)?;
    let CreateUserTokenRequest { requested_scope } = request.into_inner();

    let session_key = state.session_sealing_key.clone();
    let (token, expires_at) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let aes = load_auth_events(conn, &user_auth.auth_events)?
                .iter()
                .map(|(ae, _)| ae.kind)
                .collect();
            let is_explicit = user_auth
                .auth_events
                .iter()
                .any(|ae| ae.kind == AssociatedAuthEventKind::Explicit);
            let new_scopes = allowed_user_scopes(aes, requested_scope, is_explicit);
            if new_scopes.iter().any(|s| !user_auth.scopes.contains(s)) {
                // The only use case of this today is to request a token with _fewer_ scopes.
                // It could be dangerous to allow a user to request a token with _more_ scopes,
                // particularly for tokens given to the components SDK that intentially have
                // fewer scopes than their auth methods allow.
                // Do not remove this validation unless you know what you're doing.
                return ValidationError("Cannot request additional scopes").into();
            }
            let purpose = requested_scope.into();
            let session = user_auth.reduce_scopes(new_scopes, purpose)?;
            let (token, expires_at) = user_auth.create_derived(conn, &session_key, session, None)?;
            Ok((token, expires_at))
        })
        .await?;

    Ok(Json(ResponseData::ok(CreateUserTokenResponse {
        expires_at,
        token,
    })))
}
