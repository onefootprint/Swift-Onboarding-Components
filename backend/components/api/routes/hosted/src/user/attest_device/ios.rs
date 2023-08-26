use crate::State;

use api_core::errors::ApiResult;

use app_attest::apple::device_check::DeviceCheckBits;
use app_attest::apple::AppleAppAttestationVerifier;
use chrono::Utc;

use crypto::base64;

use db::models::apple_device_attest::{AppleDeviceMetadata, NewAppleDeviceAttestation};
use newtypes::VaultId;

// TODO: this structure is placeholder
#[derive(Debug, Clone, serde::Deserialize)]
struct IosAttestationPayload {
    /// base64 encoded metadata json
    metadata_json_data: String,
    /// the attestation from
    attestation_data: String,
}

/// TODO: temporary
/// there are more fields here...
#[derive(Debug, Clone, serde::Deserialize)]
struct AttestedMetadata {
    #[serde(rename = "footprint_attestation_challenge")]
    attested_challenge: String,
    webauthn_public_key: Option<String>,
    model: Option<String>,
    os: Option<String>,
    /// token to use with DC bit get/set
    /// if omiitted it means device could not generate it
    device_check_token: Option<String>,
}

/// Main entry point for attesting an iOS device
pub(super) async fn attest(
    state: &State,
    vault_id: VaultId,
    challenge: String,
    attestation: String,
) -> ApiResult<NewAppleDeviceAttestation> {
    let verifier: AppleAppAttestationVerifier = AppleAppAttestationVerifier::new_default_ca(
        vec![
            "5F264K8AG4.com.onefootprint.my",
            "5F264K8AG4.com.onefootprint.my.Clip",
        ],
        &state.config.apple_config.apple_device_check_private_key_pem,
        &state.config.apple_config.apple_device_check_key_id,
        "5F264K8AG4",
    )?;

    let new_attestation = attest_inner(vault_id, &verifier, challenge, attestation).await?;

    Ok(new_attestation)
}

pub(super) async fn attest_inner(
    vault_id: VaultId,
    verifier: &AppleAppAttestationVerifier,
    challenge: String,
    attestation: String,
) -> ApiResult<NewAppleDeviceAttestation> {
    let payload: IosAttestationPayload = serde_json::from_slice(&base64::decode(attestation)?)?;
    let attestation_data = base64::decode(payload.attestation_data)?;

    let client_data = base64::decode(payload.metadata_json_data)?;
    let attested_metadata: AttestedMetadata = serde_json::from_slice(&client_data)?;

    if attested_metadata.attested_challenge != challenge {
        return Err(app_attest::error::AttestationError::InvalidChallenge)?;
    }

    let verified_attest = verifier.attest(&client_data, &attestation_data)?;
    let attest_receipt = verifier.verify_and_parse_receipt(verified_attest.receipt.clone())?;

    if attest_receipt.client_hash != crypto::sha256(&client_data).to_vec() {
        return Err(app_attest::error::AttestationError::InvalidChallenge)?;
    }

    // todo: remove these info logs
    tracing::info!(receipt=?attest_receipt, "verifed attested receipt");

    let (server_receipt, receipt) = verifier
        .fetch_device_check_receipt(verified_attest.is_development, verified_attest.receipt)
        .await?;

    tracing::info!(receipt=?server_receipt, "fetched and verified server receipt");

    let bits = if let Some(device_check_token) = attested_metadata.device_check_token.clone() {
        // fetch the device bits
        let bits = verifier
            .query_device_bits(device_check_token.clone(), verified_attest.is_development)
            .await?;

        let (bit1, bit0) = (bits.as_ref().map(|b| b.bit1), bits.map(|b| b.bit0));

        // update the bits as a counter
        let (bit1, bit0) = match (bit1, bit0) {
            // 00 -> 01
            (Some(false), Some(false)) => (false, true),
            // 01 -> 10
            (Some(false), Some(true)) => (true, false),
            // 10 -> 11
            (Some(true), Some(false)) => (true, true),
            // 11 -> 11
            (Some(true), Some(true)) => (true, true),
            // unset -> 00
            _ => (false, false),
        };

        verifier
            .update_device_bits(device_check_token, verified_attest.is_development, bit0, bit1)
            .await?;

        Some(DeviceCheckBits {
            bit0,
            bit1,
            last_update_time: Utc::now().format("%Y-%m").to_string(),
        })
    } else {
        None
    };

    Ok(NewAppleDeviceAttestation {
        vault_id,
        metadata: AppleDeviceMetadata {
            model: attested_metadata.model,
            os: attested_metadata.os,
        },
        receipt,
        raw_attestation: attestation_data,
        webauthn_cred_public_key: attested_metadata
            .webauthn_public_key
            .map(base64::decode)
            .transpose()?,
        is_development: server_receipt.is_sandbox,
        attested_key_id: verified_attest.att_key_id,
        attested_public_key: verified_attest.att_public_key,
        receipt_type: match server_receipt.receipt_type {
            app_attest::apple::device_check::ReceiptType::Attest => {
                newtypes::AppleAttestationReceiptType::Attest
            }
            app_attest::apple::device_check::ReceiptType::Receipt => {
                newtypes::AppleAttestationReceiptType::Receipt
            }
        },
        receipt_risk_metric: server_receipt.risk_metric,
        receipt_expiration: server_receipt.expiration_time,
        receipt_creation: server_receipt.creation_time,
        receipt_not_before: server_receipt.not_before,
        dc_token: attested_metadata.device_check_token,
        dc_bit0: bits.as_ref().map(|b| b.bit0),
        dc_bit1: bits.as_ref().map(|b| b.bit1),
        dc_last_updated: bits.map(|b| b.last_update_time),
    })
}
