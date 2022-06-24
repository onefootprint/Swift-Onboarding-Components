use crate::{
    auth::{
        either::{Either, EitherSession3},
        session_context::HasUserVaultId,
        AuthError, session_data::user::{d2p::D2pSession, onboarding::OnboardingSession, my_fp::My1fpBasicSession},
    },
    errors::ApiError,
    types::{success::ApiResponseData, Empty},
    utils::{
        challenge::{Challenge, ChallengeToken},
        insight_headers::InsightHeaders,
        liveness::LivenessWebauthnConfig,
    },
    State,
};
use app_attest::error::AttestationError;
use chrono::{Duration, Utc};
use crypto::sha256;
use db::models::insight_event::CreateInsightEvent;
use db::models::webauthn_credential::NewWebauthnCredential;
use newtypes::{
    Base64Data,
};
use newtypes::{AttestationType, D2pSessionStatus};
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

/// Get a registration challenge
#[api_v2_operation(tags(Liveness))]
#[post("/biometric/init")]
pub fn init(
    // TODO only allow registering webauthn credentials if you have no previous credentials OR if
    // you logged into this session via webauthn. Otherwise, someone who SIM swaps you can register
    // their own webauthn creds
    user_auth: EitherSession3<D2pSession, OnboardingSession, My1fpBasicSession>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<WebAuthnInitResponse>>, ApiError> {
    // checks if we're either in a d2p session & it's in progress, or it's an onboarding session
    if !match &user_auth {
        Either::Left(s) => s.data.status == D2pSessionStatus::InProgress,
        Either::Right(_) => true,
    } {
        return Err(AuthError::SessionTypeError).map_err(ApiError::from);
    }

    // generate the challenge and return it
    let webauthn = LivenessWebauthnConfig::new(&state);
    let user_id = user_auth.user_vault_id();

    let (challenge, reg_state) = webauthn.webauthn().generate_challenge_register_options(
        user_id.to_string(),
        "Footprint".into(), // todo: fix this
        AttestationConveyancePreference::Direct,
        Some(UserVerificationPolicy::Required),
        None,
        None,
        COSEAlgorithm::secure_algs(),
        true,
        Some(AuthenticatorAttachment::Platform),
        false,
    )?;

    let challenge_data = Challenge {
        expires_at: Utc::now().naive_utc() + Duration::minutes(5),
        data: reg_state,
    };
    let response = ApiResponseData::ok(WebAuthnInitResponse {
        challenge_json: serde_json::to_string(&challenge)?,
        challenge_token: challenge_data.seal(&state.challenge_sealing_key)?,
    });

    Ok(Json(response))
}

/// Contains the response from the device
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema)]
struct WebauthnRegisterRequest {
    device_response_json: String,
    challenge_token: ChallengeToken,
    /// for iOS app clip attestation
    supplementary_attestation_data: Option<Base64Data>,
    /// if the location matches or is unknown
    location_match: Option<LocationMatchType>,
}

#[derive(Debug, PartialEq, Clone, Copy, Serialize_repr, Deserialize_repr, Apiv2Schema)]
#[repr(u8)]
enum LocationMatchType {
    Unknown = 0,
    NoMatch = 1,
    Match = 2,
}

