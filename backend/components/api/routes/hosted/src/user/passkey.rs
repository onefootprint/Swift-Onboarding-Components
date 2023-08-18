use crate::{
    auth::user::{UserAuth, UserAuthContext},
    errors::{challenge::ChallengeError, ApiError},
    types::{response::ResponseData, EmptyResponse},
    utils::{
        challenge::{Challenge, ChallengeToken},
        headers::InsightHeaders,
        liveness::WebauthnConfig,
    },
    State,
};
use api_core::{
    auth::{user::UserAuthGuard, IsGuardMet},
    errors::ApiResult,
};
use app_attest::error::AttestationError;
use chrono::{Duration, Utc};
use crypto::sha256;
use db::models::{insight_event::CreateInsightEvent, user_timeline::UserTimeline};
use db::models::{
    liveness_event::NewLivenessEvent,
    vault::Vault,
    webauthn_credential::{NewWebauthnCredential, WebauthnCredential},
};
use macros::route_alias;
use newtypes::Base64Data;
use newtypes::{AttestationType, LivenessAttributes, LivenessInfo, LivenessIssuer};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use serde::{Deserialize, Serialize};

use serde_repr::{Deserialize_repr, Serialize_repr};
use webauthn_rs_core::{
    proto::{AttestationCaList, AttestationMetadata},
    AttestationFormat,
};
use webauthn_rs_proto::{
    AttestationConveyancePreference, AuthenticatorAttachment, COSEAlgorithm, RegisterPublicKeyCredential,
    UserVerificationPolicy,
};

/// Contains the payload for the frontend to communicate to the device via webauthn
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebAuthnInitResponse {
    // TODO do we have to explicitly convert this to JSON?
    challenge_json: String,
    challenge_token: ChallengeToken,
}

//TODO: remove alias once frontend updates
#[route_alias(post(
    "/hosted/user/biometric/init",
    tags(Hosted),
    description = "Generates a passkey registration challenge",
))]
#[api_v2_operation(description = "Generates a passkey registration challenge.", tags(Hosted))]
#[post("/hosted/user/passkey/register")]
pub async fn init_post(
    // TODO only allow registering webauthn credentials if you have no previous credentials OR if
    // you logged into this session via webauthn. Otherwise, someone who SIM swaps you can register
    // their own webauthn creds
    user_auth: UserAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<WebAuthnInitResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp.or(UserAuthGuard::Handoff))?;

    let user_vault_id = user_auth.user_vault_id().clone();
    let creds = state
        .db_pool
        .db_query(move |conn| WebauthnCredential::list(conn, &user_vault_id))
        .await??;
    if !creds.is_empty() {
        return Err(ChallengeError::BiometricCredentialAlreadyExists.into());
    }

    // generate the challenge and return it
    let webauthn = WebauthnConfig::new(&state.config);
    let vault_id = user_auth.user_vault_id();
    let (challenge, reg_state) = webauthn.webauthn().generate_challenge_register_options(
        vault_id.to_string().as_bytes(),
        "Footprint",
        "Footprint",
        AttestationConveyancePreference::Direct,
        Some(UserVerificationPolicy::Required),
        None,
        None,
        COSEAlgorithm::secure_algs(),
        false,
        Some(AuthenticatorAttachment::Platform),
        false,
    )?;

    let challenge_data = Challenge {
        expires_at: Utc::now() + Duration::minutes(5),
        data: reg_state,
    };
    let response = ResponseData::ok(WebAuthnInitResponse {
        challenge_json: serde_json::to_string(&challenge)?,
        challenge_token: challenge_data.seal(&state.challenge_sealing_key)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
pub struct WebauthnRegisterRequest {
    device_response_json: String,
    challenge_token: ChallengeToken,
    /// for iOS app clip attestation
    supplementary_attestation_data: Option<Base64Data>,
    /// the attested metadata as json
    #[serde(rename = "attested_metadata")]
    attested_metadata_json: Option<Base64Data>,
}

//TODO: remove alias once frontend updates
#[route_alias(post(
    "/hosted/user/biometric",
    tags(Hosted),
    description = "Accepts a response to a passkey registration challenge",
))]
#[api_v2_operation(
    tags(Hosted),
    description = "Accepts a response to a passkey registration challenge"
)]
#[post("/hosted/user/passkey")]
pub async fn complete_post(
    request: Json<WebauthnRegisterRequest>,
    user_auth: UserAuthContext,
    insights: InsightHeaders,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp.or(UserAuthGuard::Handoff))?;

    let challenge_data = Challenge::unseal(&state.challenge_sealing_key, &request.challenge_token)?;
    let reg_state = challenge_data.data;

    // generate the challenge and return it
    let webauthn = WebauthnConfig::new(&state.config);
    let cas = AttestationCaList::apple_and_android();

    let reg: RegisterPublicKeyCredential = serde_json::from_str(&request.device_response_json)?;

    // TEMPORARY: workaround to branch for android origin
    let cred = if is_android(&reg.response.client_data_json.0)? {
        webauthn
            .android_workaround()
            .register_credential(&reg, &reg_state, Some(&cas))?
    } else {
        webauthn
            .webauthn()
            .register_credential(&reg, &reg_state, Some(&cas))?
    };

    // this is the format of the stored attestation data
    #[derive(Debug, Serialize)]
    struct SavedAttestationMetadata {
        #[serde(rename = "s")]
        app_attestation: Option<AppAttestationMetadata>,
        #[serde(rename = "c")]
        credential_attestation: AttestationMetadata,
    }

    let mut attestation_metadata = SavedAttestationMetadata {
        app_attestation: None,
        credential_attestation: cred.attestation.metadata,
    };

    let (attestation_type, liveness_event_attributes) = match cred.attestation_format {
        AttestationFormat::AppleAnonymous => (
            AttestationType::Apple,
            Some(LivenessAttributes {
                issuers: vec![LivenessIssuer::Apple, LivenessIssuer::Footprint],
                ..Default::default()
            }),
        ),
        AttestationFormat::AndroidKey => (
            AttestationType::AndroidKey,
            Some(LivenessAttributes {
                issuers: vec![LivenessIssuer::Google, LivenessIssuer::Footprint],
                metadata: Some(serde_json::to_value(
                    &attestation_metadata.credential_attestation,
                )?),
                ..Default::default()
            }),
        ),
        AttestationFormat::AndroidSafetyNet => (
            AttestationType::AndroidSafetyNet,
            Some(LivenessAttributes {
                issuers: vec![LivenessIssuer::Google, LivenessIssuer::Footprint],
                metadata: Some(serde_json::to_value(
                    &attestation_metadata.credential_attestation,
                )?),
                ..Default::default()
            }),
        ),
        AttestationFormat::None => {
            // this is our work around for supplementary app-based attestation
            let metadata_json = request
                .attested_metadata_json
                .as_ref()
                .map(|b| b.0.as_slice())
                .unwrap_or(b"");

            match &request.supplementary_attestation_data {
                Some(app_attest) => {
                    try_attest_apple_app_attestation(&reg, metadata_json, app_attest.as_ref())
                        .map_err(|err| {
                            tracing::error!(error=?err, "failed to verify app attestation");
                        })
                        .map(|att| {
                            let metadata = match &att {
                                AppAttestationMetadata::Apple { metadata, .. } => metadata,
                            };

                            let attributes = LivenessAttributes {
                                issuers: vec![LivenessIssuer::Apple, LivenessIssuer::Footprint],
                                metadata: serde_json::to_value(metadata).ok(),
                                os: metadata.os.clone(),
                                device: metadata.model.clone(),
                            };
                            // store the metadata
                            attestation_metadata.app_attestation = Some(att);

                            // return the verified type
                            (AttestationType::AppleApp, Some(attributes))
                        })
                        .unwrap_or((AttestationType::None, None))
                }
                None => (AttestationType::None, None),
            }
        }
        _ => (AttestationType::Unknown, None),
    };

    tracing::info!(attestation=?attestation_metadata, "attestation details");

    let attestation_data = serde_cbor::to_vec(&attestation_metadata)?;
    let public_key = crypto::serde_cbor::to_vec(&cred.cred).map_err(crypto::Error::Cbor)?;

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            // Protect against someone adding a webauthn credential while we verify that there's
            // only one
            Vault::lock(conn, user_auth.user_vault_id())?;
            let creds = WebauthnCredential::list(conn, user_auth.user_vault_id())?;
            if !creds.is_empty() {
                return Err(ChallengeError::BiometricCredentialAlreadyExists.into());
            }

            let insight_event = CreateInsightEvent::from(insights).insert_with_conn(conn)?;

            // if we're in an onboarding, optimisticaly try to submit a liveness event if the webauthn
            // attestation gives liveness
            if let Some(su_id) = user_auth.scoped_user_id() {
                let liveness_event = if let Some(attributes) = liveness_event_attributes {
                    NewLivenessEvent {
                        scoped_vault_id: su_id.clone(),
                        liveness_source: newtypes::LivenessSource::WebauthnAttestation,
                        attributes: Some(attributes),
                        insight_event_id: Some(insight_event.id.clone()),
                    }
                    .insert(conn)?
                } else {
                    // TODO: remove this
                    // RELATED: FP-1802 and FP-1800
                    // this is only for backwards compatibility in order to
                    // maintain the mechanics that webauthn -> liveness
                    // we should update this such that liveness is skipped via API call
                    NewLivenessEvent {
                        scoped_vault_id: su_id.clone(),
                        liveness_source: newtypes::LivenessSource::WebauthnAttestation,
                        attributes: None,
                        insight_event_id: Some(insight_event.id.clone()),
                    }
                    .insert(conn)?
                };

                // create the timeline event for a liveness
                let info = LivenessInfo {
                    id: liveness_event.id,
                };
                UserTimeline::create(conn, info, user_auth.user_vault_id().clone(), su_id)?;
            }

            let _ = NewWebauthnCredential {
                vault_id: user_auth.user_vault_id().clone(),
                credential_id: cred.cred_id.0,
                public_key,
                attestation_data,
                backup_eligible: cred.backup_eligible,
                backup_state: cred.backup_state,
                attestation_type,
                insight_event_id: insight_event.id,
            }
            .save(conn)?;

            Ok(())
        })
        .await?;

    Ok(Json(EmptyResponse::ok()))
}

