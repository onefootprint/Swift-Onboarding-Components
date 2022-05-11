use crate::{
    auth::AuthError,
    errors::ApiError,
    liveness::{auth_context::AuthState, LivenessWebauthnConfig},
    response::{success::ApiResponseData, Empty},
    State,
};
use actix_session::Session;
use crypto::serde_cbor;
use db::{errors::DbError, models::webauthn_credential::WebauthnCredential};
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};
use serde::{Deserialize, Serialize};
use webauthn_rs::proto::{Credential, UserVerificationPolicy};

use super::auth_context::{LivenessVerificationAuthContext, WebAuthnState};

/// Contains the payload for the frontend to communicate to the device via webauthn
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct GetWebauthnChallengeResponse {
    challenge_json: String,
}

/// Get a registration challenge
#[api_v2_operation]
#[get("/verify")]
pub async fn get_verify_challenge(
    mut auth: LivenessVerificationAuthContext,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<GetWebauthnChallengeResponse>>, ApiError> {
    // ensure we're in allowed state
    match auth.local_state.state {
        WebAuthnState::Auth(AuthState::NotStarted)
        | WebAuthnState::Auth(AuthState::AuthChallenge(_)) => {}
        _ => return Err(AuthError::InvalidSessionState.into()),
    };

    // look up webauthn credentials
    let user_vault_id = auth.local_state.user_vault_id.clone();
    let creds = state
        .db_pool
        .get()
        .await
        .map_err(DbError::from)?
        .interact(move |conn| WebauthnCredential::get_for_user_vault(conn, &user_vault_id))
        .await
        .map_err(DbError::from)??;

    // convert these creds to webauthn rs type
    let creds = creds
        .into_iter()
        .map(|cred| {
            serde_cbor::from_slice(&cred.public_key)
                .map(|public_key| Credential {
                    counter: 0,
                    cred_id: cred.credential_id,
                    registration_policy: UserVerificationPolicy::Required,
                    verified: true,
                    cred: public_key,
                })
                .map_err(crypto::Error::from)
        })
        .collect::<Result<Vec<Credential>, crypto::Error>>()?;

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(LivenessWebauthnConfig::new(&state));

    let (challenge, auth_state) = webauthn.generate_challenge_authenticate_options(creds, None)?;

    // store the local state in our cookie
    auth.local_state.state = WebAuthnState::Auth(AuthState::AuthChallenge(auth_state));
    auth.local_state.set(&session)?;

    let response = ApiResponseData::ok(GetWebauthnChallengeResponse {
        challenge_json: serde_json::to_string(&challenge)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
struct WebauthnVerifyRequest {
    device_response_json: String,
}

/// Response to a registration challenge
#[api_v2_operation]
#[post("/verify")]
async fn post_verify_challenge(
    request: Json<WebauthnVerifyRequest>,
    mut auth: LivenessVerificationAuthContext,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    // ensure we're in the right state
    let auth_state = match auth.local_state.state {
        WebAuthnState::Auth(AuthState::AuthChallenge(auth_state)) => auth_state,
        _ => return Err(AuthError::InvalidSessionState.into()),
    };

    // generate the challenge and return it
    let webauthn = webauthn_rs::Webauthn::new(super::LivenessWebauthnConfig::new(&state));

    let auth_resp = serde_json::from_str(&request.device_response_json)?;
    let (_, _authenticator_data) = webauthn.authenticate_credential(&auth_resp, &auth_state)?;

    auth.local_state.state = WebAuthnState::Auth(AuthState::AuthSuccess);
    auth.local_state.set(&session)?;

    Ok(Json(ApiResponseData::ok(Empty)))
}
