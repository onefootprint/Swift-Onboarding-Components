use crate::State;
use api_core::{
    auth::{
        protected_custodian::ProtectedCustodianAuthContext,
        session::AuthSessionData,
        tenant::{CheckTenantGuard, FirmEmployeeAuthContext, TenantGuard},
        Either,
    },
    types::{JsonApiResponse, ResponseData}, ApiErrorKind,
};
use db::models::session::Session;
use newtypes::{SealedSessionBytes, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Apiv2Schema, serde::Deserialize)]
pub struct RevealRequest {
    token: SessionAuthToken,
}

#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct RevealResponse {
    data: serde_json::Value,
    kind: SessionKind,
}

#[derive(Debug, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionKind {
    Sealed,
    Json,
}

#[api_v2_operation(description = "Reveal the contents of an auth token's session", tags(Private))]
#[post("/private/token/reveal")]
pub async fn post(
    state: web::Data<State>,
    request: Json<RevealRequest>,
    auth: Either<ProtectedCustodianAuthContext, FirmEmployeeAuthContext>,
) -> JsonApiResponse<RevealResponse> {
    if let Either::Right(auth) = auth {
        // Basically, make sure only "Risk ops" employees can hit this API
        auth.check_guard(TenantGuard::ManualReview)?;
    }

    let RevealRequest { token } = request.into_inner();

    let token_hash = token.id();
    let session = state
        .db_pool
        .db_query(move |conn| Session::get(conn, token_hash))
        .await??;

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
        let serialized = serde_json::value::to_value(data)?;
        (serialized, SessionKind::Sealed)
    };
    let response = RevealResponse { data, kind };
    ResponseData::ok(response).json()
}
