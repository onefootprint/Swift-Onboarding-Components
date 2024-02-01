use crate::{ProtectedAuth, State};
use actix_web::{post, web, web::Json};
use api_core::{
    auth::session::{
        sdk_args::{SdkArgs, SdkArgsData},
        AuthSessionData,
    },
    errors::ValidationError,
    types::{JsonApiResponse, ResponseData},
    ApiErrorKind,
};
use chrono::{DateTime, Utc};
use db::models::session::Session;
use newtypes::{AuthTokenHash, SealedSessionBytes, SessionAuthToken};

#[derive(Debug, serde::Deserialize)]
pub struct RevealRequest {
    token: Option<SessionAuthToken>,
    hash: Option<AuthTokenHash>,
}

#[derive(Debug, serde::Serialize)]
pub struct RevealResponse {
    data: serde_json::Value,
    kind: SessionKind,
    expires_at: DateTime<Utc>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionKind {
    Sealed,
    Json,
}

#[post("/private/token/reveal")]
pub async fn post(
    state: web::Data<State>,
    request: Json<RevealRequest>,
    _: ProtectedAuth,
) -> JsonApiResponse<RevealResponse> {
    let RevealRequest { token, hash } = request.into_inner();

    let token_hash = match (token, hash) {
        (Some(token), None) => token.id(),
        (None, Some(hash)) => hash,
        _ => return Err(ValidationError("Must provide only one of token or hash").into()),
    };
    let session = state
        .db_pool
        .db_query(move |conn| Session::get(conn, token_hash))
        .await?;

    let Some(session) = session else {
        return Err(ApiErrorKind::ResourceNotFound)?;
    };

    // First try just decrypting the session, as some sessions aren't stored encrypted
    let data: Result<serde_json::Value, _> = serde_json::from_slice(session.data.as_ref());
    let (data, kind) = if let Ok(data) = data {
        (data, SessionKind::Json)
    } else {
        // Then try decrypting the session and json deserializing
        let data = AuthSessionData::unseal(&state.session_sealing_key, SealedSessionBytes(session.data))?;

        let data = if let AuthSessionData::SdkArgs(data) = data {
            // SDK args are also encyrypted to another specific key, let's decrypt it
            let SdkArgsData {
                e_private_key,
                e_data,
            } = data;
            let sdk_args_str = state
                .enclave_client
                .decrypt_to_piistring(&e_data, &e_private_key)
                .await?;
            let args: SdkArgs = serde_json::de::from_str(sdk_args_str.leak())?;
            serde_json::value::to_value(args)?
        } else {
            serde_json::value::to_value(data)?
        };
        (data, SessionKind::Sealed)
    };
    let response = RevealResponse {
        data,
        kind,
        expires_at: session.expires_at,
    };
    ResponseData::ok(response).json()
}