/// Response to a registration challenge
#[api_v2_operation(tags(Liveness))]
#[post("/biometric")]
async fn complete(
    request: Json<WebauthnRegisterRequest>,
    user_auth: EitherSession3<D2pSession, OnboardingSession, My1fpBasicSession>,
    insights: InsightHeaders,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let challenge_data = Challenge::unseal(&state.challenge_sealing_key, &request.challenge_token)?;
    let reg_state = challenge_data.data;

    // generate the challenge and return it
    let webauthn = LivenessWebauthnConfig::new(&state);
    let cas = AttestationCaList::apple_and_android();

    let reg = serde_json::from_str(&request.device_response_json)?;
    let cred = webauthn
        .webauthn()
        .register_credential(&reg, &reg_state, Some(&cas))?;

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

    let attestation_type = match cred.attestation_format {
        AttestationFormat::AppleAnonymous => AttestationType::Apple,
        AttestationFormat::AndroidKey => AttestationType::AndroidKey,
        AttestationFormat::AndroidSafetyNet => AttestationType::AndroidSafetyNet,
        AttestationFormat::None => {
            // this is our work around for supplementary app-based attestation
            match &request.supplementary_attestation_data {
                Some(app_attest) => {
                    try_attest_apple_app_attestation(
                        &reg,
                        request.location_match.unwrap_or(LocationMatchType::Unknown),
                        app_attest.as_ref(),
                    )
                    .map_err(|err| {
                        tracing::error!(error=?err, "failed to verify app attestation");
                    })
                    .map(|att| {
                        // store the metadata
                        attestation_metadata.app_attestation = Some(att);
                        // return the verified type
                        AttestationType::AppleApp
                    })
                    .unwrap_or(AttestationType::None)
                }
                None => AttestationType::None,
            }
        }
        _ => AttestationType::Unknown,
    };

    tracing::info!(attestation=?attestation_metadata, "attestation details");

    let attestation_data = serde_cbor::to_vec(&attestation_metadata)?;

    let insight_event = CreateInsightEvent::from(insights).insert(&state.db_pool).await?;

    NewWebauthnCredential {
        user_vault_id: user_auth.user_vault_id(),
        credential_id: cred.cred_id.0,
        public_key: crypto::serde_cbor::to_vec(&cred.cred).map_err(crypto::Error::Cbor)?,
        attestation_data,
        backup_eligible: cred.backup_eligible,
        attestation_type,
        insight_event_id: insight_event.id,
    }
    .save(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData::ok(Empty)))
}

/// Storable app attestation metadata
/// TODO: move this struct to newtypes for use later
#[derive(Debug, Serialize)]
enum AppAttestationMetadata {
    Apple { is_development: bool, receipt: Vec<u8> },
}

/// Our internal method of combining an attestation Apple's DeviceCheck
/// framework with that of the corresponding webauthn challenge to bind the
/// credential to the attested device (PassKeys are not attested currently due to iOS bug)
fn try_attest_apple_app_attestation(
    credential: &RegisterPublicKeyCredential,
    location_match: LocationMatchType,
    app_attestation: &[u8],
) -> Result<AppAttestationMetadata, AttestationError> {
    let verifier = app_attest::apple::AppleAppAttestationVerifier::new_default_ca(vec![
        "C246BC89CJ.in.alexgr.FootprintVerify",
        "C246BC89CJ.in.alexgr.FootprintVerify.Clip",
    ])?; // todo: move App IDs to config

    // composite client data from webauthn data + location type
    let client_data = vec![
        credential.response.client_data_json.as_ref(),
        credential.response.attestation_object.as_ref(),
        &[location_match as u8],
    ]
    .into_iter()
    .map(sha256)
    .collect::<Vec<[u8; 32]>>()
    .concat();

    let verified = verifier.attest(&client_data, app_attestation)?;

    Ok(AppAttestationMetadata::Apple {
        is_development: verified.is_development,
        receipt: verified.receipt,
    })
}

#[cfg(test)]
mod tests {
    use super::{try_attest_apple_app_attestation, WebauthnRegisterRequest};

