use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::types::ModernApiResult;
use crate::State;
use actix_web::web::Json;
use api_core::decision::vendor;
use api_core::decision::vendor::fp_device_attestation::AttestationResult;
use api_core::errors::ApiResult;
use api_core::utils::challenge::Challenge;
use api_core::utils::headers::InsightHeaders;
use api_wire_types::hosted::device_attestation::CreateDeviceAttestationRequest;
use api_wire_types::hosted::device_attestation::DeviceAttestationChallengeResponse;
use api_wire_types::hosted::device_attestation::DeviceAttestationType;
use api_wire_types::hosted::device_attestation::GetDeviceAttestationChallengeRequest;
use app_attest::error::AttestationError::MissingTenant;
use chrono::Duration;
use chrono::Utc;
use db::models::insight_event::CreateInsightEvent;
use db::models::liveness_event::NewLivenessEvent;
use db::models::user_timeline::UserTimeline;
use newtypes::LivenessAttributes;
use newtypes::LivenessInfo;
use newtypes::LivenessIssuer;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};

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
        ios_bundle_id: Option<String>,
        android_package_name: Option<String>,
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
) -> ModernApiResult<DeviceAttestationChallengeResponse> {
    let _ = user_auth.check_guard(UserAuthScope::SignUp)?;
    let GetDeviceAttestationChallengeRequest {
        device_type,
        ios_bundle_id,
        android_package_name,
    } = request.into_inner();

    // we need the server to generate a one-time use challenge
    let attestation_challenge = crypto::base64::encode(crypto::random::gen_rand_bytes(32));
    let challenge_state = ChallengeState::DeviceAttestationChallenge {
        ios_bundle_id,
        android_package_name,
        device_type,
        attestation_challenge: attestation_challenge.clone(),
    };

    let sealed_state = Challenge {
        expires_at: Utc::now() + Duration::minutes(5),
        data: challenge_state,
    }
    .seal(&state.challenge_sealing_key)?;

    Ok(DeviceAttestationChallengeResponse {
        state: sealed_state.to_string(),
        attestation_challenge,
    })
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
) -> ModernApiResult<api_wire_types::Empty> {
    let auth = user_auth.check_guard(UserAuthScope::SignUp)?;

    let CreateDeviceAttestationRequest {
        attestation,
        state: sealed_state,
    } = request.into_inner();

    // first decode the state
    let ChallengeState::DeviceAttestationChallenge {
        attestation_challenge: challenge,
        device_type,
        ios_bundle_id,
        android_package_name,
    } = Challenge::unseal_string(&state.challenge_sealing_key, sealed_state)?.data;

    let Some(tenant) = auth.tenant() else {
        return Err(MissingTenant.into());
    };

    let vault_id = auth.user.id.clone();
    let scoped_vault_id = auth.scoped_user_id();
    let workflow_id = auth.workflow_id();
    let vault_public_key = auth.user.public_key.clone();
    let is_live = auth.user.is_live;

    match device_type {
        DeviceAttestationType::Ios => {
            let new_attestation = ios::attest(
                &state,
                tenant,
                vault_id.clone(),
                challenge,
                attestation,
                ios_bundle_id,
            )
            .await?;

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

                        // the iOS attestation, in conjuction with a passkey registration, also helps us prove
                        // liveness so if the device attests it registered a passkey,
                        // we can confirm liveness too!
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
                                skip_context: None,
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
            let new_attestation = android::attest(
                &state,
                tenant,
                vault_id.clone(),
                challenge,
                attestation,
                android_package_name,
            )
            .await?;

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

                        // the iOS attestation, in conjuction with a passkey registration, also helps us prove
                        // liveness so if the device attests it registered a passkey,
                        // we can confirm liveness too!
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
                                skip_context: None,
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

    Ok(api_wire_types::Empty)
}
