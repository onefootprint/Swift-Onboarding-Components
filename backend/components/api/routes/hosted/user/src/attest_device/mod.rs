use crate::auth::user::UserAuthScope;
use crate::types::ApiResponse;
use crate::State;
use actix_web::web::Json;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::vendor::fp_device_attestation::save_vendor_result_and_risk_signals;
use api_core::utils::challenge::Challenge;
use api_core::utils::headers::InsightHeaders;
use api_core::FpResult;
use api_wire_types::hosted::device_attestation::CreateDeviceAttestationRequest;
use api_wire_types::hosted::device_attestation::DeviceAttestationChallengeResponse;
use api_wire_types::hosted::device_attestation::DeviceAttestationType;
use api_wire_types::hosted::device_attestation::GetDeviceAttestationChallengeRequest;
use chrono::Duration;
use chrono::Utc;
use db::models::apple_device_attest::NewAppleDeviceAttestation;
use db::models::google_device_attest::NewGoogleDeviceAttestation;
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
    auth: UserWfAuthContext,
) -> ApiResponse<DeviceAttestationChallengeResponse> {
    auth.check_guard(UserAuthScope::SignUp)?;
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
#[tracing::instrument(skip(state, auth))]
#[api_v2_operation(
    tags(Hosted),
    description = "Parses and accepts a user's onboarding device attestation"
)]
#[actix::post("/hosted/user/attest_device")]
pub async fn post_attestation(
    request: Json<CreateDeviceAttestationRequest>,
    state: web::Data<State>,
    auth: UserWfAuthContext,
    insight: InsightHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(UserAuthScope::SignUp)?;

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

    #[derive(derive_more::From)]
    #[allow(clippy::large_enum_variant)]
    enum NewDeviceAttestation {
        Apple(NewAppleDeviceAttestation),
        Android(NewGoogleDeviceAttestation),
    }

    let t = auth.tenant();
    let sv = &auth.scoped_user;
    let new_attestation = match device_type {
        DeviceAttestationType::Ios => ios::attest(&state, t, sv, challenge, attestation, ios_bundle_id)
            .await?
            .into(),
        DeviceAttestationType::Android => {
            android::attest(&state, t, sv, challenge, attestation, android_package_name)
                .await?
                .into()
        }
    };

    let sv_id = auth.scoped_user.id.clone();
    let wf_id = auth.workflow().id.clone();
    let vault_key = auth.user().public_key.clone();
    let is_live = auth.user().is_live;
    let v_id = auth.user().id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<()> {
            let attestation = match new_attestation {
                NewDeviceAttestation::Apple(attestation) => attestation.create(conn.conn())?.into(),
                NewDeviceAttestation::Android(attestation) => attestation.create(conn.conn())?.into(),
            };

            save_vendor_result_and_risk_signals(conn, &attestation, &vault_key, &sv_id, &wf_id, is_live)?;

            // the attestation, in conjuction with a passkey registration, also helps us prove
            // liveness so if the device attests it registered a passkey, we can confirm liveness too!
            if attestation.webauthn_credential_id().is_some() {
                let insight_event = CreateInsightEvent::from(insight).insert_with_conn(conn)?;
                let liveness_event = NewLivenessEvent {
                    scoped_vault_id: sv_id.clone(),
                    liveness_source: attestation.liveness_source(),
                    attributes: Some(LivenessAttributes {
                        issuers: vec![LivenessIssuer::Footprint, attestation.liveness_issuer()],
                        os: attestation.metadata().os.clone(),
                        device: attestation.metadata().model.clone(),
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
                UserTimeline::create(conn, info, v_id, sv_id.clone())?;
            }

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