    #[test]
    fn test_app_attest() {
        let json = serde_json::json!(
            {"supplementary_attestation_data":"o2NmbXRvYXBwbGUtYXBwYXR0ZXN0Z2F0dFN0bXSiY3g1Y4JZAuwwggLoMIICbaADAgECAgYBgXedm1YwCgYIKoZIzj0EAwIwTzEjMCEGA1UEAwwaQXBwbGUgQXBwIEF0dGVzdGF0aW9uIENBIDExEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwHhcNMjIwNjE3MTYyMDI2WhcNMjMwMTE3MTMxNTI2WjCBkTFJMEcGA1UEAwxAMTA4N2ZmNDVkM2Q3NTA3YWRlOWQ0OWM1MGQ5MjgzZTNmNDY3NWZjNTBkNmE1OGVhY2EwZDM4ZTlkMmI4N2JiMTEaMBgGA1UECwwRQUFBIENlcnRpZmljYXRpb24xEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARSEfEMqo_gCuZR08NW5K_5F0A5J0CJEAUytNdH_yTdeY-K4LbR0obWNW0Zhrsw2yfsv8d0ZcwgowVo0grBgzdko4HxMIHuMAwGA1UdEwEB_wQCMAAwDgYDVR0PAQH_BAQDAgTwMH4GCSqGSIb3Y2QIBQRxMG-kAwIBCr-JMAMCAQG_iTEDAgEAv4kyAwIBAb-JMwMCAQG_iTQmBCRDMjQ2QkM4OUNKLmluLmFsZXhnci5Gb290cHJpbnRWZXJpZnmlBgQEc2tzIL-JNgMCAQW_iTcDAgEAv4k5AwIBAL-JOgMCAQAwGQYJKoZIhvdjZAgHBAwwCr-KeAYEBDE2LjAwMwYJKoZIhvdjZAgCBCYwJKEiBCC4JsVxyhcd1igOXZ1iQQMXyd1gR9I2D-qrAa7TpJ64eDAKBggqhkjOPQQDAgNpADBmAjEAmHV4YXYRaf1BtqrTHodUzKyjd8t9iwbnMjJVVEciL0acTA1yPERT1d8tX12ez4d8AjEAlj_fl1rObsTE3v0u8CO1p_HsvG0cl-nkZHQhC_7-cdVaqIvRZ4V74N8yaywv42IGWQJHMIICQzCCAcigAwIBAgIQCbrF4bxAGtnUU5W8OBoIVDAKBggqhkjOPQQDAzBSMSYwJAYDVQQDDB1BcHBsZSBBcHAgQXR0ZXN0YXRpb24gUm9vdCBDQTETMBEGA1UECgwKQXBwbGUgSW5jLjETMBEGA1UECAwKQ2FsaWZvcm5pYTAeFw0yMDAzMTgxODM5NTVaFw0zMDAzMTMwMDAwMDBaME8xIzAhBgNVBAMMGkFwcGxlIEFwcCBBdHRlc3RhdGlvbiBDQSAxMRMwEQYDVQQKDApBcHBsZSBJbmMuMRMwEQYDVQQIDApDYWxpZm9ybmlhMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAErls3oHdNebI1j0Dn0fImJvHCX-8XgC3qs4JqWYdP-NKtFSV4mqJmBBkSSLY8uWcGnpjTY71eNw-_oI4ynoBzqYXndG6jWaL2bynbMq9FXiEWWNVnr54mfrJhTcIaZs6Zo2YwZDASBgNVHRMBAf8ECDAGAQH_AgEAMB8GA1UdIwQYMBaAFKyREFMzvb5oQf-nDKnl-url5YqhMB0GA1UdDgQWBBQ-410cBBmpybQx-IR01uHhV3LjmzAOBgNVHQ8BAf8EBAMCAQYwCgYIKoZIzj0EAwMDaQAwZgIxALu-iI1zjQUCz7z9Zm0JV1A1vNaHLD-EMEkmKe3R-RToeZkcmui1rvjTqFQz97YNBgIxAKs47dDMge0ApFLDukT5k2NlU_7MKX8utN-fXr5aSsq2mVxLgg35BDhveAe7WJQ5t2dyZWNlaXB0WQ5fMIAGCSqGSIb3DQEHAqCAMIACAQExDzANBglghkgBZQMEAgEFADCABgkqhkiG9w0BBwGggCSABIID6DGCBBkwLAIBAgIBAQQkQzI0NkJDODlDSi5pbi5hbGV4Z3IuRm9vdHByaW50VmVyaWZ5MIIC9gIBAwIBAQSCAuwwggLoMIICbaADAgECAgYBgXedm1YwCgYIKoZIzj0EAwIwTzEjMCEGA1UEAwwaQXBwbGUgQXBwIEF0dGVzdGF0aW9uIENBIDExEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwHhcNMjIwNjE3MTYyMDI2WhcNMjMwMTE3MTMxNTI2WjCBkTFJMEcGA1UEAwxAMTA4N2ZmNDVkM2Q3NTA3YWRlOWQ0OWM1MGQ5MjgzZTNmNDY3NWZjNTBkNmE1OGVhY2EwZDM4ZTlkMmI4N2JiMTEaMBgGA1UECwwRQUFBIENlcnRpZmljYXRpb24xEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARSEfEMqo_gCuZR08NW5K_5F0A5J0CJEAUytNdH_yTdeY-K4LbR0obWNW0Zhrsw2yfsv8d0ZcwgowVo0grBgzdko4HxMIHuMAwGA1UdEwEB_wQCMAAwDgYDVR0PAQH_BAQDAgTwMH4GCSqGSIb3Y2QIBQRxMG-kAwIBCr-JMAMCAQG_iTEDAgEAv4kyAwIBAb-JMwMCAQG_iTQmBCRDMjQ2QkM4OUNKLmluLmFsZXhnci5Gb290cHJpbnRWZXJpZnmlBgQEc2tzIL-JNgMCAQW_iTcDAgEAv4k5AwIBAL-JOgMCAQAwGQYJKoZIhvdjZAgHBAwwCr-KeAYEBDE2LjAwMwYJKoZIhvdjZAgCBCYwJKEiBCC4JsVxyhcd1igOXZ1iQQMXyd1gR9I2D-qrAa7TpJ64eDAKBggqhkjOPQQDAgNpADBmAjEAmHV4YXYRaf1BtqrTHodUzKyjd8t9iwbnMjJVVEciL0acTA1yPERT1d8tX12ez4d8AjEAlj_fl1rObsTE3v0u8CO1p_HsvG0cl-nkZHQhC_7-cdVaqIvRZ4V74N8yaywv42IGMCgCAQQCAQEEIPY8WUVNf5zdIiMRxq3CqJFIUTMVXD9cSHXzG1gwTU16MGACAQUCAQEEWE1sZGpkTWtPQmkrSjdnSlB5MjRCSXc5MUdrVisvdGdvdUlmY2tFcDZDZ3d0ZHoxWGpTemg5TjBhcUdBcE5BSWZkMzRubVZLZlZWcjl5Tkx6dG9qOC9nPT0wDgIBBgIBAQQGQVRURVNUMA8CAQcCAQEEB3NhbmRib3gwIAIBDAIBAQQYMjAyMi0ENTA2LTE4VDE2OjIwOjI2LjYyMVowIAIBFQIBAQQYMjAyMi0wOS0xNlQxNjoyMDoyNi42MjFaAAAAAAAAoIAwggOuMIIDVKADAgECAhAJObS86QzDoYFlNjcvZnFBMAoGCCqGSM49BAMCMHwxMDAuBgNVBAMMJ0FwcGxlIEFwcGxpY2F0aW9uIEludGVncmF0aW9uIENBIDUgLSBHMTEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTIyMDQxOTEzMzMwM1oXDTIzMDUxOTEzMzMwMlowWjE2MDQGA1UEAwwtQXBwbGljYXRpb24gQXR0ZXN0YXRpb24gRnJhdWQgUmVjZWlwdCBTaWduaW5nMRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABDnU-aqbHMRF1lumF6zywITsbwcI1ZAUoOduzz3uOZmpTGv7AVUQVVVkbNqOI-AmARQC0H4TuVQf2LTWV9guk3ijggHYMIIB1DAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFNkX_ktnkDhLkvTbztVXgBQLjz3JMEMGCCsGAQUFBwEBBDcwNTAzBggrBgEFBQcwAYYnaHR0cDovL29jc3AuYXBwbGUuY29tL29jc3AwMy1hYWljYTVnMTAxMIIBHAYDVR0gBIIBEzCCAQ8wggELBgkqhkiG92NkBQEwgf0wgcMGCCsGAQUFBwICMIG2DIGzUmVsaWFuY2Ugb24gdGhpcyBjZXJ0aWZpY2F0ZSBieSBhbnkgcGFydHkgYXNzdW1lcyBhY2NlcHRhbmNlIG9mIHRoZSB0aGVuIGFwcGxpY2FibGUgc3RhbmRhcmQgdGVybXMgYW5kIGNvbmRpdGlvbnMgb2YgdXNlLCBjZXJ0aWZpY2F0ZSBwb2xpY3kgYW5kIGNlcnRpZmljYXRpb24gcHJhY3RpY2Ugc3RhdGVtZW50cy4wNQYIKwYBBQUHAgEWKWh0dHA6Ly93d3cuYXBwbGUuY29tL2NlcnRpZmljYXRlYXV0aG9yaXR5MB0GA1UdDgQWBBT7Z9MNv3O3kqYmXUiNLMEdleJz-DAOBgNVHQ8BAf8EBAMCB4AwDwYJKoZIhvdjZAwPBAIFADAKBggqhkjOPQQDAgNIADBFAiEAlJCgZzdz5y94KTZ2I7jdUdfImgnquwDjnG5FCwVYC9ACIEc0GivRPMBUqAo6qsw8wUV8AFRTGOozjX1t1fYLK4cuMIIC-TCCAn-gAwIBAgIQVvuD1Cv_jcM3mSO1Wq5uvTAKBggqhkjOPQQDAzBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzAeFw0xOTAzMjIxNzUzMzNaFw0zNDAzMjIwMDAwMDBaMHwxMDAuBgNVBAMMJ0FwcGxlIEFwcGxpY2F0aW9uIEludGVncmF0aW9uIENBIDUgLSBHMTEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEks5jvX2GsasoCjsc4a_7BJSAkaz2Md-myyg1b0RL4SHlV90SjY26gnyVvkn6vjPKrs0EGfEvQyX69L6zy4N-uqOB9zCB9DAPBgNVHRMBAf8EBTADAQH_MB8GA1UdIwQYMBaAFLuw3qFYM4iapIqZ3r6966_ayySrMEYGCCsGAQUFBwEBBDowODA2BggrBgEFBQcwAYYqaHR0cDovL29jc3AuYXBwbGUuY29tL29jc3AwMy1hcHBsZXJvb3RjYWczMDcGA1UdHwQwMC4wLKAqoCiGJmh0dHA6Ly9jcmwuYXBwbGUuY29tL2FwcGxlcm9vdGNhZzMuY3JsMB0GA1UdDgQWBBTZF_5LZ5A4S5L0287VV4AUC489yTAOBgNVHQ8BAf8EBAMCAQYwEAYKKoZIhvdjZAYCAwQCBQAwCgYIKoZIzj0EAwMDaAAwZQIxAI1vpp-h4OTsW05zipJ_PXhTmI_02h9YHsN1Sv44qEwqgxoaqg2mZG3huZPo0VVM7QIwZzsstOHoNwd3y9XsdqgaOlU7PzVqyMXmkrDhYb6ASWnkXyupbOERAqrMYdk4t3NKMIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtfTjjTuxxEtX_1H7YyYl3J6YRbTzBPEVoA_VhYDKX1DyxNB0cTddqXl5dvMVztK517IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966_ayySrMA8GA1UdEwEB_wQFMAMBAf8wDgYDVR0PAQH_BAQDAgEGMAoGCCqGSM49BAMDA2gAMGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN-yRhHFD_3meoyhpmvOwgPUnPWTxnS4at-qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm-YhidDkLF1vLUagM6BgD56KyKAAAMYH9MIH6AgEBMIGQMHwxMDAuBgNVBAMMJ0FwcGxlIEFwcGxpY2F0aW9uIEludGVncmF0aW9uIENBIDUgLSBHMTEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTAhAJObS86QzDoYFlNjcvZnFBMA0GCWCGSAFlAwQCAQUAMAoGCCqGSM49BAMCBEcwRQIhAJzUqBxuc9DGqpAD6Iu2xbEDeF1V15hVYhjH3DnKi_eDAiAejB9EucWASNeL_oSXS6gtV8vxuQr0fME6k6xmJ20sAAAAAAAAAGhhdXRoRGF0YVikCYBXqS4yuvxbsQNKDw69fi2znP5U7QoV0OI-YtTmiY9AAAAAAGFwcGF0dGVzdGRldmVsb3AAIBCH_0XT11B63p1JxQ2Sg-P0Z1_FDWpY6soNOOnSuHuxpQECAyYgASFYIFIR8Qyqj-AK5lHTw1bkr_kXQDknQIkQBTK010f_JN15Ilggj4rgttHShtY1bRmGuzDbJ-y_x3RlzCCjBWjSCsGDN2Q","location_match":0,"device_response_json":"{\"rawId\":\"yIP0nPUJb6tLWpRvcEoR8xu5eDk\",\"id\":\"yIP0nPUJb6tLWpRvcEoR8xu5eDk\",\"response\":{\"attestationObject\":\"o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViY-OLwle2v2xLqCtchQhgKzUd88HBYwRC3AD4aIpx6oLldAAAAAAAAAAAAAAAAAAAAAAAAAAAAFMiD9Jz1CW-rS1qUb3BKEfMbuXg5pQECAyYgASFYIHDLrK_44D42AAgKvUYqPKNeUSjYkpHqK3-D6_FGRamxIlgg-Nwqf3EvxN4xknE2mr0upFt5LlyAR9CEc16GVb9Pkdg\",\"clientDataJSON\":\"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoidkt4V3RlQlFScnVaeG9iNENicXQ5aTVpNldvY29lTmtOZ2VzNy1CU3U1dyIsIm9yaWdpbiI6Imh0dHBzOi8vZm9vdHByaW50LmRldiJ9\"},\"type\":\"public-key\"}","challenge_token":"omFumBgYGRinBBjBEhj_GHIYYhgxFhiqGJwDGK0YPhjYGE0YIxgtGGUYZhivGIwYI2FjmQEkGIQYjhjwGNoYpRQYXhiRGIQYVxh0GDUYvxjPGFURGGMYMBgbBhhuGPYJGNACCBhrGLoYrRjRAxhEDhi4GLMYzxiYGM0Y_hhMGOsYKRhGGPYYWhjWExUYdhhFGNgY_Bi1GCAYRBjPFhhXGG0Y7Rg-GFAYUhg3GFQYUhhsGE8YGhjbGBwY_xiWGJMYThjuGMEYIBihGCUYyxiZGKwYeRj7GIEYnxhBGP4YNRheGFQYnxgeGLYYHBg1GDwYpRjFGO8YxBjkGCUYOBAYjhg2GNcYiRjPGCsYxRioGIgYnxgrGDsY9xjfGIcYiRi5GPwYuxh3GBgYGBjtGHcYURivGKkYVBiPGOgY3wMYohg9GEoYehgqGGsYSRj-GOoYwBjfEhhSGNkY2xihGHAYeBgcGHIYVxh7GH8YohjgGFEYRRgZGDMYUhhpGNQYfxiQGE0YuRieGOYYxRhuGGIYKxicGMYY-xg5GJgYPAIYixjUGIcYNhjlGNMYuRglGNUYNxjAGMgYgRjQGMIWGKUY8xiWGIkYbhg_GDQYGBj2GKMYYAMYLxhGGGEYtxg9GKoYihhGGPIYRRjsGH0Y8xjhGLsYsBh6GNUY0hhSGE0YqhhlGHUBCxgpGIsLGC4YbhgeEBjlGEQYkxhlGIcXGMkYSxjwGDAYnxjXChh4DBirGJoYHBjHGOgY5BjpGPAYfRiNGIMY3RhlGCgYGBh-GG0YNxhtGIAYzhj-GHEYaRiyGL4YgBhkGOU"}
        );
        let request: WebauthnRegisterRequest = serde_json::from_value(json).expect("invalid json");
        let reg = serde_json::from_str(&request.device_response_json).expect("invalid inner json");

        let att = try_attest_apple_app_attestation(
            &reg,
            request.location_match.expect("missing location field"),
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
            } => {
                assert!(is_development);
            }
        };
    }
}
