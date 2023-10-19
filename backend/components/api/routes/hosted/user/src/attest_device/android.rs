use api_core::{errors::ApiResult, State};
use app_attest::{
    error::AttestationError,
    google::{
        integrity_verdict::{AppLicensingVerdict, AppRecognitionVerdict, DeviceRecognitionVerdict},
        GoogleAppAttestationVerifier, IntegrityVerdictWithRawResponse, PlayIntegrityTokenError,
    },
};
use chrono::Utc;
use crypto::base64;
use db::models::{
    google_device_attest::{GoogleDeviceMetadata, NewGoogleDeviceAttestation},
    webauthn_credential::WebauthnCredential,
};
use newtypes::{AndroidAppLicense, AndroidAppRecognition, AndroidDeviceIntegrityLevel, VaultId};

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AndroidAttestationPayload {
    /// base64 encoded metadata json
    metadata_json_data: String,
    /// the attestation from
    attestation_data: String,
}

/// The object embedding what the device has attested
/// TODO: more to add here
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AttestedMetadata {
    #[serde(rename = "footprint_attestation_challenge")]
    attested_challenge: String,
    webauthn_device_response_json: Option<String>,
    model: Option<String>,
    os: Option<String>,
    /// our best guess at a unique DID
    widevine_id: Option<String>,
    /// DRM security level, L1 is highest, L3 is low
    widevine_security_level: Option<String>,
    /// a resettable device-id
    android_id: Option<String>,
}

/// Main entry point for attesting an android device
#[tracing::instrument(skip_all)]
pub(super) async fn attest(
    state: &State,
    vault_id: VaultId,
    challenge: String,
    attestation: String,
) -> ApiResult<NewGoogleDeviceAttestation> {
    let verifier = GoogleAppAttestationVerifier::new(app_attest::google::Config {
        allowed_apk_package_names: vec!["com.onefootprint.my".into()],
        allowed_apk_cert_sha256_values: vec!["iaC6-3GYhfKZE9MD30e246TYy2bIXtXJYziWKIhmSUE".into()],
        allowed_token_ttl_ms: app_attest::google::TtlEnforcement::FiveMinutes,
        token_decryption_key_base64: state.config.google_config.play_integrity_decryptiong_key.clone(),
        token_verification_key_base64: state
            .config
            .google_config
            .play_integrity_verificiation_key
            .clone(),
    });

    let vault_id_copy = vault_id.clone();
    let creds = state
        .db_pool
        .db_query(move |conn| WebauthnCredential::list(conn, &vault_id_copy))
        .await??;

    let new_attestation = attest_inner(vault_id, &verifier, challenge, attestation, creds).await?;

    Ok(new_attestation)
}

#[tracing::instrument(skip_all)]
pub(super) async fn attest_inner(
    vault_id: VaultId,
    verifier: &GoogleAppAttestationVerifier,
    challenge: String,
    attestation: String,
    webauthn_creds: Vec<WebauthnCredential>,
) -> ApiResult<NewGoogleDeviceAttestation> {
    let payload: AndroidAttestationPayload = serde_json::from_slice(&base64::decode(attestation)?)?;

    let client_data = base64::decode(payload.metadata_json_data)?;
    let attested_metadata: AttestedMetadata = serde_json::from_slice(&client_data)?;
    if attested_metadata.attested_challenge != challenge {
        return Err(app_attest::error::AttestationError::InvalidChallenge)?;
    }
    let nonce = crypto::sha256(&client_data).to_vec();
    let (is_evaluated_device, IntegrityVerdictWithRawResponse { verdict, raw_claims }) =
        match verifier.verify_token(payload.attestation_data.clone(), nonce) {
            Ok(resp) => (true, resp),
            Err(AttestationError::PlayIntegrityToken(PlayIntegrityTokenError::Unevaluated(uneval))) => {
                (false, *uneval)
            }
            Err(err) => return Err(err)?,
        };

    tracing::info!(verdict=?verdict, "verified attested android integrity verdict");

    let webauthn_credential_id = super::util::link_webauthn_credential(
        webauthn_creds,
        attested_metadata.webauthn_device_response_json,
    )?;

    let license_verdict = verdict.account_details.app_licensing_verdict;
    let app_verdict = verdict.app_integrity.app_recognition_verdict;
    let device_verdicts = verdict.device_integrity.device_recognition_verdict;

    let is_trustworthy_device = is_evaluated_device
        && matches!(license_verdict, AppLicensingVerdict::Licensed)
        && matches!(app_verdict, AppRecognitionVerdict::PlayRecognized)
        && device_verdicts.iter().any(|d| {
            matches!(
                d,
                DeviceRecognitionVerdict::MeetsDeviceIntegrity
                    | DeviceRecognitionVerdict::MeetsStrongIntegrity
            )
        });

    Ok(NewGoogleDeviceAttestation {
        vault_id,
        metadata: GoogleDeviceMetadata {
            model: attested_metadata.model,
            os: attested_metadata.os,
        },
        webauthn_credential_id,
        created_at: Utc::now(),
        raw_token: payload.attestation_data,
        raw_claims,
        package_name: verdict
            .app_integrity
            .package_name
            .unwrap_or(verdict.request_details.request_package_name),
        app_version: verdict.app_integrity.version_code,
        widevine_id: attested_metadata.widevine_id,
        widevine_security_level: attested_metadata.widevine_security_level,
        android_id: attested_metadata.android_id,
        is_trustworthy_device,
        is_evaluated_device,
        license_verdict: match license_verdict {
            AppLicensingVerdict::Licensed => AndroidAppLicense::Licensed,
            AppLicensingVerdict::Unlicensed => AndroidAppLicense::Unlicensed,
            AppLicensingVerdict::Unevaluated => AndroidAppLicense::Unevaluated,
            AppLicensingVerdict::Unknown => AndroidAppLicense::Unknown,
        },
        recognition_verdict: match app_verdict {
            AppRecognitionVerdict::PlayRecognized => AndroidAppRecognition::Recognized,
            AppRecognitionVerdict::UnrecognizedVersion => AndroidAppRecognition::Unrecognized,
            AppRecognitionVerdict::Unevaluated => AndroidAppRecognition::Unevaluated,
            AppRecognitionVerdict::Unknown => AndroidAppRecognition::Unknown,
        },
        integrity_level: if device_verdicts.contains(&DeviceRecognitionVerdict::MeetsStrongIntegrity) {
            AndroidDeviceIntegrityLevel::Strong
        } else if device_verdicts.contains(&DeviceRecognitionVerdict::MeetsDeviceIntegrity) {
            AndroidDeviceIntegrityLevel::Sufficient
        } else if device_verdicts.contains(&DeviceRecognitionVerdict::MeetsBasicIntegrity) {
            AndroidDeviceIntegrityLevel::Basic
        } else {
            AndroidDeviceIntegrityLevel::Unknown
        },
    })
}
