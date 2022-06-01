use crate::{
    auth::logged_in_session::LoggedInSessionContext,
    errors::ApiError,
    liveness::LivenessWebauthnConfig,
    types::{success::ApiResponseData, Empty},
    utils::challenge::{Challenge, ChallengeToken},
    State,
};
use chrono::{Duration, Utc};
use db::models::webauthn_credential::NewWebauthnCredential;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use serde::{Deserialize, Serialize};
use webauthn_rs::{proto::UserVerificationPolicy, RegistrationState};

/// Contains the payload for the frontend to communicate to the device via webauthn
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebAuthnInitResponse {
    // TODO do we have to explicitly convert this to JSON?
    challenge_json: String,
    challenge_token: ChallengeToken,
}

/// Get a registration challenge
#[api_v2_operation(tags(Liveness))]
#[post("/register/init")]
pub fn init(
    // TODO only allow registering webauthn credentials if you have no previous credentials OR if
    // you logged into this session via webauthn. Otherwise, someone who SIM swaps you can register
    // their own webauthn creds
    user_auth: LoggedInSessionContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<WebAuthnInitResponse>>, ApiError> {
    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));
    let user_id = user_auth.user_vault().id.to_string().as_bytes().to_vec();
    // TODO: fix usernames here
    let (challenge, reg_state) = webauthn.generate_challenge_register_options(
        user_id,
        "Footprint".into(),
        "Footprint".into(),
        None,
        Some(UserVerificationPolicy::Required),
        None,
    )?;

    let challenge_data = Challenge {
        expires_at: Utc::now().naive_utc() + Duration::minutes(5),
        data: reg_state,
    };
    let response = ApiResponseData::ok(WebAuthnInitResponse {
        challenge_json: serde_json::to_string(&challenge)?,
        challenge_token: challenge_data.seal(&state.session_sealing_key)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
struct WebauthnRegisterRequest {
    device_response_json: String,
    challenge_token: ChallengeToken,
}

/// Response to a registration challenge
#[api_v2_operation(tags(Liveness))]
#[post("/register")]
async fn complete(
    request: Json<WebauthnRegisterRequest>,
    user_auth: LoggedInSessionContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let challenge_data = Challenge::<RegistrationState>::unseal(
        &state.session_sealing_key,
        &request.challenge_token,
    )?;
    let reg_state = challenge_data.data;

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));

    let reg = serde_json::from_str(&request.device_response_json)?;
    let (cred, _authenticator_data) =
        webauthn.register_credential(&reg, &reg_state, |_| Ok(false))?;

    NewWebauthnCredential {
        user_vault_id: user_auth.user_vault().id.clone(),
        credential_id: cred.cred_id,
        public_key: crypto::serde_cbor::to_vec(&cred.cred).map_err(crypto::Error::Cbor)?,
        attestation_data: Vec::new(), // TODO
    }
    .save(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData::ok(Empty)))
}
