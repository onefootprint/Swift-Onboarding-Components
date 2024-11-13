use crate::ProtectedAuth;
use crate::State;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::auth::session::sdk_args::SdkArgs;
use api_core::auth::session::sdk_args::SdkArgsData;
use api_core::auth::session::AuthSessionData;
use api_core::types::ApiResponse;
use api_core::ApiCoreError;
use api_errors::BadRequest;
use chrono::DateTime;
use chrono::Utc;
use db::models::session::Session;
use newtypes::AuthTokenHash;
use newtypes::SealedSessionBytes;
use newtypes::SessionAuthToken;

#[derive(Debug, serde::Deserialize)]
pub struct RevealRequest {
    token: Option<SessionAuthToken>,
    hash: Option<AuthTokenHash>,
}

#[derive(Debug, serde::Serialize)]
#[serde(untagged)]
pub enum UnsealedData {
    Json(serde_json::Value),
    Cbor(serde_cbor::Value),
}

#[derive(Debug, serde::Serialize, macros::JsonResponder)]
pub struct RevealResponse {
    data: UnsealedData,
    kind: SessionKind,
    expires_at: DateTime<Utc>,
    token_hash: AuthTokenHash,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionKind {
    Sealed,
    SealedLegacy,
    Json,
}

#[post("/private/token/reveal")]
pub async fn post(
    state: web::Data<State>,
    request: Json<RevealRequest>,
    _: ProtectedAuth,
) -> ApiResponse<RevealResponse> {
    let RevealRequest { token, hash } = request.into_inner();

    let token_hash = match (token, hash) {
        (Some(token), None) => token.id(),
        (None, Some(hash)) => hash,
        _ => return Err(BadRequest("Must provide only one of token or hash").into()),
    };
    let session = state.db_query(move |conn| Session::get(conn, token_hash)).await?;

    let Some(session) = session else {
        return Err(ApiCoreError::ResourceNotFound)?;
    };

    // First try just decrypting the session, as some sessions aren't stored encrypted
    let data: Result<serde_json::Value, _> = serde_json::from_slice(session.data.as_ref());
    let (data, kind) = if let Ok(data) = data {
        (UnsealedData::Json(data), SessionKind::Json)
    } else if let Ok(data) = AuthSessionData::unseal(
        &state.session_sealing_key,
        SealedSessionBytes(session.data.clone()),
    ) {
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
        (UnsealedData::Json(data), SessionKind::Sealed)
    } else {
        // It's possible this is a legacy token and we can't deserialize it as a known type.
        // So, just return its raw value
        let raw_data: serde_cbor::Value = state
            .session_sealing_key
            .unseal(SealedSessionBytes(session.data).into())?;
        (UnsealedData::Cbor(raw_data), SessionKind::SealedLegacy)
    };
    let response = RevealResponse {
        data,
        kind,
        expires_at: session.expires_at,
        token_hash: session.key,
    };
    Ok(response)
}