/// Storable app attestation metadata
/// TODO: move this struct to newtypes for use later
#[derive(Debug, Clone, Serialize)]
enum AppAttestationMetadata {
    Apple {
        is_development: bool,
        receipt: Vec<u8>,
        metadata: AppleDeviceMetadata,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AppleDeviceMetadata {
    location_match: LocationMatchType,
    model: Option<String>,
    os: Option<String>,
}

#[allow(non_camel_case_types)]
#[derive(Debug, PartialEq, Clone, Copy, Serialize_repr, Deserialize_repr, Apiv2Schema)]
#[repr(u8)]
enum LocationMatchType {
    Unknown = 0,
    NoMatch = 1,
    Match = 2,
}

/// Our internal method of combining an attestation Apple's DeviceCheck
/// framework with that of the corresponding webauthn challenge to bind the
/// credential to the attested device (PassKeys are not attested currently due to iOS bug)
fn try_attest_apple_app_attestation(
    credential: &RegisterPublicKeyCredential,
    device_metadata_json_bytes: &[u8],
    app_attestation: &[u8],
) -> Result<AppAttestationMetadata, AttestationError> {
    let verifier = app_attest::apple::AppleAppAttestationVerifier::new_default_ca(vec![
        "5F264K8AG4.com.onefootprint.my",
        "5F264K8AG4.com.onefootprint.my.live",
        "C246BC89CJ.in.alexgr.FootprintVerify",
        "C246BC89CJ.in.alexgr.FootprintVerify.Clip",
    ])?; // todo: move App IDs to config

    // composite client data from webauthn data + location type
    let client_data = vec![
        credential.response.client_data_json.as_ref(),
        credential.response.attestation_object.as_ref(),
        device_metadata_json_bytes,
    ]
    .into_iter()
    .map(sha256)
    .collect::<Vec<[u8; 32]>>()
    .concat();

    let verified = verifier.attest(&client_data, app_attestation)?;

    let metadata: AppleDeviceMetadata =
        serde_json::from_slice(device_metadata_json_bytes)
            .ok()
            .unwrap_or(AppleDeviceMetadata {
                location_match: LocationMatchType::Unknown,
                model: None,
                os: None,
            });

    Ok(AppAttestationMetadata::Apple {
        is_development: verified.is_development,
        receipt: verified.receipt,
        metadata,
    })
}

/// currently android likely has a bug with the wrong origin
/// so we have a heuristic to check that here
fn is_android(client_data_json: &[u8]) -> ApiResult<bool> {
    Ok(serde_json::from_slice::<serde_json::Value>(client_data_json)?
        .as_object()
        .map(|map| map.get("androidPackageName").is_some())
        .unwrap_or(false))
}

#[cfg(test)]
mod tests {
    use api_core::utils::liveness::WebauthnConfig;

    use super::{is_android, try_attest_apple_app_attestation, WebauthnRegisterRequest};

    #[test]
    fn test_app_attest() {
        let json = serde_json::json!(
            {"supplementary_attestation_data":"o2NmbXRvYXBwbGUtYXBwYXR0ZXN0Z2F0dFN0bXSiY3g1Y4JZAuUwggLhMIICZ6ADAgECAgYBgf1nYYwwCgYIKoZIzj0EAwIwTzEjMCEGA1UEAwwaQXBwbGUgQXBwIEF0dGVzdGF0aW9uIENBIDExEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwHhcNMjIwNzEzMTU1MDE5WhcNMjMwMTE2MTcxNTE5WjCBkTFJMEcGA1UEAwxAOTIwMGRmYmY5MWJkOWI0ZTViMDE3MzYxODgxMjk0YTFkMTBiN2QwYTc3OGRkNTkyYjA3MTQxNDlhNjhlZGI2NjEaMBgGA1UECwwRQUFBIENlcnRpZmljYXRpb24xEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARDlXf-we4lPa8cuNpz_JUmuW9tAzD2J26AzL367HZ6XojE0ZiAioc-GSRJw2ckNhDqYMnTnbK9DYmd7iWR5BNHo4HrMIHoMAwGA1UdEwEB_wQCMAAwDgYDVR0PAQH_BAQDAgTwMHgGCSqGSIb3Y2QIBQRrMGmkAwIBCr-JMAMCAQG_iTEDAgEAv4kyAwIBAb-JMwMCAQG_iTQgBB41RjI2NEs4QUc0LmNvbS5vbmVmb290cHJpbnQubXmlBgQEc2tzIL-JNgMCAQW_iTcDAgEAv4k5AwIBAL-JOgMCAQAwGQYJKoZIhvdjZAgHBAwwCr-KeAYEBDE2LjAwMwYJKoZIhvdjZAgCBCYwJKEiBCBtnQYcDjNX-CMnu81WNZGDg-hICUF71n-RZm1EAK77ODAKBggqhkjOPQQDAgNoADBlAjBCHs6tnRIWRbFzOklE3r9PPBfS-0uelovE_tABwICYfBhZhmRp4wIIctmyQ0s4JxwCMQCqjU3r7mmG-RCcwck3J_A3Yra1ClUmRfaNGLwJxKxgkjfmeoak079XQl-UxaTE0W1ZAkcwggJDMIIByKADAgECAhAJusXhvEAa2dRTlbw4GghUMAoGCCqGSM49BAMDMFIxJjAkBgNVBAMMHUFwcGxlIEFwcCBBdHRlc3RhdGlvbiBSb290IENBMRMwEQYDVQQKDApBcHBsZSBJbmMuMRMwEQYDVQQIDApDYWxpZm9ybmlhMB4XDTIwMDMxODE4Mzk1NVoXDTMwMDMxMzAwMDAwMFowTzEjMCEGA1UEAwwaQXBwbGUgQXBwIEF0dGVzdGF0aW9uIENBIDExEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAASuWzegd015sjWPQOfR8iYm8cJf7xeALeqzgmpZh0_40q0VJXiaomYEGRJItjy5ZwaemNNjvV43D7-gjjKegHOphed0bqNZovZvKdsyr0VeIRZY1WevniZ-smFNwhpmzpmjZjBkMBIGA1UdEwEB_wQIMAYBAf8CAQAwHwYDVR0jBBgwFoAUrJEQUzO9vmhB_6cMqeX66uXliqEwHQYDVR0OBBYEFD7jXRwEGanJtDH4hHTW4eFXcuObMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNpADBmAjEAu76IjXONBQLPvP1mbQlXUDW81ocsP4QwSSYp7dH5FOh5mRya6LWu-NOoVDP3tg0GAjEAqzjt0MyB7QCkUsO6RPmTY2VT_swpfy60359evlpKyraZXEuCDfkEOG94B7tYlDm3Z3JlY2VpcHRZDlIwgAYJKoZIhvcNAQcCoIAwgAIBATEPMA0GCWCGSAFlAwQCAQUAMIAGCSqGSIb3DQEHAaCAJIAEggPoMYIEDDAmAgECAgEBBB41RjI2NEs4QUc0LmNvbS5vbmVmb290cHJpbnQubXkwggLvAgEDAgEBBIIC5TCCAuEwggJnoAMCAQICBgGB_WdhjDAKBggqhkjOPQQDAjBPMSMwIQYDVQQDDBpBcHBsZSBBcHAgQXR0ZXN0YXRpb24gQ0EgMTETMBEGA1UECgwKQXBwbGUgSW5jLjETMBEGA1UECAwKQ2FsaWZvcm5pYTAeFw0yMjA3MTMxNTUwMTlaFw0yMzAxMTYxNzE1MTlaMIGRMUkwRwYDVQQDDEA5MjAwZGZiZjkxYmQ5YjRlNWIwMTczNjE4ODEyOTRhMWQxMGI3ZDBhNzc4ZGQ1OTJiMDcxNDE0OWE2OGVkYjY2MRowGAYDVQQLDBFBQUEgQ2VydGlmaWNhdGlvbjETMBEGA1UECgwKQXBwbGUgSW5jLjETMBEGA1UECAwKQ2FsaWZvcm5pYTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABEOVd_7B7iU9rxy42nP8lSa5b20DMPYnboDMvfrsdnpeiMTRmICKhz4ZJEnDZyQ2EOpgydOdsr0NiZ3uJZHkE0ejgeswgegwDAYDVR0TAQH_BAIwADAOBgNVHQ8BAf8EBAMCBPAweAYJKoZIhvdjZAgFBGswaaQDAgEKv4kwAwIBAb-JMQMCAQC_iTIDAgEBv4kzAwIBAb-JNCAEHjVGMjY0SzhBRzQuY29tLm9uZWZvb3RwcmludC5teaUGBARza3Mgv4k2AwIBBb-JNwMCAQC_iTkDAgEAv4k6AwIBADAZBgkqhkiG92NkCAcEDDAKv4p4BgQEMTYuMDAzBgkqhkiG92NkCAIEJjAkoSIEIG2dBhwOM1f4Iye7zVY1kYOD6EgJQXvWf5FmbUQArvs4MAoGCCqGSM49BAMCA2gAMGUCMEIezq2dEhZFsXM6SUTev088F9L7S56Wi8T-0AHAgJh8GFmGZGnjAghy2bJDSzgnHAIxAKqNTevuaYb5EJzByTcn8DditrUKVSZF9o0YvAnErGCSN-Z6hqTTv1dCX5TFpMTRbTAoAgEEAgEBBCDmegOG4AJS0O7tUzIfOSjWanIFTrEvCxbEJIk1QcNpqDBgAgEFAgEBBFg1Sm5MNHMwbGRuU0hNNHlxdHdDelRZYzZud1BnSDIva3RzbThUOXFUWjJRUzlSc0hwWmtWbUQwNnNpUXJiSXZvb0s3Slhwd3JMZkVqWWExUUdpV0JHUT09MA4CAQYCAQEEBkFUVEVTVDAPAgEHAgEBBAdzYW5kYm94MCACAQwCAQEEGDIwMjItMDctMTRUMTU6NTA6MQQoOS43OTNaMCACARUCAQEEGDIwMjItMTAtMTJUMTU6NTA6MTkuNzkzWgAAAAAAAKCAMIIDrjCCA1SgAwIBAgIQCTm0vOkMw6GBZTY3L2ZxQTAKBggqhkjOPQQDAjB8MTAwLgYDVQQDDCdBcHBsZSBBcHBsaWNhdGlvbiBJbnRlZ3JhdGlvbiBDQSA1IC0gRzExJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzAeFw0yMjA0MTkxMzMzMDNaFw0yMzA1MTkxMzMzMDJaMFoxNjA0BgNVBAMMLUFwcGxpY2F0aW9uIEF0dGVzdGF0aW9uIEZyYXVkIFJlY2VpcHQgU2lnbmluZzETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQ51PmqmxzERdZbphes8sCE7G8HCNWQFKDnbs897jmZqUxr-wFVEFVVZGzajiPgJgEUAtB-E7lUH9i01lfYLpN4o4IB2DCCAdQwDAYDVR0TAQH_BAIwADAfBgNVHSMEGDAWgBTZF_5LZ5A4S5L0287VV4AUC489yTBDBggrBgEFBQcBAQQ3MDUwMwYIKwYBBQUHMAGGJ2h0dHA6Ly9vY3NwLmFwcGxlLmNvbS9vY3NwMDMtYWFpY2E1ZzEwMTCCARwGA1UdIASCARMwggEPMIIBCwYJKoZIhvdjZAUBMIH9MIHDBggrBgEFBQcCAjCBtgyBs1JlbGlhbmNlIG9uIHRoaXMgY2VydGlmaWNhdGUgYnkgYW55IHBhcnR5IGFzc3VtZXMgYWNjZXB0YW5jZSBvZiB0aGUgdGhlbiBhcHBsaWNhYmxlIHN0YW5kYXJkIHRlcm1zIGFuZCBjb25kaXRpb25zIG9mIHVzZSwgY2VydGlmaWNhdGUgcG9saWN5IGFuZCBjZXJ0aWZpY2F0aW9uIHByYWN0aWNlIHN0YXRlbWVudHMuMDUGCCsGAQUFBwIBFilodHRwOi8vd3d3LmFwcGxlLmNvbS9jZXJ0aWZpY2F0ZWF1dGhvcml0eTAdBgNVHQ4EFgQU-2fTDb9zt5KmJl1IjSzBHZXic_gwDgYDVR0PAQH_BAQDAgeAMA8GCSqGSIb3Y2QMDwQCBQAwCgYIKoZIzj0EAwIDSAAwRQIhAJSQoGc3c-cveCk2diO43VHXyJoJ6rsA45xuRQsFWAvQAiBHNBor0TzAVKgKOqrMPMFFfABUUxjqM419bdX2CyuHLjCCAvkwggJ_oAMCAQICEFb7g9Qr_43DN5kjtVqubr0wCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTkwMzIyMTc1MzMzWhcNMzQwMzIyMDAwMDAwWjB8MTAwLgYDVQQDDCdBcHBsZSBBcHBsaWNhdGlvbiBJbnRlZ3JhdGlvbiBDQSA1IC0gRzExJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABJLOY719hrGrKAo7HOGv-wSUgJGs9jHfpssoNW9ES-Eh5VfdEo2NuoJ8lb5J-r4zyq7NBBnxL0Ml-vS-s8uDfrqjgfcwgfQwDwYDVR0TAQH_BAUwAwEB_zAfBgNVHSMEGDAWgBS7sN6hWDOImqSKmd6-veuv2sskqzBGBggrBgEFBQcBAQQ6MDgwNgYIKwYBBQUHMAGGKmh0dHA6Ly9vY3NwLmFwcGxlLmNvbS9vY3NwMDMtYXBwbGVyb290Y2FnMzA3BgNVHR8EMDAuMCygKqAohiZodHRwOi8vY3JsLmFwcGxlLmNvbS9hcHBsZXJvb3RjYWczLmNybDAdBgNVHQ4EFgQU2Rf-S2eQOEuS9NvO1VeAFAuPPckwDgYDVR0PAQH_BAQDAgEGMBAGCiqGSIb3Y2QGAgMEAgUAMAoGCCqGSM49BAMDA2gAMGUCMQCNb6afoeDk7FtOc4qSfz14U5iP9NofWB7DdUr-OKhMKoMaGqoNpmRt4bmT6NFVTO0CMGc7LLTh6DcHd8vV7HaoGjpVOz81asjF5pKw4WG-gElp5F8rqWzhEQKqzGHZOLdzSjCCAkMwggHJoAMCAQICCC3F_IjSxUuVMAoGCCqGSM49BAMDMGcxGzAZBgNVBAMMEkFwcGxlIFJvb3QgQ0EgLSBHMzEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTE0MDQzMDE4MTkwNloXDTM5MDQzMDE4MTkwNlowZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAASY6S89QHKk7ZMicoETHN0QlfHFo05x3BQW2Q7lpgUqd2R7X04407scRLV_9R-2MmJdyemEW08wTxFaAP1YWAyl9Q8sTQdHE3Xal5eXbzFc7SudeyA72LlU2V6ZpDpRCjGjQjBAMB0GA1UdDgQWBBS7sN6hWDOImqSKmd6-veuv2sskqzAPBgNVHRMBAf8EBTADAQH_MA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjEAg-nBxBZeGl00GNnt7_RsDgBGS7jfskYRxQ_95nqMoaZrzsID1Jz1k8Z0uGrfqiMVAjBtZooQytQN1E_NjUM-tIpjpTNu423aF7dkH8hTJvmIYnQ5Cxdby1GoDOgYA-eisigAADGB_TCB-gIBATCBkDB8MTAwLgYDVQQDDCdBcHBsZSBBcHBsaWNhdGlvbiBJbnRlZ3JhdGlvbiBDQSA1IC0gRzExJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUwIQCTm0vOkMw6GBZTY3L2ZxQTANBglghkgBZQMEAgEFADAKBggqhkjOPQQDAgRHMEUCIQDN_f4T1NHsyT472s7sDOeRkbEm8cbLSACAvjpDdrkjTQIgVzUv2I3jtMnzMVXfhkd24CbTzUMCBZfC-FuTTFfT88sAAAAAAABoYXV0aERhdGFYpCYD5Qu9eDoEc0tMe31wTgPpO4Bzu792qkqfE3K3b2GkQAAAAABhcHBhdHRlc3RkZXZlbG9wACCSAN-_kb2bTlsBc2GIEpSh0Qt9CneN1ZKwcUFJpo7bZqUBAgMmIAEhWCBDlXf-we4lPa8cuNpz_JUmuW9tAzD2J26AzL367HZ6XiJYIIjE0ZiAioc-GSRJw2ckNhDqYMnTnbK9DYmd7iWR5BNH","attested_metadata":"eyJtb2RlbCI6ImlQaG9uZSAxMyBQcm8gTWF4IiwibG9jYXRpb25fbWF0Y2giOjAsIm9zIjoiMTYuMCJ9","device_response_json":"{\"rawId\":\"MsIIoo1qIY2qhHBBZ8dfi_e-Bp0\",\"id\":\"MsIIoo1qIY2qhHBBZ8dfi_e-Bp0\",\"response\":{\"attestationObject\":\"o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViY5pQ6pn_-Ct5rzO2iKgJ1Ni__jbZC0rRle3i_CQSu5AhdAAAAAAAAAAAAAAAAAAAAAAAAAAAAFDLCCKKNaiGNqoRwQWfHX4v3vgadpQECAyYgASFYIFyNB5rfc2O9r7gsyGvL5gqL6hh2X63m7_d-da-yWNzKIlggYLDRNwjiiM9hc9RUqQTXrr4WTntQTnYpcmvUEsmOB2I\",\"clientDataJSON\":\"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiNkJpaVBrZ2QzUjQ3NHc2RGlwai1Lc3VnZDByWVdub0l2U0xOYk5WeFVTYyIsIm9yaWdpbiI6Imh0dHBzOi8vb25lZm9vdHByaW50LmNvbSJ9\"},\"type\":\"public-key\"}","challenge_token":"omFumBgVGNQYxxixDBguBRggGEMYqhgZGCYYcRipGHsOGJcYbRghGO0YSBjxGGERYWOZASQY3BigGPIY9xiWGNYYvBYY5hjYGH8YkxicAxg-GBoKGDgYdRiKGDsYLBi9GIwYmBinGDwYXhjiGC8YtRhKGKEYcxhwGH4YnAUY8BiQFhiPBBiIGGUYsAYYmBhiGNEYPRg-GNUYKxgpGPcY1hMY3hhnGNIMGNMYGhhwGEEYkRhUGCUYtxjLCBjOGCoYfxjBGHEYdhh-CRiGGMMYkBgaGN4Yohg2GPQMGB0YkhjxGM0Y1xjNGIsIGNYY1RjYGB4YGRiwGPcYehgxGPcYrhiVGOMYzxg-GHYYXRikGH4UGNcYtxjCGNUYoRgtGP0YKRgzCBjFGKgNGJAY5xhlEBh5GPIYhhipGPQY5xjaGKAYNBiXGFgY3hiMGLsFGNsYpRh4GBgYSBUYdhjvGO0YbBg-GP0YiBh1GOEY7hiGGIYYcBh7GL0Y-xjSGPcYwxhuGHQYgRjcGBsYqQgYbhj6GNMYWhiUGGwY1gcY2hjvGGUY7xhdGNMYaBgeGGIYkRiQGHkY7xjBGEIYaBjAGDkYhhixGOkYvBjCGO0Y2xiCGGoYfhjsGEkJGHsYNBgyGM0YxRimGJUYlRUY_QwYsxgdGCoYNxi3GNUYvwIYYRg1GNsYYRjvGPgYaA8Y1BhmGLwYgBh0GJYAGFcYrxijGKAYkRibGP0Yjxg-GIcDGLsYPBg6GFwYcRhSGNAYdhh3AxjWGL0YqhhVGC4YHRiuGI8YVRg-GJYY3xi_GHgYzhh2GFU"}
        );
        let request: WebauthnRegisterRequest = serde_json::from_value(json).expect("invalid json");
        let reg: webauthn_rs_proto::RegisterPublicKeyCredential =
            serde_json::from_str(&request.device_response_json).expect("invalid inner json");

        let att = try_attest_apple_app_attestation(
            &reg,
            &request.attested_metadata_json.unwrap().0,
            request
                .supplementary_attestation_data
                .expect("missing attest data")
                .as_ref(),
        )
        .expect("failed to attest");

        match att {
            super::AppAttestationMetadata::Apple {
                is_development,
                receipt: _,
                metadata,
            } => {
                assert!(is_development);
                assert_eq!(metadata.model.unwrap(), "iPhone 13 Pro Max");
                assert_eq!(metadata.os.unwrap(), "16.0");
            }
        };
    }

    #[test]
    fn test_android_origin_workaround() {
        let json = serde_json::json!({
          "rawId": "ASgOR9O1Yuy2GP/QxpzTezkQbtSePp7kA7nVNk9Gd33RYgFjylr9PqXCBs5DN4w+/k0toSOhW3SWwHEYgL1u5Ks=",
          "id": "ASgOR9O1Yuy2GP/QxpzTezkQbtSePp7kA7nVNk9Gd33RYgFjylr9PqXCBs5DN4w+/k0toSOhW3SWwHEYgL1u5Ks=",
          "type": "public-key",
          "response": {
            "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWkdJWmV2aTVOX0pHR2Z6dXpiM2ltRFYxY3g1Vm45amtDeW43aDNSQ0VsOCIsIm9yaWdpbiI6ImFuZHJvaWQ6YXBrLWtleS1oYXNoOkRfd29LRmFQMXllUnRoZFZPS3JEMDNsMUR4NnhLamd2N2NDb0UxM1VYY2ciLCJhbmRyb2lkUGFja2FnZU5hbWUiOiJjb20ub25lZm9vdHByaW50Lm15In0",
            "attestationObject": "o2NmbXRxYW5kcm9pZC1zYWZldHluZXRnYXR0U3RtdKJjdmVyaTIzMzAxMzA0NGhyZXNwb25zZVkhYWV5SmhiR2NpT2lKU1V6STFOaUlzSW5nMVl5STZXeUpOU1VsR1lsUkRRMEpHVjJkQmQwbENRV2RKVVdWbFVVMU1lSEJJT0RselUyTlRUMEowYmsxVGVXcEJUa0puYTNGb2EybEhPWGN3UWtGUmMwWkJSRUpIVFZGemQwTlJXVVJXVVZGSFJYZEtWbFY2UldsTlEwRkhRVEZWUlVOb1RWcFNNamwyV2pKNGJFbEdVbmxrV0U0d1NVWk9iR051V25CWk1sWjZTVVY0VFZGNlJWUk5Ra1ZIUVRGVlJVRjRUVXRTTVZKVVNVVk9Ra2xFUmtWT1JFRmxSbmN3ZVUxNlFURk5la0YzVDBSRmQwNVVhR0ZHZHpCNVRYcEJORTFxWjNkUFJFVjNUbFJrWVUxQ01IaEhla0ZhUW1kT1ZrSkJUVlJGYlVZd1pFZFdlbVJETldoaWJWSjVZakpzYTB4dFRuWmlWRU5EUVZOSmQwUlJXVXBMYjFwSmFIWmpUa0ZSUlVKQ1VVRkVaMmRGVUVGRVEwTkJVVzlEWjJkRlFrRktWRlUyUjJwSVpHUlBjWE50UzNNNVRsWjRXbUZ0VEd4c1FsSjVLelZGYlhreE9HNVpXa05aVUZWVE9ITlRNekpJVTBGTVkwcHhibFJEYkVwWGRFeGtOaTlvWlc4MFYzcEpWbEJGYUZWVVdrWkRkRGgyYTNFdmFVWllUbWhMWWsxVVMwRTFVUzlPU0RReldFWjFWRmhXY0U0M09HOTZhbU5TTlhwVWFEaEJOUzltUm1GM2RERlVaMloxVTJzM05WVkhNekp1V1RjNVZVdG5lbE5MVUdaYWExaHJNVUY0TUVRNVJUbHBWRzFPTjJScGNrdHZUVzlDVlZGT1FrOUxSRWRyUVdsdU4zbENUa1JJVVc0M1EwNTNVemRHUWxvcllWSllVR1Y2YmxOM2VYQm1TMFJqZG1KUk9Vd3daM3ByUTIxUldXTlFkbWRzZWpWVGJHdDBaQ3RoV1c4M2RrUnJRalo0UzNCTlpEWnhORGhETWl0cmVUTjNTVkp0UVVwMlFtTnpPR0pST1dWSFoxQlJZMDVxVG10NlRVdDNaVU0xTWk5R1ZVTjJRbWx5VkRKT1ZrWmFRMFZKWkcxTlp6bDRZakJMZURWMFVqQkRRWGRGUVVGaFQwTkJialIzWjJkS05rMUJORWRCTVZWa1JIZEZRaTkzVVVWQmQwbEdiMFJCVkVKblRsWklVMVZGUkVSQlMwSm5aM0pDWjBWR1FsRmpSRUZVUVUxQ1owNVdTRkpOUWtGbU9FVkJha0ZCVFVJd1IwRXhWV1JFWjFGWFFrSlVVRkZTU1hORGVDOHpORmxPYnpGSk0yRndTMWxOYnpobVFtOXFRV1pDWjA1V1NGTk5SVWRFUVZkblFsRnNOR2huVDNOc1pWSnNRM0pzTVVZeVIydEpVR1ZWTjA4MGEycENOMEpuWjNKQ1owVkdRbEZqUWtGUlVuWk5SekIzVDBGWlNVdDNXVUpDVVZWSVRVRkhSMHhIYURCa1NFRTJUSGs1ZGxrelRuZE1ia0p5WVZNMWJtSXlPVzVNTTAxMldqTlNlazFYVVRCaFZ6VXdUREJLVlZOWFRtcFNSa1o2WVVWU1VrMUVSVWREUTNOSFFWRlZSa0o2UVVOb2FWWnZaRWhTZDA5cE9IWmpSM1J3VEcxa2RtSXlZM1pqYlZaM1luazVhbHBZU2pCamVUbHVaRWhOZUZwRVVYVmFSMVo1VFVJd1IwRXhWV1JGVVZGWFRVSlRRMFZ0UmpCa1IxWjZaRU0xYUdKdFVubGlNbXhyVEcxT2RtSlVRV2hDWjA1V1NGTkJSVWRxUVZsTlFXZEhRbTFsUWtSQlJVTkJWRUZOUW1kdmNrSm5SVVZCWkZvMVFXZFZSRTFFT0VkQk1WVmtTSGRSTkUxRVdYZE9TMEY1YjBSRFIweHRhREJrU0VFMlRIazVhbU50ZUhwTWJrSnlZVk0xYm1JeU9XNU1NbVF3WTNwR2EwNUhiSFZrUXpsWlRXdHZlVk5JU21aT01VSndWRk0xYW1OdGQzZG5aMFZFUW1kdmNrSm5SVVZCWkZvMVFXZFJRMEpKU0RCQ1NVaDRRVTg0UVdSUlEzUTVOemMyWmxBNFVYbEpkV1JRV25kbFVHaG9jWFJIWTNCWVl5dDRSRU5VUzJoWldUQTJPWGxEYVdkQlFVRlphSEkzVFRCTFFVRkJSVUYzUWtkTlJWRkRTVWR4TkhwUFpVNVpOMEV2ZFhKMlRsWTJjWFp4VlVrMGJYRmhVelZ0VkVvd2RGRXdOalppVlZoNWEwUkJhVUo0U1UxeUwwSlRTVnBrTDFCVU5tZHBSQ3Q1UTNWSVJHVktkVWxEYzBsS2JuZHRWRGhhTkhwd2N5OTNRakpCVEU1NlpIZG1hR2hHUkRSWk5HSlhRbUZ1WTBWUmJFdGxVeko0V25kM1RHZzVlbmRCZHpVMVRuRlhZVUZCUVVKcFIzWnplVk4zUVVGQlVVUkJSV04zVWxGSloyWnlTa2RTVjIwMlUwbG9lRFEzUkd4R0t6bFZiVU56WlVWRU9YSjJPVTFTU2xZeFExSTBPVGhhZFhORFNWRkRRV3R0TWpkQlFrcGhLMWxTUVhremVHOHpNWGx5ZHpCT2Nsb3hOalJVUXpjNUwzcGtSWEJWTkhCYWFrRk9RbWRyY1docmFVYzVkekJDUVZGelJrRkJUME5CVVVWQlkzTmtiV0pUV0UwdldYQldOalZCUXpsUVduUktlR0paTlUxemVFSkRSa05rTTJOV01sUkpNaklyWTJndmIxRjRLMmRCUkZGbE1tSnliV3MzYWxoRkx6UkhPV3BLUTA0dmRtOWxZbXgwVEVaV1NXNXNhRGgyVkZsbVJrNXhaMDl6TkZwRlduSTBTRTFIWkhaRWJWVmlVRUZ0ZDB4YVNrWTBWVVU1TjAxR1V6QXdZMmQ1TldGWWVYVmFiVFZJWlhBdmJEQjNTVEJGV1ZBM09FNW5VRmgxVWpsemEyNUhaa2N4YUN0elFUTjFUVVFyUnl0c2NrSnVkWGQzVGxodk1FVndaMjVDZDJ3NFowWlVkbVJLVEVKelVtSkRhRmxRVkZSUWNIQklVbk55VVZFNFZFUkRlVmxHVXk5elZTOVpOekJOTkRBMk1rUm9NM0l4SzJaQmJ5OUNPVFZ3ZEZOVVRtTnBkVXhyU0M5VFIwZFlVVUZ5VHk5eEsyMU1kRmg1U1VOb1NtWlNVRWd6WWtKU0syVmtXWFpTVkRWRFNVa3ZRak14YlVOdmFuZHFSMjU0VDNkamJXUjNRVXhZU3pJNFZFazRWMnRYTVdOUlBUMGlMQ0pOU1VsR2FrUkRRMEV6VTJkQmQwbENRV2RKVGtGblEwOXpaMGw2VG0xWFRGcE5NMkp0ZWtGT1FtZHJjV2hyYVVjNWR6QkNRVkZ6UmtGRVFraE5VWE4zUTFGWlJGWlJVVWRGZDBwV1ZYcEZhVTFEUVVkQk1WVkZRMmhOV2xJeU9YWmFNbmhzU1VaU2VXUllUakJKUms1c1kyNWFjRmt5Vm5wSlJYaE5VWHBGVlUxQ1NVZEJNVlZGUVhoTlRGSXhVbFJKUmtwMllqTlJaMVZxUlhkSWFHTk9UV3BCZDA5RVJYcE5SRUYzVFVSUmVWZG9ZMDVOYW1OM1QxUk5kMDFFUVhkTlJGRjVWMnBDUjAxUmMzZERVVmxFVmxGUlIwVjNTbFpWZWtWcFRVTkJSMEV4VlVWRGFFMWFVakk1ZGxveWVHeEpSbEo1WkZoT01FbEdUbXhqYmxwd1dUSldla2xGZUUxUmVrVlVUVUpGUjBFeFZVVkJlRTFMVWpGU1ZFbEZUa0pKUkVaRlRrUkRRMEZUU1hkRVVWbEtTMjlhU1doMlkwNUJVVVZDUWxGQlJHZG5SVkJCUkVORFFWRnZRMmRuUlVKQlMzWkJjWEZRUTBVeU4yd3dkemw2UXpoa1ZGQkpSVGc1WWtFcmVGUnRSR0ZITjNrM1ZtWlJOR01yYlU5WGFHeFZaV0pWVVhCTE1IbDJNbkkyTnpoU1NrVjRTekJJVjBScVpYRXJia3hKU0U0eFJXMDFhalp5UVZKYWFYaHRlVkpUYW1oSlVqQkxUMUZRUjBKTlZXeGtjMkY2ZEVsSlNqZFBNR2N2T0RKeGFpOTJSMFJzTHk4emREUjBWSEY0YVZKb1RGRnVWRXhZU21SbFFpc3lSR2hyWkZVMlNVbG5lRFozVGpkRk5VNWpWVWd6VW1OelpXcGpjV280Y0RWVGFqRTVka0p0Tm1reFJtaHhURWQ1YldoTlJuSnZWMVpWUjA4emVIUkpTRGt4WkhObmVUUmxSa3RqWmt0V1RGZExNMjh5TVRrd1VUQk1iUzlUYVV0dFRHSlNTalZCZFRSNU1XVjFSa3B0TWtwTk9XVkNPRFJHYTNGaE0ybDJjbGhYVldWV2RIbGxNRU5SWkV0MmMxa3lSbXRoZW5aNGRIaDJkWE5NU25wTVYxbElhelUxZW1OU1FXRmpSRUV5VTJWRmRFSmlVV1pFTVhGelEwRjNSVUZCWVU5RFFWaFpkMmRuUm5sTlFUUkhRVEZWWkVSM1JVSXZkMUZGUVhkSlFtaHFRV1JDWjA1V1NGTlZSVVpxUVZWQ1oyZHlRbWRGUmtKUlkwUkJVVmxKUzNkWlFrSlJWVWhCZDBsM1JXZFpSRlpTTUZSQlVVZ3ZRa0ZuZDBKblJVSXZkMGxDUVVSQlpFSm5UbFpJVVRSRlJtZFJWVXBsU1ZsRWNrcFlhMXBSY1RWa1VtUm9jRU5FTTJ4UGVuVktTWGRJZDFsRVZsSXdha0pDWjNkR2IwRlZOVXM0Y2twdVJXRkxNR2R1YUZNNVUxcHBlblk0U1d0VVkxUTBkMkZCV1VsTGQxbENRbEZWU0VGUlJVVllSRUpoVFVOWlIwTkRjMGRCVVZWR1FucEJRbWhvY0c5a1NGSjNUMms0ZG1JeVRucGpRelYzWVRKcmRWb3lPWFphZVRsdVpFaE9lVTFVUVhkQ1oyZHlRbWRGUmtKUlkzZEJiMWxyWVVoU01HTkViM1pNTTBKeVlWTTFibUl5T1c1TU0wcHNZMGM0ZGxreVZubGtTRTEyV2pOU2VtTnFSWFZhUjFaNVRVUlJSMEV4VldSSWQxRjBUVU56ZDB0aFFXNXZRMWRIU1RKb01HUklRVFpNZVRscVkyMTNkV05IZEhCTWJXUjJZakpqZGxvelVucGpha1YyV2pOU2VtTnFSWFZaTTBwelRVVXdSMEV4VldSSlFWSkhUVVZSZDBOQldVZGFORVZOUVZGSlFrMUVaMGREYVhOSFFWRlJRakZ1YTBOQ1VVMTNTMnBCYjBKblozSkNaMFZHUWxGalEwRlNXV05oU0ZJd1kwaE5Oa3g1T1hkaE1tdDFXakk1ZGxwNU9YbGFXRUoyWXpKc01HSXpTalZNZWtGT1FtZHJjV2hyYVVjNWR6QkNRVkZ6UmtGQlQwTkJaMFZCU1ZaVWIza3lOR3AzV0ZWeU1ISkJVR001TWpSMmRWTldZa3RSZFZsM00yNU1abXhNWmt4b05VRlpWMFZsVm13dlJIVXhPRkZCVjFWTlpHTktObTh2Y1VaYVltaFlhMEpJTUZCT1kzYzVOM1JvWVdZeVFtVnZSRmxaT1VOckwySXJWVWRzZFdoNE1EWjZaRFJGUW1ZM1NEbFFPRFJ1Ym5KM2NGSXJORWRDUkZwTEsxaG9NMGt3ZEhGS2VUSnlaMDl4VGtSbWJISTFTVTFST0ZwVVYwRXplV3gwWVd0NlUwSkxXalpZY0VZd1VIQnhlVU5TZG5BdlRrTkhkakpMV0RKVWRWQkRTblp6WTNBeEwyMHljRlpVZEhsQ2FsbFFVbEVyVVhWRFVVZEJTa3RxZEU0M1VqVkVSbkptVkhGTlYzWlpaMVpzY0VOS1FtdDNiSFUzS3pkTFdUTmpWRWxtZWtVM1kyMUJUSE5yVFV0T1RIVkVlaXRTZWtOamMxbFVjMVpoVlRkV2NETjRURFl3VDFsb2NVWnJkVUZQVDNoRVdqWndTRTlxT1N0UFNtMVpaMUJ0VDFRMFdETXJOMHcxTVdaWVNubFNTRGxMWmt4U1VEWnVWRE14UkRWdWJYTkhRVTluV2pJMkx6aFVPV2h6UWxjeGRXODVhblUxWmxwTVdsaFdWbE0xU0RCSWVVbENUVVZMZVVkTlNWQm9SbGR5YkhRdmFFWlRNamhPTVhwaFMwa3dXa0pIUkRObldXZEVUR0pwUkZRNVprZFljM1J3YXl0R2JXTTBiMnhXYkZkUWVsaGxPREYyWkc5RmJrWmljalZOTWpjeVNHUm5TbGR2SzFkb1ZEbENXVTB3U21rcmQyUldiVzVTWm1aWVoyeHZSVzlzZFZST1kxZDZZelF4WkVad1owcDFPR1pHTTB4SE1HZHNNbWxpVTFscFEyazVZVFpvZGxVd1ZIQndha3A1U1ZkWWFHdEtWR05OU214UWNsZDRNVlo1ZEVWVlIzSllNbXd3U2tSM1VtcFhMelkxTm5Jd1MxWkNNREo0U0ZKTGRtMHlXa3RKTUROVVoyeE1TWEJ0VmtOTE0ydENTMnRMVG5CQ1RtdEdkRGh5YUdGbVkwTkxUMkk1U25ndk9YUndUa1pzVVZSc04wSXpPWEpLYkVwWGExSXhOMUZ1V25GV2NIUkdaVkJHVDFKdldtMUdlazA5SWl3aVRVbEpSbGxxUTBOQ1JYRm5RWGRKUWtGblNWRmtOekJPWWs1ek1pdFNjbkZKVVM5Rk9FWnFWRVJVUVU1Q1oydHhhR3RwUnpsM01FSkJVWE5HUVVSQ1dFMVJjM2REVVZsRVZsRlJSMFYzU2tOU1ZFVmFUVUpqUjBFeFZVVkRhRTFSVWpKNGRsbHRSbk5WTW14dVltbENkV1JwTVhwWlZFVlJUVUUwUjBFeFZVVkRlRTFJVlcwNWRtUkRRa1JSVkVWaVRVSnJSMEV4VlVWQmVFMVRVako0ZGxsdFJuTlZNbXh1WW1sQ1UySXlPVEJKUlU1Q1RVSTBXRVJVU1hkTlJGbDRUMVJCZDAxRVFUQk5iRzlZUkZSSk5FMUVSWGxQUkVGM1RVUkJNRTFzYjNkU2VrVk1UVUZyUjBFeFZVVkNhRTFEVmxaTmVFbHFRV2RDWjA1V1FrRnZWRWRWWkhaaU1tUnpXbE5DVldOdVZucGtRMEpVV2xoS01tRlhUbXhqZVVKTlZFVk5lRVpFUVZOQ1owNVdRa0ZOVkVNd1pGVlZlVUpUWWpJNU1FbEdTWGhOU1VsRFNXcEJUa0puYTNGb2EybEhPWGN3UWtGUlJVWkJRVTlEUVdjNFFVMUpTVU5EWjB0RFFXZEZRWFJvUlVOcGVEZHFiMWhsWWs4NWVTOXNSRFl6YkdGa1FWQkxTRGxuZG13NVRXZGhRMk5tWWpKcVNDODNOazUxT0dGcE5saHNOazlOVXk5cmNqbHlTRFY2YjFGa2MyWnVSbXc1TjNaMVprdHFObUozVTJsV05tNXhiRXR5SzBOTmJuazJVM2h1UjFCaU1UVnNLemhCY0dVMk1tbHRPVTFhWVZKM01VNUZSRkJxVkhKRlZHODRaMWxpUlhaekwwRnRVVE0xTVd0TFUxVnFRalpITURCcU1IVlpUMFJRTUdkdFNIVTRNVWs0UlRORGQyNXhTV2x5ZFRaNk1XdGFNWEVyVUhOQlpYZHVha2g0WjNOSVFUTjVObTFpVjNkYVJISllXV1pwV1dGU1VVMDVjMGh0YTJ4RGFYUkVNemh0TldGblNTOXdZbTlRUjJsVlZTczJSRTl2WjNKR1dsbEtjM1ZDTm1wRE5URXhjSHB5Y0RGYWEybzFXbEJoU3pRNWJEaExSV280UXpoUlRVRk1XRXd6TW1nM1RURmlTM2RaVlVnclJUUkZlazVyZEUxbk5sUlBPRlZ3YlhaTmNsVndjM2xWY1hSRmFqVmpkVWhMV2xCbWJXZG9RMDQyU2pORGFXOXFOazlIWVVzdlIxQTFRV1pzTkM5WWRHTmtMM0F5YUM5eWN6TTNSVTlsV2xaWWRFd3diVGM1V1VJd1pYTlhRM0oxVDBNM1dFWjRXWEJXY1RsUGN6WndSa3hMWTNkYWNFUkpiRlJwY25oYVZWUlJRWE0yY1hwcmJUQTJjRGs0WnpkQ1FXVXJaRVJ4Tm1SemJ6UTVPV2xaU0RaVVMxZ3ZNVmszUkhwcmRtZDBaR2w2YW10WVVHUnpSSFJSUTNZNVZYY3JkM0E1VlRkRVlrZExiMmRRWlUxaE0wMWtLM0IyWlhvM1Z6TTFSV2xGZFdFckszUm5lUzlDUW1wR1JrWjVNMnd6VjBad1R6bExWMmQ2TjNwd2JUZEJaVXRLZERoVU1URmtiR1ZEWm1WWWEydFZRVXRKUVdZMWNXOUpZbUZ3YzFwWGQzQmlhMDVHYUVoaGVESjRTVkJGUkdkbVp6RmhlbFpaT0RCYVkwWjFZM1JNTjFSc1RHNU5VUzh3YkZWVVltbFRkekZ1U0RZNVRVYzJlazh3WWpsbU5rSlJaR2RCYlVRd05ubExOVFp0UkdOWlFscFZRMEYzUlVGQllVOURRVlJuZDJkblJUQk5RVFJIUVRGVlpFUjNSVUl2ZDFGRlFYZEpRbWhxUVZCQ1owNVdTRkpOUWtGbU9FVkNWRUZFUVZGSUwwMUNNRWRCTVZWa1JHZFJWMEpDVkd0eWVYTnRZMUp2Y2xORFpVWk1NVXB0VEU4dmQybFNUbmhRYWtGbVFtZE9Wa2hUVFVWSFJFRlhaMEpTWjJVeVdXRlNVVEpZZVc5c1VVd3pNRVY2VkZOdkx5OTZPVk42UW1kQ1oyZHlRbWRGUmtKUlkwSkJVVkpWVFVaSmQwcFJXVWxMZDFsQ1FsRlZTRTFCUjBkSFYyZ3daRWhCTmt4NU9YWlpNMDUzVEc1Q2NtRlROVzVpTWpsdVRESmtlbU5xUlhkTFVWbEpTM2RaUWtKUlZVaE5RVXRIU0Zkb01HUklRVFpNZVRsM1lUSnJkVm95T1haYWVUbHVZek5KZUV3eVpIcGpha1YxV1ROS01FMUVTVWRCTVZWa1NIZFJjazFEYTNkS05rRnNiME5QUjBsWGFEQmtTRUUyVEhrNWFtTnRkM1ZqUjNSd1RHMWtkbUl5WTNaYU0wNTVUVk01Ym1NelNYaE1iVTU1WWtSQk4wSm5UbFpJVTBGRlRrUkJlVTFCWjBkQ2JXVkNSRUZGUTBGVVFVbENaMXB1WjFGM1FrRm5TWGRFVVZsTVMzZFpRa0pCU0ZkbFVVbEdRWGRKZDBSUldVeExkMWxDUWtGSVYyVlJTVVpCZDAxM1JGRlpTa3R2V2tsb2RtTk9RVkZGVEVKUlFVUm5aMFZDUVVSVGEwaHlSVzl2T1VNd1pHaGxiVTFZYjJnMlpFWlRVSE5xWW1SQ1drSnBUR2M1VGxJemREVlFLMVEwVm5obWNUZDJjV1pOTDJJMVFUTlNhVEZtZVVwdE9XSjJhR1JIWVVwUk0ySXlkRFo1VFVGWlRpOXZiRlZoZW5OaFRDdDVlVVZ1T1Zkd2NrdEJVMDl6YUVsQmNrRnZlVnBzSzNSS1lXOTRNVEU0Wm1WemMyMVliakZvU1ZaM05ERnZaVkZoTVhZeGRtYzBSblkzTkhwUWJEWXZRV2hUY25jNVZUVndRMXBGZERSWGFUUjNVM1I2Tm1SVVdpOURURUZPZURoTVdtZ3hTamRSU2xacU1tWm9UWFJtVkVweU9YYzBlak13V2pJd09XWlBWVEJwVDAxNUszRmtkVUp0Y0haMldYVlNOMmhhVERaRWRYQnplbVp1ZHpCVGEyWjBhSE14T0dSSE9WcExZalU1VldoMmJXRlRSMXBTVm1KT1VYQnpaek5DV214MmFXUXdiRWxMVHpKa01YaHZlbU5zVDNwbmFsaFFXVzkyU2twSmRXeDBlbXROZFRNMGNWRmlPVk42TDNscGJISmlRMmRxT0QwaVhYMC5leUp1YjI1alpTSTZJa1o1TDFWNFNIcHBlVUZ6VDJGdE0zSTFiM0ZaU1dad1MycENVSFo1U2pWWWVqUmpjMWRRYjBZNU5VMDlJaXdpZEdsdFpYTjBZVzF3VFhNaU9qRTJPVEU1TkRBek5USXpOemtzSW1Gd2ExQmhZMnRoWjJWT1lXMWxJam9pWTI5dExtZHZiMmRzWlM1aGJtUnliMmxrTG1kdGN5SXNJbUZ3YTBScFoyVnpkRk5vWVRJMU5pSTZJblZXVTBsSlNWWlBVREZvVm5ScmFGTnpZVXhxZFhJdldXcDZZM28wUTJoQkswbFJWMVZXZURVNFMxazlJaXdpWTNSelVISnZabWxzWlUxaGRHTm9JanAwY25WbExDSmhjR3REWlhKMGFXWnBZMkYwWlVScFoyVnpkRk5vWVRJMU5pSTZXeUk0VURGelZ6QkZVRXBqYzJ4M04xVjZVbk5wV0V3Mk5IY3JUelV3UldRclVrSkpRM1JoZVRGbk1qUk5QU0pkTENKaVlYTnBZMGx1ZEdWbmNtbDBlU0k2ZEhKMVpTd2laWFpoYkhWaGRHbHZibFI1Y0dVaU9pSkNRVk5KUXl4SVFWSkVWMEZTUlY5Q1FVTkxSVVFpTENKa1pYQnlaV05oZEdsdmJrbHVabTl5YldGMGFXOXVJam9pVkdobElGTmhabVYwZVU1bGRDQkJkSFJsYzNSaGRHbHZiaUJCVUVrZ2FYTWdaR1Z3Y21WallYUmxaQzRnU1hRZ2FYTWdjbVZqYjIxdFpXNWtaV1FnZEc4Z2RYTmxJSFJvWlNCUWJHRjVJRWx1ZEdWbmNtbDBlU0JCVUVrNklHaDBkSEJ6T2k4dlp5NWpieTl3YkdGNUwzTmhabVYwZVc1bGRDMTBhVzFsYkdsdVpTNGlmUS5OdEkxVTZjeWtNcnNUUllWeWw3Y2VKam5nVGJLZEpNVUQtOUNscVhpQkp5LVhyTFIydlZyNXVtcVdhQzBlWmxhejFUTTNwWHBnZzZ4dG5aa01TWjRURnZNYkN5UDlhNFR5WEl0MU5XZWtXenBLQnN3NTUxQTB1QUQ5UjNsaV9WMmlQbFQwdV9vWTUxWlNqTGctSF9Pb2QxWVRhaGpGVXdGeGZZSGltOXVfUTU2X0ZBek5TR2IwRGZOeTlXWkp5azZSLXluaktXUktYN0F3NGFkUVF2cHlXaHd5LWc0WjVpbW9FbjgtTF9wX3k3QURGcFpvUnhFcThtNE5KNDdZMXhWM1JVa3lzcGFoTGY4dVJUQnJyREh1TU9jQ2d4aFV5T2hFOENUU3ZRU0xMbXdmQnFrRVNfZHVZRG1rd01TOVN4LUYzdE5wLXhjU3RISjZ0SzZVX25DWFFoYXV0aERhdGFYxeaUOqZ__grea8ztoioCdTYv_422QtK0ZXt4vwkEruQIRQAAAAC5P9lh8uZGL7EiggAiR954AEEBKA5H07Vi7LYY_9DGnNN7ORBu1J4-nuQDudU2T0Z3fdFiAWPKWv0-pcIGzkM3jD7-TS2hI6FbdJbAcRiAvW7kq6UBAgMmIAEhWCBqytyWfZXZfIDuf1-sK13bYt-vaFLxfV8V0tM14A6jdSJYIEr78H9RTt3ddGTZukZsIUmVW0x_jBnG_GMgGcwOlfQS"
          }
        }
        );

        let reg: webauthn_rs_proto::RegisterPublicKeyCredential =
            serde_json::from_value(json).expect("invalid inner json");

        assert!(is_android(&reg.response.client_data_json.0).expect("failed to check android"));

        let config = WebauthnConfig::android_config("onefootprint.com");

        let reg_state = serde_json::json!({
          "policy": "required",
          "exclude_credentials": [],
          "challenge": "ZGIZevi5N_JGGfzuzb3imDV1cx5Vn9jkCyn7h3RCEl8",
          "credential_algorithms": [
            "ES256",
            "RS256"
          ],
          "require_resident_key": false,
          "authenticator_attachment": "platform",
          "extensions": {},
          "experimental_allow_passkeys": true
        });

        let reg_state = serde_json::from_value(reg_state).unwrap();

        let _ = config
            .register_credential(&reg, &reg_state, None)
            .expect("reg failed");
    }
}
