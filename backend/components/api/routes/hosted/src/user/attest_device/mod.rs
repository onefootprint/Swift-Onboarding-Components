use crate::auth::user::{UserAuthContext, UserAuthGuard};
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use actix_web::web::Json;

use api_core::types::ResponseData;
use api_core::utils::challenge::Challenge;

use api_core::ApiErrorKind;
use api_wire_types::hosted::device_attestation::{
    CreateDeviceAttestationRequest, DeviceAttestationChallengeResponse, DeviceAttestationType,
    GetDeviceAttestationChallengeRequest,
};
use chrono::{Duration, Utc};

use paperclip::actix::{self, api_v2_operation, web, Apiv2Schema};

mod ios;

#[cfg(test)]
mod tests;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum ChallengeState {
    /// Specifically namespace this challenge as to not conflict with other challenge types
    DeviceAttestationChallenge {
        device_type: DeviceAttestationType,
        attestation_challenge: String,
    },
}

/// initiate the attestation challenge
#[api_v2_operation(tags(Hosted), description = "Generate a device attestation challenge")]
#[actix::post("/hosted/user/attest_device/challenge")]
pub async fn post_challenge(
    request: Json<GetDeviceAttestationChallengeRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<DeviceAttestationChallengeResponse> {
    let _ = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    let GetDeviceAttestationChallengeRequest { device_type } = request.into_inner();

    // we need the server to generate a one-time use challenge
    let attestation_challenge = crypto::base64::encode(crypto::random::gen_rand_bytes(32));
    let challenge_state = ChallengeState::DeviceAttestationChallenge {
        device_type,
        attestation_challenge: attestation_challenge.clone(),
    };

    let sealed_state = Challenge {
        expires_at: Utc::now() + Duration::minutes(5),
        data: challenge_state,
    }
    .seal(&state.challenge_sealing_key)?;

    ResponseData::ok(DeviceAttestationChallengeResponse {
        state: sealed_state.to_string(),
        attestation_challenge,
    })
    .json()
}

/// receive the attestation
#[tracing::instrument(skip(state, user_auth))]
#[api_v2_operation(
    tags(Hosted),
    description = "Parses and accepts a user's onboarding device attestation"
)]
#[actix::post("/hosted/user/attest_device")]
pub async fn post_attestation(
    request: Json<CreateDeviceAttestationRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;
    let CreateDeviceAttestationRequest {
        attestation,
        state: sealed_state,
    } = request.into_inner();

    // first decode the state
    let ChallengeState::DeviceAttestationChallenge {
        attestation_challenge: challenge,
        device_type,
    } = Challenge::unseal_string(&state.challenge_sealing_key, sealed_state)?.data;

    match device_type {
        // only support ios for now
        DeviceAttestationType::Ios => {
            let new_attestation = ios::attest(&state, auth.user.id.clone(), challenge, attestation).await?;

            let attestation = state
                .db_pool
                .db_query(move |conn| new_attestation.create(conn))
                .await??;

            tracing::info!(attestation_id=%attestation.id, "create apple device attestation");
        }
        DeviceAttestationType::Android => {
            return Err(ApiErrorKind::AssertionError(
                "Android device attestation not yet support".into(),
            ))?
        }
    };

    EmptyResponse::ok().json()
}
