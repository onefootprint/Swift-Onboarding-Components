use crate::{
    auth::user::{UserAuthContext, UserAuthGuard},
    types::{EmptyResponse, JsonApiResponse},
    State,
};
use actix_web::web::Json;

use api_core::{
    decision::vendor::fp_device_attestation::AttestationResult, errors::ApiResult, types::ResponseData,
    utils::challenge::Challenge,
};

use api_core::{decision::vendor, utils::headers::InsightHeaders};
use api_wire_types::hosted::device_attestation::{
    CreateDeviceAttestationRequest, DeviceAttestationChallengeResponse, DeviceAttestationType,
    GetDeviceAttestationChallengeRequest,
};
use chrono::{Duration, Utc};
use db::models::{
    insight_event::CreateInsightEvent, liveness_event::NewLivenessEvent, user_timeline::UserTimeline,
};
use newtypes::{LivenessAttributes, LivenessInfo, LivenessIssuer};
use paperclip::actix::{self, api_v2_operation, web, Apiv2Schema};

mod android;
mod ios;
#[cfg(test)]
mod tests;
mod util;

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
    let _ = user_auth.check_guard(UserAuthGuard::SignUp)?;
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
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    let CreateDeviceAttestationRequest {
        attestation,
        state: sealed_state,
    } = request.into_inner();

    // first decode the state
    let ChallengeState::DeviceAttestationChallenge {
        attestation_challenge: challenge,
        device_type,
    } = Challenge::unseal_string(&state.challenge_sealing_key, sealed_state)?.data;

    let vault_id = auth.user.id.clone();
    let scoped_vault_id = auth.scoped_user_id();
    let workflow_id = auth.workflow_id();
    let vault_public_key = auth.user.public_key.clone();
    let is_live = auth.user.is_live;

    match device_type {
        DeviceAttestationType::Ios => {
            let new_attestation = ios::attest(&state, vault_id.clone(), challenge, attestation).await?;

            state
                .db_pool
                .db_transaction(move |conn| -> ApiResult<()> {
                    let attestation = new_attestation.create(conn.conn())?;

                    // if we have a scoped vault (which we should always have in an onboarding)
                    if let Some(scoped_vault_id) = scoped_vault_id {
                        // generate risk signals
                        vendor::fp_device_attestation::save_vendor_result_and_risk_signals(
                            conn,
                            &AttestationResult::Apple(&attestation),
                            &vault_public_key,
                            &scoped_vault_id,
                            workflow_id.as_ref(),
                            is_live,
                        )?;

                        // the iOS attestation, in conjuction with a passkey registration, also helps us prove liveness
                        // so if the device attests it registered a passkey, we can confirm liveness too!
                        if attestation.webauthn_credential_id.is_some() {
                            let insight_event = CreateInsightEvent::from(insight).insert_with_conn(conn)?;
                            let liveness_event = NewLivenessEvent {
                                scoped_vault_id: scoped_vault_id.clone(),
                                liveness_source: newtypes::LivenessSource::AppleDeviceAttestation,
                                attributes: Some(LivenessAttributes {
                                    issuers: vec![LivenessIssuer::Footprint, LivenessIssuer::Apple],
                                    os: attestation.metadata.os.clone(),
                                    device: attestation.metadata.model.clone(),
                                    ..Default::default()
                                }),
                                insight_event_id: Some(insight_event.id),
                            }
                            .insert(conn)?;

                            // create the timeline event for a liveness
                            let info = LivenessInfo {
                                id: liveness_event.id,
                            };
                            UserTimeline::create(conn, info, vault_id, scoped_vault_id.clone())?;
                        }
                    }

                    Ok(())
                })
                .await?;
        }
        DeviceAttestationType::Android => {
            let new_attestation = android::attest(&state, vault_id.clone(), challenge, attestation).await?;

            state
                .db_pool
                .db_transaction(move |conn| -> ApiResult<()> {
                    let attestation = new_attestation.create(conn.conn())?;

                    // if we have a scoped vault (which we should always have in an onboarding)
                    if let Some(scoped_vault_id) = scoped_vault_id {
                        // generate risk signals
                        vendor::fp_device_attestation::save_vendor_result_and_risk_signals(
                            conn,
                            &AttestationResult::Google(&attestation),
                            &vault_public_key,
                            &scoped_vault_id,
                            workflow_id.as_ref(),
                            is_live,
                        )?;

                        // the iOS attestation, in conjuction with a passkey registration, also helps us prove liveness
                        // so if the device attests it registered a passkey, we can confirm liveness too!
                        if attestation.webauthn_credential_id.is_some() {
                            let insight_event = CreateInsightEvent::from(insight).insert_with_conn(conn)?;
                            let liveness_event = NewLivenessEvent {
                                scoped_vault_id: scoped_vault_id.clone(),
                                liveness_source: newtypes::LivenessSource::GoogleDeviceAttestation,
                                attributes: Some(LivenessAttributes {
                                    issuers: vec![LivenessIssuer::Footprint, LivenessIssuer::Google],
                                    os: attestation.metadata.os.clone(),
                                    device: attestation.metadata.model.clone(),
                                    ..Default::default()
                                }),
                                insight_event_id: Some(insight_event.id),
                            }
                            .insert(conn)?;

                            // create the timeline event for a liveness
                            let info = LivenessInfo {
                                id: liveness_event.id,
                            };
                            UserTimeline::create(conn, info, vault_id, scoped_vault_id.clone())?;
                        }
                    }

                    Ok(())
                })
                .await?;
        }
    };

    EmptyResponse::ok().json()
}
